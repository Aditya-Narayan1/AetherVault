package com.aethervault.api;

import com.aethervault.api.model.Role;
import com.aethervault.api.model.User;
import com.aethervault.api.repository.RoleRepository;
import com.aethervault.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication
public class AetherVaultApplication {
    private static final Logger log = LoggerFactory.getLogger(AetherVaultApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(AetherVaultApplication.class, args);
    }

    @Bean
    CommandLineRunner seedRolesAndAdmin(RoleRepository roles, UserRepository users, PasswordEncoder encoder,
                                        @Value("${app.admin.username}") String adminUsername,
                                        @Value("${app.admin.email}") String adminEmail,
                                        @Value("${app.admin.password}") String adminPassword) {
        return args -> {
            var adminRole = roles.findByName("ADMIN").orElseGet(() -> roles.save(new Role("ADMIN")));
            roles.findByName("USER").orElseGet(() -> roles.save(new Role("USER")));
            var admin = users.findByUsername(adminUsername)
                    .or(() -> users.findByEmail(adminEmail))
                    .orElseGet(User::new);
            admin.setUsername(adminUsername);
            admin.setEmail(adminEmail);
            admin.setPasswordHash(encoder.encode(adminPassword));
            admin.setRole(adminRole);
            users.save(admin);
            log.info("Default admin account restored username={}", adminUsername);
        };
    }
}
