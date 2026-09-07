package com.hgs.service.impl;

import com.hgs.domain.Complaint;
import com.hgs.domain.ComplaintCompletion;
import com.hgs.domain.NotificationLog;
import com.hgs.domain.enums.NotificationStatus;
import com.hgs.domain.enums.NotificationType;
import com.hgs.repository.NotificationLogRepository;
import com.hgs.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class SmtpEmailService implements EmailService {

    private static final Logger logger = LoggerFactory.getLogger(SmtpEmailService.class);

    private final NotificationLogRepository notificationLogRepository;
    private final JavaMailSender mailSender;
    private final String fromEmail;
    private final boolean simulate;

    @Autowired
    public SmtpEmailService(
            NotificationLogRepository notificationLogRepository,
            @Autowired(required = false) JavaMailSender mailSender,
            @Value("${app.mail.from:notifications@hgs.internal}") String fromEmail,
            @Value("${app.mail.simulate:true}") boolean simulate) {
        this.notificationLogRepository = notificationLogRepository;
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
        this.simulate = simulate;
    }

    @Override
    public boolean sendSubmissionConfirmation(Complaint complaint) {
        String recipient = complaint.getStudentEmail();
        String subject = "Grievance Received - Complaint ID: " + complaint.getComplaintCode();
        String content = buildSubmissionEmailHtml(complaint);

        return executeSend(complaint, NotificationType.SUBMISSION, recipient, subject, content);
    }

    @Override
    public boolean sendCompletionNotification(Complaint complaint, ComplaintCompletion completion) {
        String recipient = complaint.getStudentEmail();
        String subject = "Grievance Resolved - Complaint ID: " + complaint.getComplaintCode();
        String content = buildCompletionEmailHtml(complaint, completion);

        return executeSend(complaint, NotificationType.COMPLETION, recipient, subject, content);
    }

    private boolean executeSend(Complaint complaint, NotificationType type, String recipient, String subject, String htmlContent) {
        try {
            if (simulate || mailSender == null) {
                logger.info("[EMAIL SIMULATOR] Dispatching {} email to {}\nSubject: {}\n{}", type, recipient, subject, htmlContent);
                logNotification(complaint, type, NotificationStatus.SENT, recipient, null);
                return true;
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(recipient);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("Successfully sent {} email to {}", type, recipient);
            logNotification(complaint, type, NotificationStatus.SENT, recipient, null);
            return true;
        } catch (Exception ex) {
            logger.error("Failed to send {} email to {}: {}", type, recipient, ex.getMessage(), ex);
            logNotification(complaint, type, NotificationStatus.FAILED, recipient, ex.getMessage());
            return false;
        }
    }

    private void logNotification(Complaint complaint, NotificationType type, NotificationStatus status, String recipient, String error) {
        try {
            NotificationLog log = new NotificationLog(complaint, type, status, recipient, error);
            log.setAttemptedAt(Instant.now());
            notificationLogRepository.save(log);
        } catch (Exception logEx) {
            logger.error("Failed to write notification log for complaint {}: {}", complaint.getComplaintCode(), logEx.getMessage());
        }
    }

    private String buildSubmissionEmailHtml(Complaint complaint) {
        return """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #1a56db;">Hostel Grievance System (HGS)</h2>
                <p>Hello <strong>%s</strong>,</p>
                <p>Your maintenance grievance has been successfully registered. Here are the details:</p>
                <table style="width: 100%%; border-collapse: collapse; margin: 20px 0;">
                    <tr><td style="padding: 8px; font-weight: bold; background: #f9fafb; width: 35%%;">Complaint ID:</td><td style="padding: 8px; font-weight: bold; color: #1a56db;">%s</td></tr>
                    <tr><td style="padding: 8px; font-weight: bold; background: #f9fafb;">Hostel:</td><td style="padding: 8px;">%s</td></tr>
                    <tr><td style="padding: 8px; font-weight: bold; background: #f9fafb;">Location:</td><td style="padding: 8px;">%s (%s)</td></tr>
                    <tr><td style="padding: 8px; font-weight: bold; background: #f9fafb;">Category:</td><td style="padding: 8px;">%s</td></tr>
                    <tr><td style="padding: 8px; font-weight: bold; background: #f9fafb;">Description:</td><td style="padding: 8px;">%s</td></tr>
                    <tr><td style="padding: 8px; font-weight: bold; background: #f9fafb;">Status:</td><td style="padding: 8px;"><span style="background: #e1effe; color: #1e429f; padding: 3px 8px; border-radius: 4px; font-weight: bold;">%s</span></td></tr>
                </table>
                <p>You can track the progress of this grievance at any time using your Complaint ID on the tracking portal.</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                <p style="font-size: 12px; color: #6b7280;">This is an automated notification. Please do not reply to this email.</p>
            </div>
            """.formatted(
                escapeHtml(complaint.getStudentName()),
                complaint.getComplaintCode(),
                escapeHtml(complaint.getHostel().getName()),
                complaint.getLocationType().name(),
                escapeHtml(complaint.getLocationDetail()),
                escapeHtml(complaint.getCategory().getName()),
                escapeHtml(complaint.getDescription()),
                complaint.getStatus().name()
        );
    }

    private String buildCompletionEmailHtml(Complaint complaint, ComplaintCompletion completion) {
        String photoSection = "";
        if (completion.getCompletionPhotoUrl() != null && !completion.getCompletionPhotoUrl().isBlank()) {
            photoSection = """
                <tr><td style="padding: 8px; font-weight: bold; background: #f9fafb;">Completion Photo:</td><td style="padding: 8px;"><a href="%s" target="_blank" style="color: #1a56db; text-decoration: underline;">View Verified Resolution Photo</a></td></tr>
                """.formatted(completion.getCompletionPhotoUrl());
        }

        return """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #047857;">Grievance Resolved Successfully</h2>
                <p>Hello <strong>%s</strong>,</p>
                <p>We are pleased to inform you that your grievance <strong>%s</strong> has been addressed and marked as <strong>COMPLETED</strong>.</p>
                <table style="width: 100%%; border-collapse: collapse; margin: 20px 0;">
                    <tr><td style="padding: 8px; font-weight: bold; background: #f9fafb; width: 35%%;">Complaint ID:</td><td style="padding: 8px; font-weight: bold; color: #047857;">%s</td></tr>
                    <tr><td style="padding: 8px; font-weight: bold; background: #f9fafb;">Resolution Remarks:</td><td style="padding: 8px; font-weight: bold;">%s</td></tr>
                    %s
                    <tr><td style="padding: 8px; font-weight: bold; background: #f9fafb;">Resolved By:</td><td style="padding: 8px;">%s</td></tr>
                    <tr><td style="padding: 8px; font-weight: bold; background: #f9fafb;">Location:</td><td style="padding: 8px;">%s - %s (%s)</td></tr>
                </table>
                <p>Thank you for helping us maintain high living standards in our hostels.</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                <p style="font-size: 12px; color: #6b7280;">Hostel Grievance Administration</p>
            </div>
            """.formatted(
                escapeHtml(complaint.getStudentName()),
                complaint.getComplaintCode(),
                complaint.getComplaintCode(),
                escapeHtml(completion.getRemarks()),
                photoSection,
                escapeHtml(completion.getCompletedByAdmin().getFullName() != null ? completion.getCompletedByAdmin().getFullName() : completion.getCompletedByAdmin().getUsername()),
                escapeHtml(complaint.getHostel().getName()),
                escapeHtml(complaint.getLocationDetail()),
                complaint.getLocationType().name()
        );
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&#39;");
    }
}
