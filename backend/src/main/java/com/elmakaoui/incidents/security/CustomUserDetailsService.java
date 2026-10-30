package com.elmakaoui.incidents.security;

import com.elmakaoui.incidents.entities.User;
import com.elmakaoui.incidents.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable"));

        // Full name needed: Spring has its own class called User, which clashes with our entity
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())           // the BCrypt hash
                .roles(user.getRole().name())           // "ADMIN" becomes the authority "ROLE_ADMIN"
                .disabled(!user.isEnabled())
                .build();
    }
}