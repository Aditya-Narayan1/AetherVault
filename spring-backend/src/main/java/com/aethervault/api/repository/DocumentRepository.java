package com.aethervault.api.repository;

import com.aethervault.api.model.Document;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    @Override
    @EntityGraph(attributePaths = {"category", "uploadedBy"})
    List<Document> findAll();

    @Override
    @EntityGraph(attributePaths = {"category", "uploadedBy"})
    Optional<Document> findById(Long id);

    @EntityGraph(attributePaths = {"category", "uploadedBy"})
    List<Document> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String title, String description);

    List<Document> findByCategoryId(Long categoryId);

    List<Document> findByUploadedById(Long uploadedById);
}
