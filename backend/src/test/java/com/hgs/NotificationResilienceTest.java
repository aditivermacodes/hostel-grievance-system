package com.hgs;

import com.hgs.domain.Complaint;
import com.hgs.domain.NotificationLog;
import com.hgs.domain.enums.ComplaintStatus;
import com.hgs.domain.enums.LocationType;
import com.hgs.domain.enums.NotificationStatus;
import com.hgs.dto.request.ComplaintSubmitRequest;
import com.hgs.dto.response.ComplaintPublicResponse;
import com.hgs.repository.ComplaintRepository;
import com.hgs.repository.NotificationLogRepository;
import com.hgs.service.ComplaintService;
import com.hgs.service.EmailService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
public class NotificationResilienceTest {

    @Autowired
    private ComplaintService complaintService;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    @MockitoBean
    private EmailService emailService;

    @Test
    @DisplayName("Email failure must never cause transaction rollback or lost complaint")
    void testEmailFailureDoesNotRollbackComplaint() {
        // Configure EmailService to simulate failure / exception
        when(emailService.sendSubmissionConfirmation(any())).thenThrow(new RuntimeException("Simulated SMTP Server Down / Connection Refused"));

        ComplaintSubmitRequest request = new ComplaintSubmitRequest();
        request.setStudentName("Aditya Verma");
        request.setStudentEmail("aditya@hostel.edu");
        request.setHostelId(1L);
        request.setLocationType(LocationType.COMMON_AREA);
        request.setLocationDetail("Mess Hall 1st Floor");
        request.setCategoryId(2L);
        request.setDescription("Tube light flickering constantly in dining area.");

        // Submission should not throw unhandled exception or fail to persist
        ComplaintPublicResponse response = null;
        try {
            response = complaintService.submitComplaint(request, null);
        } catch (Exception ex) {
            // In case the mock exception bubble is caught inside service or we verify fallback
        }

        assertNotNull(response, "Complaint should be successfully created despite email failure");
        assertNotNull(response.getComplaintCode());

        // Verify record is committed in database
        Complaint savedComplaint = complaintRepository.findByComplaintCode(response.getComplaintCode()).orElse(null);
        assertNotNull(savedComplaint, "Complaint record must be persisted in database");
        assertEquals(ComplaintStatus.SUBMITTED, savedComplaint.getStatus());
        assertEquals("Aditya Verma", savedComplaint.getStudentName());
    }
}
