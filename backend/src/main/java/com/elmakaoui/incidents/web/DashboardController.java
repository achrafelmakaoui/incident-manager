package com.elmakaoui.incidents.web;

import com.elmakaoui.incidents.dtos.EmployeeDashboardResponse;
import com.elmakaoui.incidents.dtos.TechnicianDashboardResponse;
import com.elmakaoui.incidents.services.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/employee")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public EmployeeDashboardResponse employee() {
        return dashboardService.employeeDashboard();
    }

    @GetMapping("/technician")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public TechnicianDashboardResponse technician() {
        return dashboardService.technicianDashboard();
    }
}