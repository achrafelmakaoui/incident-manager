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
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final IncidentHistoryRepository historyRepository;
    private final IncidentCommentRepository commentRepository;
    private final CurrentUserService currentUserService;

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