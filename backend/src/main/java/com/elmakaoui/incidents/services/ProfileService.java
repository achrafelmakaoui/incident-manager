package com.elmakaoui.incidents.services;

import com.elmakaoui.incidents.dtos.ChangePasswordRequest;
import com.elmakaoui.incidents.dtos.ProfileUpdateResponse;
import com.elmakaoui.incidents.dtos.UpdateProfileRequest;
import com.elmakaoui.incidents.dtos.UserResponse;
import com.elmakaoui.incidents.entities.User;
import com.elmakaoui.incidents.exceptions.BusinessException;
import com.elmakaoui.incidents.exceptions.EmailAlreadyUsedException;
import com.elmakaoui.incidents.repositories.UserRepository;
import com.elmakaoui.incidents.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional(readOnly = true)
    public UserResponse getProfile() {
        return UserResponse.from(currentUserService.getCurrentUser());
    }

    @Transactional
    public ProfileUpdateResponse updateProfile(UpdateProfileRequest request) {
        User user = currentUserService.getCurrentUser();
        String newEmail = request.email().trim().toLowerCase();

        if (!newEmail.equals(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
            throw new EmailAlreadyUsedException("Cet email est déjà utilisé");
        }

        user.setFullName(request.fullName().trim());
        user.setEmail(newEmail);

        return new ProfileUpdateResponse(UserResponse.from(user), jwtService.generateAccessToken(user));
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = currentUserService.getCurrentUser();

        if (!passwordEncoder.matches(request.oldPassword(), user.getPassword())) {
            throw new BusinessException("L'ancien mot de passe est incorrect");
        }
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new BusinessException("La confirmation ne correspond pas au nouveau mot de passe");
        }
        if (passwordEncoder.matches(request.newPassword(), user.getPassword())) {
            throw new BusinessException("Le nouveau mot de passe doit être différent de l'ancien");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
    }
}