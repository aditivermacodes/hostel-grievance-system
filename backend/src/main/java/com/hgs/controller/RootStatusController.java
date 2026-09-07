package com.hgs.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class RootStatusController {

    @GetMapping({"/", "/api", "/api/status"})
    public ResponseEntity<Map<String, Object>> getSystemStatus() {
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("service", "Hostel Grievance System (HGS) API");
        status.put("status", "UP");
        status.put("message", "Backend REST API is operational. Access the Web UI at http://localhost:3000");
        status.put("publicEndpoints", Arrays.asList(
                "POST /api/complaints",
                "GET /api/complaints/track/{complaintCode}",
                "GET /api/hostels",
                "GET /api/categories",
                "GET /api/media/{folder}/{filename}"
        ));
        status.put("adminAuthEndpoint", "POST /api/auth/login");
        return ResponseEntity.ok(status);
    }
}
