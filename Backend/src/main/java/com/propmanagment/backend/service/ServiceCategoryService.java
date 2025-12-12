package com.propmanagment.backend.service;


import com.propmanagment.backend.model.ServiceCategory;
import com.propmanagment.backend.repository.ServiceCategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServiceCategoryService {

    private final ServiceCategoryRepository repository;

    public ServiceCategoryService(ServiceCategoryRepository repository) {
        this.repository = repository;
    }

    public ServiceCategory createCategory(ServiceCategory category) {
        return repository.save(category);
    }

    public List<ServiceCategory> getAllCategories() {
        return repository.findAll();
    }

    public ServiceCategory updateCategory(Long id, ServiceCategory updatedCategory) {
        ServiceCategory category = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        category.setTitle(updatedCategory.getTitle());
        category.setDescription(updatedCategory.getDescription());
        category.setIcon(updatedCategory.getIcon());
        category.setAvailable(updatedCategory.isAvailable());
        category.setPrice(updatedCategory.getPrice());
        return repository.save(category);
    }

    public void deleteCategory(Long id) {
        repository.deleteById(id);
    }
}