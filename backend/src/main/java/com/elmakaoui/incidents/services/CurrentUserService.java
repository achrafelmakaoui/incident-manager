package com.elmakaoui.incidents.services;

import com.elmakaoui.incidents.entities.User;
import com.elmakaoui.incidents.exceptions.ResourceNotFoundException;
import com.elmakaoui.incidents.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UserRepository userRepository;

    // mail of the user making the current request, as set by JwtFilter.
    public String getCurrentEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            throw new AuthenticationCredentialsNotFoundException("Authentification requise");
        }
        return auth.getName();
    }

    // The full User entity of the current request.
    public User getCurrentUser() {
        return userRepository.findByEmail(getCurrentEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
    }
}