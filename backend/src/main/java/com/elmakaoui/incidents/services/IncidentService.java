package com.elmakaoui.incidents.services;

import com.elmakaoui.incidents.dtos.*;
import com.elmakaoui.incidents.entities.Incident;
import com.elmakaoui.incidents.entities.IncidentHistory;
import com.elmakaoui.incidents.entities.User;
import com.elmakaoui.incidents.enums.Status;
import com.elmakaoui.incidents.exceptions.ResourceNotFoundException;
import com.elmakaoui.incidents.repositories.IncidentCommentRepository;
import com.elmakaoui.incidents.repositories.IncidentHistoryRepository;
import com.elmakaoui.incidents.repositories.IncidentRepository;
import com.elmakaoui.incidents.entities.IncidentComment;
import com.elmakaoui.incidents.enums.Role;
import com.elmakaoui.incidents.exceptions.BusinessException;
import com.elmakaoui.incidents.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final IncidentHistoryRepository historyRepository;
    private final IncidentCommentRepository commentRepository;
    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;

    // Allowed manual status changes. ASSIGNED is only reached through assign().
    private static final Map<Status, Set<Status>> ALLOWED_TRANSITIONS = Map.of(
            Status.OPEN,        Set.of(Status.IN_PROGRESS),
            Status.ASSIGNED,    Set.of(Status.IN_PROGRESS),
            Status.IN_PROGRESS, Set.of(Status.RESOLVED),
            Status.RESOLVED,    Set.of(Status.IN_PROGRESS, Status.CLOSED),
            Status.CLOSED,      Set.of()                       // final: business rule 8
    );

    // EMPLOYEE
    @Transactional
    public IncidentResponse create(CreateIncidentRequest request) {
        User current = currentUserService.getCurrentUser();

        Incident incident = Incident.builder()
                .title(request.title().trim())
                .description(request.description().trim())
                .category(request.category())
                .priority(request.priority())
                // set by the server, never by the client
                .status(Status.OPEN)
                // the owner is ALWAYS the logged-in user
                .createdBy(current)
                .build();
        incidentRepository.save(incident);

        addHistory(incident, "Incident créé", null, Status.OPEN, current);
        return IncidentResponse.from(incident);
    }

    @Transactional(readOnly = true)
    public List<IncidentResponse> getMyIncidents() {
        String email = currentUserService.getCurrentEmail();
        return incidentRepository.findByCreatedByEmailOrderByCreatedAtDesc(email)
                .stream().map(IncidentResponse::from).toList();
    }

    // TECHNICIAN
    @Transactional(readOnly = true)
    public List<IncidentResponse> getAssignedIncidents() {
        String email = currentUserService.getCurrentEmail();
        return incidentRepository.findByAssignedToEmailOrderByCreatedAtDesc(email)
                .stream().map(IncidentResponse::from).toList();
    }

    // ADMIN
    @Transactional(readOnly = true)
    public List<IncidentResponse> getAllIncidents() {
        return incidentRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(IncidentResponse::from).toList();
    }

    // SHARED: details with ownership check
    @Transactional(readOnly = true)
    public IncidentDetailsResponse getDetails(Long id) {
        Incident incident = findIncident(id);
        User current = currentUserService.getCurrentUser();

        checkCanView(incident, current);

        List<HistoryResponse> history = historyRepository.findByIncidentIdOrderByCreatedAtAsc(id)
                .stream().map(HistoryResponse::from).toList();
        List<CommentResponse> comments = commentRepository.findByIncidentIdOrderByCreatedAtAsc(id)
                .stream().map(CommentResponse::from).toList();

        return new IncidentDetailsResponse(IncidentResponse.from(incident), history, comments);
    }

    // ---------- ADMIN: assign a technician ----------

    @Transactional
    public IncidentResponse assign(Long incidentId, Long technicianId) {
        Incident incident = findIncident(incidentId);
        User admin = currentUserService.getCurrentUser();

        if (incident.getStatus() == Status.CLOSED) {
            throw new BusinessException("Un incident clôturé ne peut plus être affecté");
        }

        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technicien introuvable"));

        if (technician.getRole() != Role.TECHNICIAN || !technician.isEnabled()) {
            throw new BusinessException("L'utilisateur choisi n'est pas un technicien actif");
        }

        User previous = incident.getAssignedTo();
        if (isSameUser(previous, technician)) {
            throw new BusinessException("Cet incident est déjà affecté à ce technicien");
        }

        incident.setAssignedTo(technician);

        String action = previous == null
                ? "Affecté à " + technician.getFullName()
                : "Réaffecté de " + previous.getFullName() + " à " + technician.getFullName();

        Status oldStatus = incident.getStatus();
        if (oldStatus == Status.OPEN) {
            incident.setStatus(Status.ASSIGNED);   // delete this line to keep OPEN after assignment
        }

        addHistory(incident, action, oldStatus,
                oldStatus != incident.getStatus() ? incident.getStatus() : null, admin);

        return IncidentResponse.from(incident);
    }

    // ---------- TECHNICIAN / ADMIN: change status ----------

    @Transactional
    public IncidentResponse updateStatus(Long incidentId, UpdateStatusRequest request) {
        Incident incident = findIncident(incidentId);
        User current = currentUserService.getCurrentUser();

        checkCanModify(incident, current);          // business rule 5

        Status oldStatus = incident.getStatus();
        Status newStatus = request.status();

        if (oldStatus == Status.CLOSED) {
            throw new BusinessException("Cet incident est clôturé, son statut ne peut plus être modifié");
        }
        if (newStatus == Status.ASSIGNED) {
            throw new BusinessException("Le statut ASSIGNED est défini automatiquement lors de l'affectation");
        }
        if (!ALLOWED_TRANSITIONS.get(oldStatus).contains(newStatus)) {
            throw new BusinessException("Transition non autorisée : " + oldStatus + " -> " + newStatus);
        }
        if (incident.getAssignedTo() == null) {
            throw new BusinessException("Un technicien doit être affecté avant de traiter l'incident");
        }

        incident.setStatus(newStatus);
        addHistory(incident, oldStatus + " -> " + newStatus, oldStatus, newStatus, current);

        return IncidentResponse.from(incident);
    }

    // ---------- TECHNICIAN / ADMIN: treatment notes ----------

    @Transactional
    public CommentResponse addComment(Long incidentId, CreateCommentRequest request) {
        Incident incident = findIncident(incidentId);
        User current = currentUserService.getCurrentUser();

        checkCanModify(incident, current);

        if (incident.getStatus() == Status.CLOSED) {
            throw new BusinessException("Impossible d'ajouter une note à un incident clôturé");
        }

        IncidentComment comment = commentRepository.save(IncidentComment.builder()
                .incident(incident)
                .author(current)
                .content(request.content().trim())
                .build());

        return CommentResponse.from(comment);
    }

    // Helpers
    private Incident findIncident(Long id) {
        return incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident introuvable"));
    }

    /**
     * ADMIN sees everything.
     * EMPLOYEE only sees incidents they created (business rule 4).
     * TECHNICIAN only sees incidents assigned to them.
     */
    private void checkCanView(Incident incident, User current) {
        switch (current.getRole()) {
            case ADMIN -> { /* full access */ }
            case EMPLOYEE -> {
                if (!isSameUser(incident.getCreatedBy(), current)) {
                    throw new AccessDeniedException("Cet incident ne vous appartient pas");
                }
            }
            case TECHNICIAN -> {
                if (!isSameUser(incident.getAssignedTo(), current)) {
                    throw new AccessDeniedException("Cet incident ne vous est pas affecté");
                }
            }
        }
    }

    /**
     * ADMIN can act on any incident.
     * TECHNICIAN only on incidents assigned to him (business rule 5).
     * EMPLOYEE never (already blocked by @PreAuthorize; this is defence in depth).
     */
    private void checkCanModify(Incident incident, User current) {
        switch (current.getRole()) {
            case ADMIN -> { /* full access */ }
            case TECHNICIAN -> {
                if (!isSameUser(incident.getAssignedTo(), current)) {
                    throw new AccessDeniedException("Cet incident ne vous est pas affecté");
                }
            }
            case EMPLOYEE -> throw new AccessDeniedException("Action réservée aux techniciens et administrateurs");
        }
    }

    private boolean isSameUser(User a, User b) {
        return a != null && b != null && a.getId().equals(b.getId());
    }

    private void addHistory(Incident incident, String action, Status oldStatus, Status newStatus, User by) {
        historyRepository.save(IncidentHistory.builder()
                .incident(incident)
                .action(action)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .performedBy(by)
                .build());
    }
}