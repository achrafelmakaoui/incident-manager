package com.elmakaoui.incidents.services;

import com.elmakaoui.incidents.dtos.AdminStatisticsResponse;
import com.elmakaoui.incidents.dtos.EmployeeDashboardResponse;
import com.elmakaoui.incidents.dtos.IncidentResponse;
import com.elmakaoui.incidents.dtos.TechnicianDashboardResponse;
import com.elmakaoui.incidents.enums.Priority;
import com.elmakaoui.incidents.enums.Role;
import com.elmakaoui.incidents.enums.Status;
import com.elmakaoui.incidents.repositories.IncidentRepository;
import com.elmakaoui.incidents.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private static final List<Status> DONE = List.of(Status.RESOLVED, Status.CLOSED);

    private final IncidentRepository incidentRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    public EmployeeDashboardResponse employeeDashboard() {
        String email = currentUserService.getCurrentEmail();
        return new EmployeeDashboardResponse(
                incidentRepository.countByCreatedByEmail(email),
                incidentRepository.countByCreatedByEmailAndStatus(email, Status.OPEN),
                incidentRepository.countByCreatedByEmailAndStatus(email, Status.IN_PROGRESS),
                incidentRepository.countByCreatedByEmailAndStatusIn(email, DONE),
                incidentRepository.findTop5ByCreatedByEmailOrderByCreatedAtDesc(email)
                        .stream().map(IncidentResponse::from).toList());
    }

    public TechnicianDashboardResponse technicianDashboard() {
        String email = currentUserService.getCurrentEmail();
        return new TechnicianDashboardResponse(
                incidentRepository.countByAssignedToEmail(email),
                incidentRepository.countByAssignedToEmailAndPriority(email, Priority.CRITICAL),
                incidentRepository.countByAssignedToEmailAndStatus(email, Status.IN_PROGRESS),
                incidentRepository.countByAssignedToEmailAndStatusIn(email, DONE));
    }

    public AdminStatisticsResponse adminStatistics() {
        return new AdminStatisticsResponse(
                userRepository.count(),
                userRepository.countByRole(Role.EMPLOYEE),
                userRepository.countByRole(Role.TECHNICIAN),
                userRepository.countByRole(Role.ADMIN),
                incidentRepository.count(),
                incidentRepository.countByStatus(Status.OPEN),
                incidentRepository.countByStatus(Status.ASSIGNED),
                incidentRepository.countByStatus(Status.IN_PROGRESS),
                incidentRepository.countByStatus(Status.RESOLVED),
                incidentRepository.countByStatus(Status.CLOSED));
    }
}