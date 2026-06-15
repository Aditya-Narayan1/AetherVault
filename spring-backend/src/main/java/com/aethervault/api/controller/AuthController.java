package com.aethervault.api.controller;

import com.aethervault.api.dto.AuthResponse;
import com.aethervault.api.dto.LoginRequest;
import com.aethervault.api.dto.RegisterRequest;
import com.aethervault.api.exception.BadRequestException;
import com.aethervault.api.model.User;
import com.aethervault.api.repository.RoleRepository;
import com.aethervault.api.repository.UserRepository;
import com.aethervault.api.security.JwtService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication")
public class AuthController {
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final UserRepository users;
    private final RoleRepository roles;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;

    public AuthController(UserRepository users, RoleRepository roles, PasswordEncoder encoder,
                          AuthenticationManager authManager, UserDetailsService userDetailsService,
                          JwtService jwtService) {
        this.users = users;
        this.roles = roles;
        this.encoder = encoder;
        this.authManager = authManager;
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        if (users.existsByUsername(request.username()) || users.existsByEmail(request.email())) {
            throw new BadRequestException("Username or email already exists");
        }
        var role = roles.findByName("USER").orElseGet(() -> roles.save(new com.aethervault.api.model.Role("USER")));
        var user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPasswordHash(encoder.encode(request.password()));
        user.setRole(role);
        users.save(user);
        log.info("Registered user username={} role=USER", user.getUsername());
        return ResponseEntity.ok(authResponse("Registered successfully", user));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        var user = users.findByUsername(request.username()).orElseThrow();
        log.info("Login successful username={} role={}", user.getUsername(), user.getRole().getName());
        return ResponseEntity.ok(authResponse("Login successful", user));
    }

    private AuthResponse authResponse(String message, User user) {
        var details = userDetailsService.loadUserByUsername(user.getUsername());
        return new AuthResponse(message, jwtService.generateToken(details), user.getId(), user.getUsername(),
                user.getEmail(), user.getRole().getName());
    }
}
