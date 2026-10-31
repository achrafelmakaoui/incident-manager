package com.elmakaoui.incidents.web;

import com.elmakaoui.incidents.dtos.CreateIncidentRequest;
import com.elmakaoui.incidents.dtos.IncidentDetailsResponse;
import com.elmakaoui.incidents.dtos.IncidentResponse;
import com.elmakaoui.incidents.services.IncidentService;
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
}