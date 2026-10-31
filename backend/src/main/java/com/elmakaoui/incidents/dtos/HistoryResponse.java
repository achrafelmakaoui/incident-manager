package com.elmakaoui.incidents.dtos;

import com.elmakaoui.incidents.entities.IncidentHistory;
import com.elmakaoui.incidents.enums.Status;

import java.time.LocalDateTime;

public record HistoryResponse(
        Long id,
        String action,
        Status oldStatus,
        Status newStatus,
        String performedBy,
        LocalDateTime createdAt
) {
    public static HistoryResponse from(IncidentHistory h) {
        return new HistoryResponse(
                h.getId(), h.getAction(), h.getOldStatus(), h.getNewStatus(),
                h.getPerformedBy().getFullName(), h.getCreatedAt());
    }
}