package com.hgs.service;

import com.hgs.domain.Complaint;
import com.hgs.domain.ComplaintCompletion;

public interface EmailService {
    boolean sendSubmissionConfirmation(Complaint complaint);
    boolean sendCompletionNotification(Complaint complaint, ComplaintCompletion completion);
}
