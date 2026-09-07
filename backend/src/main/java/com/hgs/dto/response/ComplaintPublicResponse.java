package com.hgs.dto.response;

import com.hgs.domain.enums.ComplaintStatus;
import com.hgs.domain.enums.LocationType;
import java.time.Instant;
import java.util.List;

public class ComplaintPublicResponse {

    private String complaintCode;
    private String hostelName;
    private String categoryName;
    private LocationType locationType;
    private String locationDetail;
    private String description;
    private String photoUrl;
    private ComplaintStatus status;
    private Instant submittedAt;

    // Completion info (if completed)
    private String completionRemarks;
    private String completionPhotoUrl;
    private Instant completedAt;

    private List<TimelineEventResponse> statusTimeline;

    public ComplaintPublicResponse() {
    }

    public String getComplaintCode() {
        return complaintCode;
    }

    public void setComplaintCode(String complaintCode) {
        this.complaintCode = complaintCode;
    }

    public String getHostelName() {
        return hostelName;
    }

    public void setHostelName(String hostelName) {
        this.hostelName = hostelName;
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

    public List<TimelineEventResponse> getStatusTimeline() {
        return statusTimeline;
    }

    public void setStatusTimeline(List<TimelineEventResponse> statusTimeline) {
        this.statusTimeline = statusTimeline;
    }
}
