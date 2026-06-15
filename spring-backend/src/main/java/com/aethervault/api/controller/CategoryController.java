package com.aethervault.api.controller;

import com.aethervault.api.dto.CategoryRequest;
import com.aethervault.api.dto.CategoryResponse;
import com.aethervault.api.exception.ResourceNotFoundException;
import com.aethervault.api.mapper.ApiMapper;
import com.aethervault.api.model.Category;
import com.aethervault.api.repository.CategoryRepository;
import com.aethervault.api.repository.DocumentRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@Tag(name = "Categories")
public class CategoryController {
    private final CategoryRepository categories;
    private final DocumentRepository documents;
    private final ApiMapper mapper;

    public CategoryController(CategoryRepository categories, DocumentRepository documents, ApiMapper mapper) {
        this.categories = categories;
        this.documents = documents;
        this.mapper = mapper;
    }

    @GetMapping
    public List<CategoryResponse> list() {
        return categories.findAll().stream().map(mapper::toCategoryResponse).toList();
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> create(@Valid @RequestBody CategoryRequest request) {
        var category = new Category();
        category.setName(request.name());
        category.setDescription(request.description());
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toCategoryResponse(categories.save(category)));
    }

    @PutMapping("/{id}")
    public CategoryResponse update(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        var category = categories.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        category.setName(request.name());
        category.setDescription(request.description());
        return mapper.toCategoryResponse(categories.save(category));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void delete(@PathVariable Long id) {
        if (!categories.existsById(id)) {
            throw new ResourceNotFoundException("Category not found");
        }
        documents.findByCategoryId(id).forEach(document -> document.setCategory(null));
        categories.deleteById(id);
    }
}
