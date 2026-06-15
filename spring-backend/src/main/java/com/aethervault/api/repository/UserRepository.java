package com.aethervault.api.repository;

import com.aethervault.api.model.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    @EntityGraph(attributePaths = "role")
    Optional<User> findByUsername(String username);

    @EntityGraph(attributePaths = "role")
    Optional<User> findByEmail(String email);

    @EntityGraph(attributePaths = "role")
    @Query("select u from User u where u.id = :id")
    Optional<User> findWithRoleById(@Param("id") Long id);

    @Override
    @EntityGraph(attributePaths = "role")
    List<User> findAll();

    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
