package com.hgs.controller;

import com.hgs.dto.request.ComplaintSubmitRequest;
import com.hgs.dto.response.ComplaintPublicResponse;
import com.hgs.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/complaints")
public class PublicComplaintController {

    private final ComplaintService complaintService;

    public PublicComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ComplaintPublicResponse> submitComplaint(
            @Valid @ModelAttribute ComplaintSubmitRequest request,
            @RequestParam(value = "photo", required = false) MultipartFile photo) {

        ComplaintPublicResponse response = complaintService.submitComplaint(request, photo);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/track/{complaintCode}")
    public ResponseEntity<ComplaintPublicResponse> trackComplaint(@PathVariable String complaintCode) {
        ComplaintPublicResponse response = complaintService.trackComplaint(complaintCode);
        return ResponseEntity.ok(response);
    }
}
