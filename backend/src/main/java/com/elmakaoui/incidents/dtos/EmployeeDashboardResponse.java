package com.elmakaoui.incidents.dtos;

import java.util.List;

public record EmployeeDashboardResponse(
        long totalIncidents,
        long openIncidents,
        long inProgressIncidents,
        long resolvedOrClosedIncidents,
        List<IncidentResponse> latestIncidents
) {}