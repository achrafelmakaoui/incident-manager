package com.elmakaoui.incidents.services;

import com.elmakaoui.incidents.dtos.AuthResponse;
import com.elmakaoui.incidents.dtos.LoginRequest;
import com.elmakaoui.incidents.dtos.RegisterRequest;
import com.elmakaoui.incidents.entities.User;
import com.elmakaoui.incidents.enums.Role;
import com.elmakaoui.incidents.exceptions.EmailAlreadyUsedException;
import com.elmakaoui.incidents.exceptions.ResourceNotFoundException;
import com.elmakaoui.incidents.repositories.UserRepository;
import com.elmakaoui.incidents.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalize(request.email());

        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyUsedException("Cet email est déjà utilisé");
        }

        User user = User.builder()
                .fullName(request.fullName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.password()))   // store the hash only
                .role(Role.EMPLOYEE)
                .build();

        userRepository.save(user);
        return toAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        String email = normalize(request.email());

        // Checks the password with BCrypt AND the enabled flag.
        // Throws BadCredentialsException or DisabledException -> handled by GlobalExceptionHandler.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.password()));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        return toAuthResponse(user);
    }

    private AuthResponse toAuthResponse(User user) {
        return new AuthResponse(
                jwtService.generateAccessToken(user),
                user.getRole().name(),
                user.getFullName());
    }

    private String normalize(String email) {
        return email.trim().toLowerCase();
    }
}