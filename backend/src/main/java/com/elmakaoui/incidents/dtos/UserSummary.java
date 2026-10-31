package com.elmakaoui.incidents.dtos;

import com.elmakaoui.incidents.entities.User;

public record UserSummary(Long id, String fullName, String email) {

    public static UserSummary from(User user) {
        return user == null ? null : new UserSummary(user.getId(), user.getFullName(), user.getEmail());
    }
}