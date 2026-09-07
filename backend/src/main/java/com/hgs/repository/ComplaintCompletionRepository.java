package com.hgs.repository;

import com.hgs.domain.ComplaintCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ComplaintCompletionRepository extends JpaRepository<ComplaintCompletion, Long> {
    Optional<ComplaintCompletion> findByComplaintId(Long complaintId);
}
