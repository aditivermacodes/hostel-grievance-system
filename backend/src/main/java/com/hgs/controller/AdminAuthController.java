package com.hgs.controller;

import com.hgs.domain.AdminUser;
import com.hgs.dto.request.AdminLoginRequest;
import com.hgs.dto.response.AuthResponse;
import com.hgs.service.AdminAuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    public AdminAuthController(AdminAuthService adminAuthService) {
        this.adminAuthService = adminAuthService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AdminLoginRequest request) {
        AuthResponse response = adminAuthService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentAdmin(@AuthenticationPrincipal AdminUser adminUser) {
        Map<String, Object> details = new HashMap<>();
        details.put("id", adminUser.getId());
        details.put("username", adminUser.getUsername());
        details.put("fullName", adminUser.getFullName());
        details.put("email", adminUser.getEmail());
        return ResponseEntity.ok(details);
    }
}
