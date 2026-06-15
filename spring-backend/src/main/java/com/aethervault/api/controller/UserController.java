package com.aethervault.api.controller;

import com.aethervault.api.dto.UserRequest;
import com.aethervault.api.dto.UserResponse;
import com.aethervault.api.exception.BadRequestException;
import com.aethervault.api.exception.ResourceNotFoundException;
import com.aethervault.api.mapper.ApiMapper;
import com.aethervault.api.model.User;
import com.aethervault.api.repository.DocumentRepository;
import com.aethervault.api.repository.RoleRepository;
import com.aethervault.api.repository.UserRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users")
public class UserController {
    private final UserRepository users;
    private final RoleRepository roles;
    private final DocumentRepository documents;
    private final PasswordEncoder encoder;
    private final ApiMapper mapper;

    public UserController(UserRepository users, RoleRepository roles, DocumentRepository documents,
                          PasswordEncoder encoder, ApiMapper mapper) {
        this.users = users;
        this.roles = roles;
        this.documents = documents;
        this.encoder = encoder;
        this.mapper = mapper;
    }

    @GetMapping
    public List<UserResponse> list() {
        return users.findAll().stream().map(mapper::toUserResponse).toList();
    }

    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody UserRequest request) {
        if (request.password() == null || request.password().isBlank()) {
            throw new BadRequestException("Password is required");
        }
        var user = new User();
        apply(user, request);
        user.setPasswordHash(encoder.encode(request.password()));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toUserResponse(users.save(user)));
    }

    @PutMapping("/{id}")
    public UserResponse update(@PathVariable Long id, @Valid @RequestBody UserRequest request) {
        var user = users.findWithRoleById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        apply(user, request);
        if (request.password() != null && !request.password().isBlank()) {
            user.setPasswordHash(encoder.encode(request.password()));
        }
        return mapper.toUserResponse(users.save(user));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void delete(@PathVariable Long id) {
        if (!users.existsById(id)) {
            throw new ResourceNotFoundException("User not found");
        }
        documents.findByUploadedById(id).forEach(document -> document.setUploadedBy(null));
        users.deleteById(id);
    }

    private void apply(User user, UserRequest request) {
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setRole(roles.findByName(request.role() == null ? "USER" : request.role())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found")));
    }
}
