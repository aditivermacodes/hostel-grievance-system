package com.hgs.dto.response;

import com.hgs.domain.enums.NotificationStatus;
import com.hgs.domain.enums.NotificationType;
import java.time.Instant;

public class NotificationLogResponse {
    private Long id;
    private NotificationType type;
    private NotificationStatus status;
    private String recipientEmail;
    private Instant attemptedAt;
    private String errorMessage;

    public NotificationLogResponse() {
    }

    public NotificationLogResponse(Long id, NotificationType type, NotificationStatus status, String recipientEmail, Instant attemptedAt, String errorMessage) {
        this.id = id;
        this.type = type;
        this.status = status;
        this.recipientEmail = recipientEmail;
        this.attemptedAt = attemptedAt;
        this.errorMessage = errorMessage;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public NotificationStatus getStatus() {
        return status;
    }

    public void setStatus(NotificationStatus status) {
        this.status = status;
    }

    public String getRecipientEmail() {
        return recipientEmail;
    }

    public void setRecipientEmail(String recipientEmail) {
        this.recipientEmail = recipientEmail;
    }

    public Instant getAttemptedAt() {
        return attemptedAt;
    }

    public void setAttemptedAt(Instant attemptedAt) {
        this.attemptedAt = attemptedAt;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
}
