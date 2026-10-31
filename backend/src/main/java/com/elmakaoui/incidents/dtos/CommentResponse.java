package com.elmakaoui.incidents.dtos;

import com.elmakaoui.incidents.entities.IncidentComment;

import java.time.LocalDateTime;

public record CommentResponse(
        Long id,
        String content,
        String authorName,
        String authorRole,
        LocalDateTime createdAt
) {
    public static CommentResponse from(IncidentComment c) {
        return new CommentResponse(
                c.getId(), c.getContent(),
                c.getAuthor().getFullName(), c.getAuthor().getRole().name(),
                c.getCreatedAt());
    }
}