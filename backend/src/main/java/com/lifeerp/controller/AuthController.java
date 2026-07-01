package com.lifeerp.controller;

import com.lifeerp.dto.AuthDtos.AuthResponse;
import com.lifeerp.dto.AuthDtos.ChangePasswordRequest;
import com.lifeerp.dto.AuthDtos.LoginRequest;
import com.lifeerp.dto.AuthDtos.RegisterRequest;
import com.lifeerp.dto.AuthDtos.UserProfile;
import com.lifeerp.service.AuthService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public UserProfile me() {
        return authService.profile();
    }

    @PatchMapping("/password")
    public Map<String, String> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(request);
        return Map.of("status", "changed");
    }

    @PostMapping("/forgot-password")
    public Map<String, String> forgotPassword() {
        return Map.of("status", "password reset workflow accepted");
    }

    @PostMapping("/verify-email")
    public Map<String, String> verifyEmail() {
        return Map.of("status", "email verification workflow accepted");
    }
}

