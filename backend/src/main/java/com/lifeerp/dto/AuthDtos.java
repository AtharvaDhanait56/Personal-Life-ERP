package com.lifeerp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDtos {
    private AuthDtos() {
    }

    public record RegisterRequest(
            @NotBlank String fullName,
            @Email @NotBlank String email,
            @Size(min = 8, max = 80) String password) {
    }

    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {
    }

    public record AuthResponse(String accessToken, String refreshToken, UserProfile profile) {
    }

    public record UserProfile(Long id, String fullName, String email, String role, boolean darkMode) {
    }

    public record ChangePasswordRequest(@NotBlank String currentPassword, @Size(min = 8, max = 80) String newPassword) {
    }
}

