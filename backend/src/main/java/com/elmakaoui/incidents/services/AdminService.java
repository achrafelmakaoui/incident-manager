package com.elmakaoui.incidents.services;

import com.elmakaoui.incidents.dtos.UserResponse;
import com.elmakaoui.incidents.dtos.UserSummary;
import com.elmakaoui.incidents.entities.User;
import com.elmakaoui.incidents.enums.Role;
import com.elmakaoui.incidents.exceptions.BusinessException;
import com.elmakaoui.incidents.exceptions.ResourceNotFoundException;
import com.elmakaoui.incidents.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))
                .stream().map(UserResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<UserSummary> getActiveTechnicians() {
        return userRepository.findByRoleAndEnabledTrueOrderByFullNameAsc(Role.TECHNICIAN)
                .stream().map(UserSummary::from).toList();
    }

    @Transactional
    public UserResponse enableUser(Long id) {
        User user = findUser(id);
        user.setEnabled(true);
        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse disableUser(Long id) {
        User user = findUser(id);
        User admin = currentUserService.getCurrentUser();

        if (user.getId().equals(admin.getId())) {
            throw new BusinessException("Vous ne pouvez pas désactiver votre propre compte");
        }

        user.setEnabled(false);
        return UserResponse.from(user);
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
    }
}