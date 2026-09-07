package com.hgs.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.Year;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class IdGenerationService {

    private static final Logger logger = LoggerFactory.getLogger(IdGenerationService.class);
    private final JdbcTemplate jdbcTemplate;
    private final AtomicLong fallbackCounter = new AtomicLong(System.currentTimeMillis() % 100000);

    public IdGenerationService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public String generateComplaintCode() {
        int currentYear = Year.now().getValue();
        long sequenceVal;

        try {
            Long nextVal = jdbcTemplate.queryForObject("SELECT nextval('complaint_code_seq')", Long.class);
            sequenceVal = (nextVal != null) ? nextVal : fallbackCounter.incrementAndGet();
        } catch (Exception ex) {
            logger.warn("Could not retrieve from sequence complaint_code_seq, using fallback counter: {}", ex.getMessage());
            sequenceVal = fallbackCounter.incrementAndGet();
        }

        return String.format("HGS-%d-%06d", currentYear, sequenceVal);
    }
}
