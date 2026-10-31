package com.elmakaoui.incidents.dtos;

import com.elmakaoui.incidents.entities.Incident;
import com.elmakaoui.incidents.enums.Category;
import com.elmakaoui.incidents.enums.Priority;
import com.elmakaoui.incidents.enums.Status;

import java.time.LocalDateTime;

public record IncidentResponse(
        Long id,
        String title,
        String description,
        Category category,
        Priority priority,
        Status status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        UserSummary createdBy,
        UserSummary assignedTo
) {
    public static IncidentResponse from(Incident i) {
        return new IncidentResponse(
                i.getId(), i.getTitle(), i.getDescription(),
                i.getCategory(), i.getPriority(), i.getStatus(),
                i.getCreatedAt(), i.getUpdatedAt(),
                UserSummary.from(i.getCreatedBy()),
                UserSummary.from(i.getAssignedTo()));
    }
}