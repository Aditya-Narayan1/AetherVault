package com.aethervault.api.dto;

import java.time.LocalDateTime;

public record DocumentResponse(
        Long id,
        String title,
        String description,
        Long categoryId,
        String categoryName,
        Long uploadedById,
        String uploadedByUsername,
        LocalDateTime uploadDate,
        LocalDateTime createdAt
) {
}
