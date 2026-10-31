package com.elmakaoui.incidents.config;

import com.elmakaoui.incidents.entities.User;
import com.elmakaoui.incidents.enums.Role;
import com.elmakaoui.incidents.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createIfMissing("Administrateur",  "admin@incidents.ma",     "Admin@123",    Role.ADMIN,      true);
        createIfMissing("Technicien A",    "tech1@incidents.ma",     "Tech@1234",    Role.TECHNICIAN, true);
        createIfMissing("Technicien B",    "tech2@incidents.ma",     "Tech@1234",    Role.TECHNICIAN, true);
        createIfMissing("Ahmed Benali",    "employee1@incidents.ma", "Employee@123", Role.EMPLOYEE,   true);
        createIfMissing("Sara Alaoui",     "employee2@incidents.ma", "Employee@123", Role.EMPLOYEE,   true);
        createIfMissing("Compte Désactivé","disabled@incidents.ma",  "Disabled@123", Role.EMPLOYEE,   false);
    }

    private void createIfMissing(String fullName, String email, String rawPassword, Role role, boolean enabled) {
        if (userRepository.existsByEmail(email)) {
            return;
        }
        userRepository.save(User.builder()
                .fullName(fullName)
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .role(role)
                .enabled(enabled)
                .build());
    }
}