package com.elmakaoui.incidents.dtos;

public record AuthResponse(
        String token,
        String refreshToken,
        String role,
        String fullName
) {}