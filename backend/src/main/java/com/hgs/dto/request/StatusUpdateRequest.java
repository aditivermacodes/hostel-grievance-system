package com.hgs.dto.request;

import com.hgs.domain.enums.ComplaintStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class StatusUpdateRequest {

    @NotNull(message = "New status is required")
    private ComplaintStatus status;

    @Size(max = 1000, message = "Status change note must not exceed 1000 characters")
    private String note;

    public StatusUpdateRequest() {
    }

    public StatusUpdateRequest(ComplaintStatus status, String note) {
        this.status = status;
        this.note = note;
    }

    public ComplaintStatus getStatus() {
        return status;
    }

    public void setStatus(ComplaintStatus status) {
        this.status = status;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
