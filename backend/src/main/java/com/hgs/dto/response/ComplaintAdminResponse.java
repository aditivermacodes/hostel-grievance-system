package com.hgs.dto.response;

import com.hgs.domain.enums.ComplaintStatus;
import com.hgs.domain.enums.LocationType;
import java.time.Instant;
import java.util.List;

public class ComplaintAdminResponse {

    private Long id;
    private String complaintCode;
    private String studentName;
    private String studentEmail;

    private Long hostelId;
    private String hostelName;
    private String hostelCode;

    private Long categoryId;
    private String categoryName;

    private LocationType locationType;
    private String locationDetail;
    private String description;
    private String photoUrl;
    private ComplaintStatus status;
    private Instant submittedAt;
    private Instant createdAt;
    private Instant updatedAt;

    // Completion fields
    private String completionRemarks;
    private String completionPhotoUrl;
    private Instant completedAt;
    private String completedByAdminName;

    private List<TimelineEventResponse> statusTimeline;
    private List<NotificationLogResponse> notificationLogs;

    public ComplaintAdminResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getComplaintCode() {
        return complaintCode;
    }

    public void setComplaintCode(String complaintCode) {
        this.complaintCode = complaintCode;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public Long getHostelId() {
        return hostelId;
    }

    public void setHostelId(Long hostelId) {
        this.hostelId = hostelId;
    }

    public String getHostelName() {
        return hostelName;
    }

    public void setHostelName(String hostelName) {
        this.hostelName = hostelName;
    }

    public String getHostelCode() {
        return hostelCode;
    }

    public void setHostelCode(String hostelCode) {
        this.hostelCode = hostelCode;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public LocationType getLocationType() {
        return locationType;
    }

    public void setLocationType(LocationType locationType) {
        this.locationType = locationType;
    }

    public String getLocationDetail() {
        return locationDetail;
    }

    public void setLocationDetail(String locationDetail) {
        this.locationDetail = locationDetail;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public ComplaintStatus getStatus() {
        return status;
    }

    public void setStatus(ComplaintStatus status) {
        this.status = status;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(Instant submittedAt) {
        this.submittedAt = submittedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getCompletionRemarks() {
        return completionRemarks;
    }

    public void setCompletionRemarks(String completionRemarks) {
        this.completionRemarks = completionRemarks;
    }

    public String getCompletionPhotoUrl() {
        return completionPhotoUrl;
    }

    public void setCompletionPhotoUrl(String completionPhotoUrl) {
        this.completionPhotoUrl = completionPhotoUrl;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }

    public String getCompletedByAdminName() {
        return completedByAdminName;
    }

    public void setCompletedByAdminName(String completedByAdminName) {
        this.completedByAdminName = completedByAdminName;
    }

    public List<TimelineEventResponse> getStatusTimeline() {
        return statusTimeline;
    }

    public void setStatusTimeline(List<TimelineEventResponse> statusTimeline) {
        this.statusTimeline = statusTimeline;
    }

    public List<NotificationLogResponse> getNotificationLogs() {
        return notificationLogs;
    }

    public void setNotificationLogs(List<NotificationLogResponse> notificationLogs) {
        this.notificationLogs = notificationLogs;
    }
}
