package com.aethervault.api.dto;

import java.time.LocalDateTime;
import java.util.Map;

public record ApiErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        String suggestion,
        String path,
        Map<String, String> validationErrors
) {
}
