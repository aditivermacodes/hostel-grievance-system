package com.hgs.repository;

import com.hgs.domain.Complaint;
import com.hgs.domain.enums.ComplaintStatus;
import com.hgs.domain.enums.LocationType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class ComplaintSpecification {

    public static Specification<Complaint> filterComplaints(
            Long hostelId,
            Long categoryId,
            ComplaintStatus status,
            LocationType locationType,
            Instant from,
            Instant to,
            String search) {

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (hostelId != null) {
                predicates.add(criteriaBuilder.equal(root.get("hostel").get("id"), hostelId));
            }

            if (categoryId != null) {
                predicates.add(criteriaBuilder.equal(root.get("category").get("id"), categoryId));
            }

            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            if (locationType != null) {
                predicates.add(criteriaBuilder.equal(root.get("locationType"), locationType));
            }

            if (from != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("submittedAt"), from));
            }

            if (to != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("submittedAt"), to));
            }

            if (StringUtils.hasText(search)) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                Predicate codeMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("complaintCode")), searchPattern);
                Predicate nameMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("studentName")), searchPattern);
                Predicate locMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("locationDetail")), searchPattern);
                Predicate descMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), searchPattern);

                predicates.add(criteriaBuilder.or(codeMatch, nameMatch, locMatch, descMatch));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
