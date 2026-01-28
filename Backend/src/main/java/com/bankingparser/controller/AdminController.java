package com.bankingparser.controller;

import com.bankingparser.dto.UserResponse;
import com.bankingparser.model.User;
import com.bankingparser.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Get all users
     * Endpoint: GET /admin/users
     */
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<UserResponse> userResponses = users.stream()
                .map(UserResponse::fromUser)
                .collect(Collectors.toList());

        return ResponseEntity.ok(userResponses);
    }

    /**
     * Get user by ID
     * Endpoint: GET /admin/users/{id}
     */
    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Integer id) {
        return userService.getUserById(id)
                .map(user -> ResponseEntity.ok(UserResponse.fromUser(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update user role
     * Endpoint: PUT /admin/users/{id}/role
     * Body: { "role": "MAKER" }
     */
    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Integer id, @RequestBody Map<String, String> request) {
        try {
            System.out.println("inside updaterole controller.");
            User user = userService.getUserById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String newRole = request.get("role");
            if (newRole == null || newRole.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Role is required");
            }

            // Validate role
            if (!newRole.matches("USER|MAKER|CHECKER|ADMIN")) {
                return ResponseEntity.badRequest().body("Invalid role. Must be USER, MAKER, CHECKER, or ADMIN");
            }

            user.setRole(newRole.toUpperCase());
            User updatedUser = userService.saveUser(user);
            return ResponseEntity.ok(UserResponse.fromUser(updatedUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating role: " + e.getMessage());
        }
    }

    /**
     * Delete user
     * Endpoint: DELETE /admin/users/{id}
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id) {
        try {
            if (!userService.getUserById(id).isPresent()) {
                return ResponseEntity.notFound().build();
            }
            userService.deleteUser(id);
            return ResponseEntity.ok().body("User deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting user: " + e.getMessage());
        }
    }

    /**
     * Create user with specific role (Admin only)
     * Endpoint: POST /admin/users
     */
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String password = request.get("password");
            String role = request.get("role");

            if (username == null || password == null || role == null) {
                return ResponseEntity.badRequest().body("Username, password, and role are required");
            }

            if (userService.getUserByUsername(username).isPresent()) {
                return ResponseEntity.badRequest().body("Username already exists");
            }

            // Validate role
            if (!role.matches("USER|MAKER|CHECKER|ADMIN")) {
                return ResponseEntity.badRequest().body("Invalid role. Must be USER, MAKER, CHECKER, or ADMIN");
            }

            User user = new User();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(role.toUpperCase());

            User savedUser = userService.saveUser(user);
            return ResponseEntity.ok(UserResponse.fromUser(savedUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating user: " + e.getMessage());
        }
    }
}
