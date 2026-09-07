package com.hgs.repository;

import com.hgs.domain.Hostel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HostelRepository extends JpaRepository<Hostel, Long> {
    List<Hostel> findByActiveTrueOrderByNameAsc();
    Optional<Hostel> findByCode(String code);
}
