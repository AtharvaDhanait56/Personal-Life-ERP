package com.lifeerp.service;

import com.lifeerp.dto.AuthDtos.AuthResponse;
import com.lifeerp.dto.AuthDtos.ChangePasswordRequest;
import com.lifeerp.dto.AuthDtos.LoginRequest;
import com.lifeerp.dto.AuthDtos.RegisterRequest;
import com.lifeerp.dto.AuthDtos.UserProfile;
import com.lifeerp.entity.User;
import com.lifeerp.exception.ApiException;
import com.lifeerp.repository.UserRepository;
import com.lifeerp.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final CurrentUserService currentUserService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService,
                       CurrentUserService currentUserService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email is already registered");
        }
        User user = new User();
        user.setFullName(request.fullName());
        user.setEmail(request.email().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        userRepository.save(user);
        return authResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email().toLowerCase())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        return authResponse(user);
    }

    public UserProfile profile() {
        return profile(currentUserService.user());
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = currentUserService.user();
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
    }

    private AuthResponse authResponse(User user) {
        return new AuthResponse(jwtService.accessToken(user), jwtService.refreshToken(user), profile(user));
    }

    private UserProfile profile(User user) {
        return new UserProfile(user.getId(), user.getFullName(), user.getEmail(), user.getRole(), user.isDarkMode());
    }
}

