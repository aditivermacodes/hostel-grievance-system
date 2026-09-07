package com.hgs.controller;

import com.hgs.domain.AdminUser;
import com.hgs.domain.enums.ComplaintStatus;
import com.hgs.domain.enums.LocationType;
import com.hgs.dto.request.StatusUpdateRequest;
import com.hgs.dto.response.ComplaintAdminResponse;
import com.hgs.dto.response.PageResponse;
import com.hgs.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;

@RestController
@RequestMapping("/api/admin/complaints")
public class AdminComplaintController {

    private final ComplaintService complaintService;

    public AdminComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @GetMapping
    public ResponseEntity<PageResponse<ComplaintAdminResponse>> getComplaints(
            @RequestParam(required = false) Long hostelId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(required = false) LocationType locationType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "submittedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = "asc".equalsIgnoreCase(direction) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, Math.min(size, 100)), sort);

        PageResponse<ComplaintAdminResponse> response = complaintService.searchAdminComplaints(
                hostelId, categoryId, status, locationType, from, to, search, pageable);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComplaintAdminResponse> getComplaintById(@PathVariable Long id) {
        ComplaintAdminResponse response = complaintService.getAdminComplaint(id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ComplaintAdminResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request,
            @AuthenticationPrincipal AdminUser admin) {

        ComplaintAdminResponse response = complaintService.updateStatus(id, request, admin);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/{id}/complete", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ComplaintAdminResponse> completeComplaint(
            @PathVariable Long id,
            @RequestParam("remarks") String remarks,
            @RequestParam(value = "photo", required = false) MultipartFile photo,
            @AuthenticationPrincipal AdminUser admin) {

        ComplaintAdminResponse response = complaintService.completeComplaint(id, remarks, photo, admin);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/resend-notification")
    public ResponseEntity<ComplaintAdminResponse> resendNotification(
            @PathVariable Long id,
            @AuthenticationPrincipal AdminUser admin) {

        ComplaintAdminResponse response = complaintService.resendNotification(id, admin);
        return ResponseEntity.ok(response);
    }
}
