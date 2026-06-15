package com.aethervault.api.controller;

import com.aethervault.api.dto.DocumentResponse;
import com.aethervault.api.exception.BadRequestException;
import com.aethervault.api.exception.ResourceNotFoundException;
import com.aethervault.api.mapper.ApiMapper;
import com.aethervault.api.model.Document;
import com.aethervault.api.repository.CategoryRepository;
import com.aethervault.api.repository.DocumentRepository;
import com.aethervault.api.repository.UserRepository;
import com.aethervault.api.service.SearchIndexClient;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.Principal;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
@Tag(name = "Documents")
public class DocumentController {
    private static final Logger log = LoggerFactory.getLogger(DocumentController.class);
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "docx", "txt");

    private final DocumentRepository documents;
    private final CategoryRepository categories;
    private final UserRepository users;
    private final SearchIndexClient searchIndexClient;
    private final ApiMapper mapper;
    private final Path uploadDir;

    public DocumentController(DocumentRepository documents, CategoryRepository categories, UserRepository users,
                              SearchIndexClient searchIndexClient, ApiMapper mapper,
                              @Value("${app.upload-dir}") String uploadDir) {
        this.documents = documents;
        this.categories = categories;
        this.users = users;
        this.searchIndexClient = searchIndexClient;
        this.mapper = mapper;
        this.uploadDir = Path.of(uploadDir).toAbsolutePath().normalize();
    }

    @GetMapping
    public List<DocumentResponse> list(@RequestParam(required = false) String q) {
        List<Document> results;
        if (q == null || q.isBlank()) {
            results = documents.findAll();
        } else {
            results = documents.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(q, q);
        }
        return results.stream().map(mapper::toDocumentResponse).toList();
    }

    @GetMapping("/{id}")
    public DocumentResponse get(@PathVariable Long id) {
        return mapper.toDocumentResponse(findDocument(id));
    }

    @PostMapping
    public ResponseEntity<DocumentResponse> upload(@RequestParam String title,
                                                   @RequestParam(required = false) String description,
                                                   @RequestParam(required = false) Long categoryId,
                                                   @RequestParam MultipartFile file,
                                                   Principal principal) throws IOException {
        validateUpload(title, file);
        Files.createDirectories(uploadDir);
        String originalName = Paths.get(file.getOriginalFilename() == null ? "document" : file.getOriginalFilename()).getFileName().toString();
        String storedName = UUID.randomUUID() + "-" + originalName;
        Path target = uploadDir.resolve(storedName).normalize();
        if (!target.startsWith(uploadDir)) {
            throw new BadRequestException("Invalid file path");
        }
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        var document = new Document();
        document.setTitle(title);
        document.setDescription(description);
        document.setFilePath(target.toString());
        if (categoryId != null) {
            document.setCategory(categories.findById(categoryId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found")));
        }
        document.setUploadedBy(users.findByUsername(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Uploader not found")));
        var saved = documents.save(document);
        searchIndexClient.indexDocument(saved);
        log.info("Document uploaded id={} title={} by={}", saved.getId(), saved.getTitle(), principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDocumentResponse(saved));
    }

    @PutMapping("/{id}")
    public DocumentResponse update(@PathVariable Long id,
                                   @RequestParam String title,
                                   @RequestParam(required = false) String description,
                                   @RequestParam(required = false) Long categoryId) {
        if (title == null || title.isBlank()) {
            throw new BadRequestException("Title is required");
        }
        var document = findDocument(id);
        document.setTitle(title);
        document.setDescription(description);
        document.setCategory(categoryId == null ? null : categories.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found")));
        var saved = documents.save(document);
        searchIndexClient.indexDocument(saved);
        return mapper.toDocumentResponse(saved);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        var document = findDocument(id);
        searchIndexClient.deleteDocument(id);
        try {
            Path path = Path.of(document.getFilePath()).toAbsolutePath().normalize();
            if (path.startsWith(uploadDir)) {
                Files.deleteIfExists(path);
            }
        } catch (IOException ex) {
            log.warn("Could not delete file for document id={}", id, ex);
        }
        documents.deleteById(id);
        log.info("Document deleted id={}", id);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) throws MalformedURLException {
        var document = findDocument(id);
        Path path = Path.of(document.getFilePath()).toAbsolutePath().normalize();
        if (!path.startsWith(uploadDir) || !Files.exists(path)) {
            throw new ResourceNotFoundException("File not found");
        }
        Resource resource = new UrlResource(path.toUri());
        log.info("Document downloaded id={} file={}", id, path.getFileName());
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + path.getFileName() + "\"")
                .body(resource);
    }

    private Document findDocument(Long id) {
        return documents.findById(id).orElseThrow(() -> new ResourceNotFoundException("Document not found"));
    }

    private void validateUpload(String title, MultipartFile file) {
        if (title == null || title.isBlank()) {
            throw new BadRequestException("Title is required");
        }
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is required");
        }
        String originalName = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        int dot = originalName.lastIndexOf('.');
        String extension = dot >= 0 ? originalName.substring(dot + 1).toLowerCase() : "";
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("Only PDF, DOCX, and TXT files are allowed");
        }
    }
}
