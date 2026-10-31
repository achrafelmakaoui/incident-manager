package com.elmakaoui.incidents.dtos;

public record TechnicianDashboardResponse(
        long assignedIncidents,
        long criticalIncidents,
        long inProgressIncidents,
        long resolvedIncidents
) {}