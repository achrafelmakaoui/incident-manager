package com.elmakaoui.incidents.dtos;

public record AuthResponse(
        String token,
        String role,
        String fullName
) {}