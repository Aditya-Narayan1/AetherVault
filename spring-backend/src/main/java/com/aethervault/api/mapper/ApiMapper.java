package com.aethervault.api.mapper;

import com.aethervault.api.dto.CategoryResponse;
import com.aethervault.api.dto.DocumentResponse;
import com.aethervault.api.dto.UserResponse;
import com.aethervault.api.model.Category;
import com.aethervault.api.model.Document;
import com.aethervault.api.model.User;
import org.springframework.stereotype.Component;

@Component
public class ApiMapper {
    public UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().getName(),
                user.getCreatedAt()
        );
    }

    public CategoryResponse toCategoryResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.getCreatedAt()
        );
    }

    public DocumentResponse toDocumentResponse(Document document) {
        var category = document.getCategory();
        var uploader = document.getUploadedBy();
        return new DocumentResponse(
                document.getId(),
                document.getTitle(),
                document.getDescription(),
                category == null ? null : category.getId(),
                category == null ? null : category.getName(),
                uploader == null ? null : uploader.getId(),
                uploader == null ? null : uploader.getUsername(),
                document.getUploadDate(),
                document.getCreatedAt()
        );
    }
}
