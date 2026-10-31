package com.elmakaoui.incidents.dtos;

public record AdminStatisticsResponse(
        long totalUsers,
        long employees,
        long technicians,
        long admins,
        long totalIncidents,
        long openIncidents,
        long assignedIncidents,
        long inProgressIncidents,
        long resolvedIncidents,
        long closedIncidents
) {}