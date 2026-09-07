package com.hgs.repository;

import com.hgs.domain.NotificationLog;
import com.hgs.domain.enums.NotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {
    List<NotificationLog> findByComplaintIdOrderByAttemptedAtDesc(Long complaintId);
    long countByComplaintIdAndStatus(Long complaintId, NotificationStatus status);
}
