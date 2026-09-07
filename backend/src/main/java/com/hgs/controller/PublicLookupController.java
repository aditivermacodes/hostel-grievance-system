package com.hgs.controller;

import com.hgs.dto.response.CategoryResponse;
import com.hgs.dto.response.HostelResponse;
import com.hgs.repository.CategoryRepository;
import com.hgs.repository.HostelRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class PublicLookupController {

    private final HostelRepository hostelRepository;
    private final CategoryRepository categoryRepository;

    public PublicLookupController(HostelRepository hostelRepository, CategoryRepository categoryRepository) {
        this.hostelRepository = hostelRepository;
        this.categoryRepository = categoryRepository;
    }

    @GetMapping("/hostels")
    public ResponseEntity<List<HostelResponse>> getHostels() {
        List<HostelResponse> hostels = hostelRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(h -> new HostelResponse(h.getId(), h.getName(), h.getCode(), h.isActive()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(hostels);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponse>> getCategories() {
        List<CategoryResponse> categories = categoryRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(c -> new CategoryResponse(c.getId(), c.getName(), c.getDescription(), c.isActive()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(categories);
    }
}
