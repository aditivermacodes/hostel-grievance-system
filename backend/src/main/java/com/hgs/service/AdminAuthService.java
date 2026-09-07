package com.hgs.service;

import com.hgs.config.JwtTokenProvider;
import com.hgs.domain.AdminUser;
import com.hgs.dto.request.AdminLoginRequest;
import com.hgs.dto.response.AuthResponse;
import com.hgs.exception.ResourceNotFoundException;
import com.hgs.repository.AdminUserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminAuthService {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final long expirationHours;

    public AdminAuthService(
            AdminUserRepository adminUserRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider,
            @Value("${app.jwt.expiration-hours:24}") long expirationHours) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.expirationHours = expirationHours;
    }

    @Transactional(readOnly = true)
    public AuthResponse login(AdminLoginRequest request) {
        AdminUser admin = adminUserRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password."));

        if (!passwordEncoder.matches(request.getPassword(), admin.getPasswordHash())) {
            throw new BadCredentialsException("Invalid username or password.");
        }

        String token = jwtTokenProvider.generateToken(admin.getUsername(), admin.getId(), admin.getEmail());

        return new AuthResponse(
                token,
                admin.getUsername(),
                admin.getFullName() != null ? admin.getFullName() : admin.getUsername(),
                admin.getEmail(),
                expirationHours
        );
    }

    @Transactional(readOnly = true)
    public AdminUser getAdminByUsername(String username) {
        return adminUserRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found: " + username));
    }
}
