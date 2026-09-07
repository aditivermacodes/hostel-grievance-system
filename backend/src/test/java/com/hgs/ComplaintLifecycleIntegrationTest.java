package com.hgs;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hgs.domain.Complaint;
import com.hgs.domain.ComplaintStatusHistory;
import com.hgs.domain.NotificationLog;
import com.hgs.domain.enums.ComplaintStatus;
import com.hgs.domain.enums.NotificationStatus;
import com.hgs.dto.request.AdminLoginRequest;
import com.hgs.dto.request.StatusUpdateRequest;
import com.hgs.repository.ComplaintRepository;
import com.hgs.repository.ComplaintStatusHistoryRepository;
import com.hgs.repository.NotificationLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
public class ComplaintLifecycleIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private ComplaintStatusHistoryRepository statusHistoryRepository;

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    @BeforeEach
    void setUp() {
        this.mockMvc = MockMvcBuilders
                .webAppContextSetup(webApplicationContext)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
    }

    private String getAdminToken() throws Exception {
        AdminLoginRequest loginRequest = new AdminLoginRequest("admin", "Admin@Hgs2026!");
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn();

        String responseJson = loginResult.getResponse().getContentAsString();
        return objectMapper.readTree(responseJson).get("token").asText();
    }

    @Test
    @DisplayName("Complete submission, tracking, privacy check, admin management, and completion flow")
    void testCompleteGrievanceLifecycle() throws Exception {
        // 1. Submit a complaint with optional photo
        MockMultipartFile photo = new MockMultipartFile(
                "photo",
                "test-leak.jpg",
                "image/jpeg",
                "dummy image content bytes".getBytes()
        );

        MvcResult submitResult = mockMvc.perform(multipart("/api/complaints")
                        .file(photo)
                        .param("studentName", "Rohan Sharma")
                        .param("studentEmail", "rohan@hostel.edu")
                        .param("hostelId", "1")
                        .param("locationType", "ROOM")
                        .param("locationDetail", "Room 304")
                        .param("categoryId", "1")
                        .param("description", "Ceiling pipe leaking water continuously onto the study table."))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.complaintCode").value(matchesPattern("^HGS-\\d{4}-\\d{6}$")))
                .andExpect(jsonPath("$.status").value("SUBMITTED"))
                .andExpect(jsonPath("$.locationDetail").value("Room 304"))
                .andReturn();

        String submitJson = submitResult.getResponse().getContentAsString();
        String complaintCode = objectMapper.readTree(submitJson).get("complaintCode").asText();
        assertNotNull(complaintCode);

        // 2. Track complaint publicly and assert PRIVACY: studentName and studentEmail MUST NOT be leaked
        mockMvc.perform(get("/api/complaints/track/" + complaintCode))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.complaintCode").value(complaintCode))
                .andExpect(jsonPath("$.status").value("SUBMITTED"))
                .andExpect(jsonPath("$.studentName").doesNotExist())
                .andExpect(jsonPath("$.studentEmail").doesNotExist())
                .andExpect(jsonPath("$.statusTimeline", hasSize(greaterThanOrEqualTo(1))));

        // 3. Track non-existent complaint -> 404
        mockMvc.perform(get("/api/complaints/track/HGS-9999-999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"));

        // 4. Authenticate as Admin
        String adminToken = getAdminToken();

        // 5. Admin lists complaints and finds the complaint
        mockMvc.perform(get("/api/admin/complaints")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("search", complaintCode))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].complaintCode").value(complaintCode))
                .andExpect(jsonPath("$.content[0].studentName").value("Rohan Sharma"))
                .andExpect(jsonPath("$.content[0].studentEmail").value("rohan@hostel.edu"));

        Complaint complaint = complaintRepository.findByComplaintCode(complaintCode).orElseThrow();
        Long complaintId = complaint.getId();

        // 6. Admin updates status to IN_PROGRESS
        StatusUpdateRequest inProgressUpdate = new StatusUpdateRequest(ComplaintStatus.IN_PROGRESS, "Plumber assigned and en route.");
        mockMvc.perform(patch("/api/admin/complaints/" + complaintId + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inProgressUpdate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));

        // Verify status history contains both SUBMITTED and IN_PROGRESS
        List<ComplaintStatusHistory> histories = statusHistoryRepository.findByComplaintIdOrderByChangedAtAsc(complaintId);
        assertTrue(histories.stream().anyMatch(h -> h.getNewStatus() == ComplaintStatus.IN_PROGRESS));

        // 7. HARD BUSINESS RULE: Attempting completion WITHOUT photograph MUST BE REJECTED (HTTP 400)
        mockMvc.perform(multipart("/api/admin/complaints/" + complaintId + "/complete")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("remarks", "Repaired the leaking valve and replaced rubber washer."))
                .andExpect(status().isBadRequest());

        // Also check if an empty photo part is rejected
        MockMultipartFile emptyPhoto = new MockMultipartFile("photo", "empty.jpg", "image/jpeg", new byte[0]);
        mockMvc.perform(multipart("/api/admin/complaints/" + complaintId + "/complete")
                        .file(emptyPhoto)
                        .header("Authorization", "Bearer " + adminToken)
                        .param("remarks", "Repaired the leaking valve and replaced rubber washer."))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid File"));

        // 8. Complete complaint WITH mandatory photo
        MockMultipartFile completionPhoto = new MockMultipartFile(
                "photo",
                "resolution_proof.jpg",
                "image/jpeg",
                "photo proof showing fixed pipe".getBytes()
        );

        mockMvc.perform(multipart("/api/admin/complaints/" + complaintId + "/complete")
                        .file(completionPhoto)
                        .header("Authorization", "Bearer " + adminToken)
                        .param("remarks", "Replaced leaking gasket with new brass connector. Fully verified."))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.completionRemarks").value("Replaced leaking gasket with new brass connector. Fully verified."))
                .andExpect(jsonPath("$.completionPhotoUrl").isNotEmpty());

        // 9. Verify completed complaint cannot have status mutated
        StatusUpdateRequest invalidReopen = new StatusUpdateRequest(ComplaintStatus.IN_PROGRESS, "Trying to reopen");
        mockMvc.perform(patch("/api/admin/complaints/" + complaintId + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidReopen)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid Status Transition"));

        // 10. Verify public tracking now reflects COMPLETED with resolution photo and remarks
        mockMvc.perform(get("/api/complaints/track/" + complaintCode))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.completionRemarks").value("Replaced leaking gasket with new brass connector. Fully verified."))
                .andExpect(jsonPath("$.completionPhotoUrl").isNotEmpty())
                .andExpect(jsonPath("$.completedAt").isNotEmpty())
                .andExpect(jsonPath("$.studentEmail").doesNotExist());

        // 11. Verify Notification Logs were created
        List<NotificationLog> logs = notificationLogRepository.findByComplaintIdOrderByAttemptedAtDesc(complaintId);
        assertFalse(logs.isEmpty(), "Notification log entries should be created for submission and completion");
        assertTrue(logs.stream().anyMatch(l -> l.getStatus() == NotificationStatus.SENT || l.getStatus() == NotificationStatus.FAILED));
    }
}
