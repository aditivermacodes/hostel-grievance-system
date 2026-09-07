package com.hgs.service;

import com.hgs.domain.*;
import com.hgs.domain.enums.ComplaintStatus;
import com.hgs.domain.enums.LocationType;
import com.hgs.dto.request.ComplaintSubmitRequest;
import com.hgs.dto.request.StatusUpdateRequest;
import com.hgs.dto.response.*;
import com.hgs.exception.InvalidFileException;
import com.hgs.exception.InvalidStatusTransitionException;
import com.hgs.exception.ResourceNotFoundException;
import com.hgs.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final HostelRepository hostelRepository;
    private final CategoryRepository categoryRepository;
    private final ComplaintStatusHistoryRepository statusHistoryRepository;
    private final ComplaintCompletionRepository completionRepository;
    private final NotificationLogRepository notificationLogRepository;
    private final FileStorageService fileStorageService;
    private final EmailService emailService;
    private final IdGenerationService idGenerationService;

    public ComplaintService(
            ComplaintRepository complaintRepository,
            HostelRepository hostelRepository,
            CategoryRepository categoryRepository,
            ComplaintStatusHistoryRepository statusHistoryRepository,
            ComplaintCompletionRepository completionRepository,
            NotificationLogRepository notificationLogRepository,
            FileStorageService fileStorageService,
            EmailService emailService,
            IdGenerationService idGenerationService) {
        this.complaintRepository = complaintRepository;
        this.hostelRepository = hostelRepository;
        this.categoryRepository = categoryRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.completionRepository = completionRepository;
        this.notificationLogRepository = notificationLogRepository;
        this.fileStorageService = fileStorageService;
        this.emailService = emailService;
        this.idGenerationService = idGenerationService;
    }

    @Transactional
    public ComplaintPublicResponse submitComplaint(ComplaintSubmitRequest request, MultipartFile photo) {
        Hostel hostel = hostelRepository.findById(request.getHostelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hostel not found with ID: " + request.getHostelId()));

        if (!hostel.isActive()) {
            throw new IllegalArgumentException("Selected hostel is currently inactive.");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId()));

        if (!category.isActive()) {
            throw new IllegalArgumentException("Selected category is currently inactive.");
        }

        String photoUrl = null;
        if (photo != null && !photo.isEmpty()) {
            photoUrl = fileStorageService.storeFile(photo, "complaints");
        }

        String complaintCode = idGenerationService.generateComplaintCode();

        Complaint complaint = new Complaint();
        complaint.setComplaintCode(complaintCode);
        complaint.setStudentName(request.getStudentName().trim());
        complaint.setStudentEmail(request.getStudentEmail().trim().toLowerCase());
        complaint.setHostel(hostel);
        complaint.setLocationType(request.getLocationType());
        complaint.setLocationDetail(request.getLocationDetail().trim());
        complaint.setCategory(category);
        complaint.setDescription(request.getDescription().trim());
        complaint.setPhotoUrl(photoUrl);
        complaint.setStatus(ComplaintStatus.SUBMITTED);
        complaint.setSubmittedAt(Instant.now());
        complaint.setCreatedAt(Instant.now());
        complaint.setUpdatedAt(Instant.now());

        ComplaintStatusHistory initialHistory = new ComplaintStatusHistory(
                complaint,
                null,
                ComplaintStatus.SUBMITTED,
                "Student / System",
                "Complaint successfully submitted."
        );
        complaint.addStatusHistory(initialHistory);

        Complaint savedComplaint = complaintRepository.save(complaint);

        // Send submission email safely (failure does not roll back transaction)
        try {
            emailService.sendSubmissionConfirmation(savedComplaint);
        } catch (Exception emailEx) {
            org.slf4j.LoggerFactory.getLogger(ComplaintService.class)
                    .error("Unexpected error during submission email dispatch: {}", emailEx.getMessage(), emailEx);
        }

        return mapToPublicResponse(savedComplaint);
    }

    @Transactional(readOnly = true)
    public ComplaintPublicResponse trackComplaint(String complaintCode) {
        if (!StringUtils.hasText(complaintCode)) {
            throw new IllegalArgumentException("Complaint ID must not be blank.");
        }

        String normalizedCode = complaintCode.trim().toUpperCase();
        Complaint complaint = complaintRepository.findByComplaintCode(normalizedCode)
                .orElseThrow(() -> new ResourceNotFoundException("No grievance found with Complaint ID: " + normalizedCode));

        return mapToPublicResponse(complaint);
    }

    @Transactional(readOnly = true)
    public PageResponse<ComplaintAdminResponse> searchAdminComplaints(
            Long hostelId,
            Long categoryId,
            ComplaintStatus status,
            LocationType locationType,
            Instant from,
            Instant to,
            String search,
            Pageable pageable) {

        Specification<Complaint> spec = ComplaintSpecification.filterComplaints(
                hostelId, categoryId, status, locationType, from, to, search);

        Page<Complaint> page = complaintRepository.findAll(spec, pageable);
        List<ComplaintAdminResponse> content = page.getContent().stream()
                .map(this::mapToAdminResponse)
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    @Transactional(readOnly = true)
    public ComplaintAdminResponse getAdminComplaint(Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));
        return mapToAdminResponse(complaint);
    }

    @Transactional
    public ComplaintAdminResponse updateStatus(Long id, StatusUpdateRequest request, AdminUser admin) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        if (complaint.getStatus() == ComplaintStatus.COMPLETED) {
            throw new InvalidStatusTransitionException("Completed complaints are finalized and cannot be modified.");
        }

        if (request.getStatus() == ComplaintStatus.COMPLETED) {
            throw new InvalidStatusTransitionException("Please use the completion action with a mandatory resolution photograph to complete a grievance.");
        }

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setStatus(request.getStatus());
        complaint.setUpdatedAt(Instant.now());

        ComplaintStatusHistory history = new ComplaintStatusHistory(
                complaint,
                oldStatus,
                request.getStatus(),
                admin.getFullName() != null ? admin.getFullName() : admin.getUsername(),
                request.getNote()
        );
        complaint.addStatusHistory(history);

        Complaint updated = complaintRepository.save(complaint);
        return mapToAdminResponse(updated);
    }

    @Transactional
    public ComplaintAdminResponse completeComplaint(
            Long id,
            String remarks,
            MultipartFile completionPhoto,
            AdminUser admin) {

        if (completionPhoto == null || completionPhoto.isEmpty()) {
            throw new InvalidFileException("A resolution photograph is mandatory to complete a grievance.");
        }

        if (!StringUtils.hasText(remarks)) {
            throw new IllegalArgumentException("Completion remarks are required.");
        }

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        if (complaint.getStatus() == ComplaintStatus.COMPLETED) {
            throw new InvalidStatusTransitionException("This complaint is already marked as COMPLETED.");
        }

        // Store mandatory completion photo
        String photoUrl = fileStorageService.storeFile(completionPhoto, "completions");

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setStatus(ComplaintStatus.COMPLETED);
        complaint.setUpdatedAt(Instant.now());

        ComplaintCompletion completion = new ComplaintCompletion(
                complaint,
                remarks.trim(),
                photoUrl,
                admin
        );
        complaint.setCompletion(completion);

        ComplaintStatusHistory history = new ComplaintStatusHistory(
                complaint,
                oldStatus,
                ComplaintStatus.COMPLETED,
                admin.getFullName() != null ? admin.getFullName() : admin.getUsername(),
                "Complaint completed: " + remarks.trim()
        );
        complaint.addStatusHistory(history);

        Complaint saved = complaintRepository.save(complaint);

        // Send completion email safely (failure does not roll back transaction)
        try {
            emailService.sendCompletionNotification(saved, completion);
        } catch (Exception emailEx) {
            org.slf4j.LoggerFactory.getLogger(ComplaintService.class)
                    .error("Unexpected error during completion email dispatch: {}", emailEx.getMessage(), emailEx);
        }

        return mapToAdminResponse(saved);
    }

    @Transactional
    public ComplaintAdminResponse resendNotification(Long id, AdminUser admin) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        if (complaint.getStatus() == ComplaintStatus.COMPLETED && complaint.getCompletion() != null) {
            emailService.sendCompletionNotification(complaint, complaint.getCompletion());
        } else {
            emailService.sendSubmissionConfirmation(complaint);
        }

        return mapToAdminResponse(complaint);
    }

    private ComplaintPublicResponse mapToPublicResponse(Complaint complaint) {
        ComplaintPublicResponse response = new ComplaintPublicResponse();
        response.setComplaintCode(complaint.getComplaintCode());
        response.setHostelName(complaint.getHostel().getName());
        response.setCategoryName(complaint.getCategory().getName());
        response.setLocationType(complaint.getLocationType());
        response.setLocationDetail(complaint.getLocationDetail());
        response.setDescription(complaint.getDescription());
        response.setPhotoUrl(complaint.getPhotoUrl());
        response.setStatus(complaint.getStatus());
        response.setSubmittedAt(complaint.getSubmittedAt());

        if (complaint.getCompletion() != null) {
            response.setCompletionRemarks(complaint.getCompletion().getRemarks());
            response.setCompletionPhotoUrl(complaint.getCompletion().getCompletionPhotoUrl());
            response.setCompletedAt(complaint.getCompletion().getCompletedAt());
        }

        List<TimelineEventResponse> timeline = statusHistoryRepository.findByComplaintIdOrderByChangedAtAsc(complaint.getId())
                .stream()
                .map(h -> new TimelineEventResponse(h.getOldStatus(), h.getNewStatus(), h.getChangedBy(), h.getChangedAt(), h.getNote()))
                .collect(Collectors.toList());
        response.setStatusTimeline(timeline);

        return response;
    }

    private ComplaintAdminResponse mapToAdminResponse(Complaint complaint) {
        ComplaintAdminResponse response = new ComplaintAdminResponse();
        response.setId(complaint.getId());
        response.setComplaintCode(complaint.getComplaintCode());
        response.setStudentName(complaint.getStudentName());
        response.setStudentEmail(complaint.getStudentEmail());
        response.setHostelId(complaint.getHostel().getId());
        response.setHostelName(complaint.getHostel().getName());
        response.setHostelCode(complaint.getHostel().getCode());
        response.setCategoryId(complaint.getCategory().getId());
        response.setCategoryName(complaint.getCategory().getName());
        response.setLocationType(complaint.getLocationType());
        response.setLocationDetail(complaint.getLocationDetail());
        response.setDescription(complaint.getDescription());
        response.setPhotoUrl(complaint.getPhotoUrl());
        response.setStatus(complaint.getStatus());
        response.setSubmittedAt(complaint.getSubmittedAt());
        response.setCreatedAt(complaint.getCreatedAt());
        response.setUpdatedAt(complaint.getUpdatedAt());

        if (complaint.getCompletion() != null) {
            response.setCompletionRemarks(complaint.getCompletion().getRemarks());
            response.setCompletionPhotoUrl(complaint.getCompletion().getCompletionPhotoUrl());
            response.setCompletedAt(complaint.getCompletion().getCompletedAt());
            response.setCompletedByAdminName(complaint.getCompletion().getCompletedByAdmin().getFullName());
        }

        List<TimelineEventResponse> timeline = statusHistoryRepository.findByComplaintIdOrderByChangedAtAsc(complaint.getId())
                .stream()
                .map(h -> new TimelineEventResponse(h.getOldStatus(), h.getNewStatus(), h.getChangedBy(), h.getChangedAt(), h.getNote()))
                .collect(Collectors.toList());
        response.setStatusTimeline(timeline);

        List<NotificationLogResponse> notificationLogs = notificationLogRepository.findByComplaintIdOrderByAttemptedAtDesc(complaint.getId())
                .stream()
                .map(n -> new NotificationLogResponse(n.getId(), n.getType(), n.getStatus(), n.getRecipientEmail(), n.getAttemptedAt(), n.getErrorMessage()))
                .collect(Collectors.toList());
        response.setNotificationLogs(notificationLogs);

        return response;
    }

    @Transactional
    public void deleteComplaint(Long id, AdminUser admin) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));
        complaintRepository.delete(complaint);
    }
}
