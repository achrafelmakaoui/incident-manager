package com.elmakaoui.incidents.dtos;

public record ProfileUpdateResponse(
        UserResponse user,
        String token
) {}