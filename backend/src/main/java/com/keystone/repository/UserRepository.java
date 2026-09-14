package com.keystone.repository;

import com.keystone.domain.Role;
import com.keystone.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRoleAndActiveTrue(Role role);
    List<User> findByActiveTrue();
    List<User> findByRoleInAndActiveTrue(List<Role> roles);
}
