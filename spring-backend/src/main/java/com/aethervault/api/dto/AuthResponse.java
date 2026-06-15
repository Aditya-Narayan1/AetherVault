package com.aethervault.api.dto;

public record AuthResponse(
        String message,
        String token,
        Long id,
        String username,
        String email,
        String role
) {
}
