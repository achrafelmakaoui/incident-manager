package com.elmakaoui.incidents.web;

import com.elmakaoui.incidents.dtos.AdminStatisticsResponse;
import com.elmakaoui.incidents.dtos.UserResponse;
import com.elmakaoui.incidents.dtos.UserSummary;
import com.elmakaoui.incidents.services.AdminService;
import com.elmakaoui.incidents.services.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final DashboardService dashboardService;

    @GetMapping("/users")
    public List<UserResponse> users() {
        return adminService.getAllUsers();
    }

    @GetMapping("/technicians")
    public List<UserSummary> technicians() {
        return adminService.getActiveTechnicians();
    }

    @PutMapping("/users/{id}/enable")
    public UserResponse enable(@PathVariable Long id) {
        return adminService.enableUser(id);
    }

    @PutMapping("/users/{id}/disable")
    public UserResponse disable(@PathVariable Long id) {
        return adminService.disableUser(id);
    }

    @GetMapping("/statistics")
    public AdminStatisticsResponse statistics() {
        return dashboardService.adminStatistics();
    }
}