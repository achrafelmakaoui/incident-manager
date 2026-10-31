package com.elmakaoui.incidents.web;

import com.elmakaoui.incidents.dtos.ChangePasswordRequest;
import com.elmakaoui.incidents.dtos.ProfileUpdateResponse;
import com.elmakaoui.incidents.dtos.UpdateProfileRequest;
import com.elmakaoui.incidents.dtos.UserResponse;
import com.elmakaoui.incidents.services.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public UserResponse getProfile() {
        return profileService.getProfile();
    }

    @PutMapping
    public ProfileUpdateResponse updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return profileService.updateProfile(request);
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        profileService.changePassword(request);
        return ResponseEntity.noContent().build();
    }
}