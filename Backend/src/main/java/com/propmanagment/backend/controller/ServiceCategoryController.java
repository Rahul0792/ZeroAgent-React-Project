package com.propmanagment.backend.controller;

import com.propmanagment.backend.dto.ServiceCategoryDTO;
import com.propmanagment.backend.model.ServiceCategory;
import com.propmanagment.backend.service.ServiceCategoryService;
import org.springframework.beans.BeanUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin("*")
public class ServiceCategoryController {

    private final ServiceCategoryService service;

    public ServiceCategoryController(ServiceCategoryService service) {
        this.service = service;
    }

    // Convert Entity → DTO
    private ServiceCategoryDTO convertToDto(ServiceCategory category) {
        ServiceCategoryDTO dto = new ServiceCategoryDTO();
        BeanUtils.copyProperties(category, dto);
        return dto;
    }

    // Convert DTO → Entity
    private ServiceCategory convertToEntity(ServiceCategoryDTO dto) {
        ServiceCategory category = new ServiceCategory();
        BeanUtils.copyProperties(dto, category);
        return category;
    }

    // Create Category
    @PostMapping
    public ResponseEntity<ServiceCategoryDTO> create(@RequestBody ServiceCategoryDTO dto) {
        ServiceCategory saved = service.createCategory(convertToEntity(dto));
        return ResponseEntity.ok(convertToDto(saved));
    }

    // Get All
    @GetMapping
    public ResponseEntity<List<ServiceCategoryDTO>> getAll() {
        List<ServiceCategoryDTO> list = service.getAllCategories()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    // Update
    @PutMapping("/{id}")
    public ResponseEntity<ServiceCategoryDTO> update(
            @PathVariable Long id,
            @RequestBody ServiceCategoryDTO dto) {
        ServiceCategory updated = service.updateCategory(id, convertToEntity(dto));
        return ResponseEntity.ok(convertToDto(updated));
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}