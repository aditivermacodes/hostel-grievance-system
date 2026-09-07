package com.hgs.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "complaint_completions")
public class ComplaintCompletion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false, unique = true)
    private Complaint complaint;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "completion_photo_url", nullable = false, length = 255)
    private String completionPhotoUrl;

    @Column(name = "completed_at", nullable = false)
    private Instant completedAt = Instant.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "completed_by_admin_id", nullable = false)
    private AdminUser completedByAdmin;

    public ComplaintCompletion() {
    }

    public ComplaintCompletion(Complaint complaint, String remarks, String completionPhotoUrl, AdminUser completedByAdmin) {
        this.complaint = complaint;
        this.remarks = remarks;
        this.completionPhotoUrl = completionPhotoUrl;
        this.completedByAdmin = completedByAdmin;
        this.completedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Complaint getComplaint() {
        return complaint;
    }

    public void setComplaint(Complaint complaint) {
        this.complaint = complaint;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
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

    public AdminUser getCompletedByAdmin() {
        return completedByAdmin;
    }

    public void setCompletedByAdmin(AdminUser completedByAdmin) {
        this.completedByAdmin = completedByAdmin;
    }
}
