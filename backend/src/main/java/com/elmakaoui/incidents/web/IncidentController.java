package com.elmakaoui.incidents.web;

import com.elmakaoui.incidents.dtos.CreateIncidentRequest;
import com.elmakaoui.incidents.dtos.IncidentDetailsResponse;
import com.elmakaoui.incidents.dtos.IncidentResponse;
import com.elmakaoui.incidents.services.IncidentService;
import com.elmakaoui.incidents.dtos.CommentResponse;
import com.elmakaoui.incidents.dtos.CreateCommentRequest;
import com.elmakaoui.incidents.dtos.UpdateStatusRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
public class IncidentController {

    private final IncidentService incidentService;

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<IncidentResponse> create(@Valid @RequestBody CreateIncidentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(incidentService.create(request));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public List<IncidentResponse> myIncidents() {
        return incidentService.getMyIncidents();
    }

    @GetMapping("/assigned")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public List<IncidentResponse> assignedIncidents() {
        return incidentService.getAssignedIncidents();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<IncidentResponse> allIncidents() {
        return incidentService.getAllIncidents();
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public IncidentDetailsResponse details(@PathVariable Long id) {
        return incidentService.getDetails(id);
    }

    @PutMapping("/{id}/assign/{technicianId}")
    @PreAuthorize("hasRole('ADMIN')")
    public IncidentResponse assign(@PathVariable Long id, @PathVariable Long technicianId) {
        return incidentService.assign(id, technicianId);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN')")
    public IncidentResponse updateStatus(@PathVariable Long id,
                                         @Valid @RequestBody UpdateStatusRequest request) {
        return incidentService.updateStatus(id, request);
    }

    @PostMapping("/{id}/comments")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN')")
    public ResponseEntity<CommentResponse> addComment(@PathVariable Long id,
                                                      @Valid @RequestBody CreateCommentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(incidentService.addComment(id, request));
    }
}