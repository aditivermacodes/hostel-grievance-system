package com.hgs.dto.request;

import com.hgs.domain.enums.LocationType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ComplaintSubmitRequest {

    @NotBlank(message = "Student name is required")
    @Size(max = 100, message = "Student name must not exceed 100 characters")
    private String studentName;

    @NotBlank(message = "Email is required for notifications")
    @Email(message = "Please provide a valid email address")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String studentEmail;

    @NotNull(message = "Hostel selection is required")
    private Long hostelId;

    @NotNull(message = "Location type is required")
    private LocationType locationType;

    @NotBlank(message = "Location detail is required (e.g. Room number or Common area name)")
    @Size(max = 100, message = "Location detail must not exceed 100 characters")
    private String locationDetail;

    @NotNull(message = "Category selection is required")
    private Long categoryId;

    @NotBlank(message = "Complaint description is required")
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    public ComplaintSubmitRequest() {
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

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
