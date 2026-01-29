package com.bankingparser.controller;

import com.bankingparser.dto.UserResponse;
import com.bankingparser.model.User;
import com.bankingparser.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

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
     * Get user counts by role
     * Endpoint: GET /admin/userCounts
     */
    @GetMapping("/userCounts")
    public ResponseEntity<Map<String, Long>> getUserCounts() {
        Map<String, Long> counts = userService.getUserCountsByRole();
        return ResponseEntity.ok(counts);
    }

    /**
     * Create user with specific role (Admin only)
     * Endpoint: POST /admin/createUser
     * Body: { "username": "...", "password": "...", "role": "USER|MAKER|CHECKER|ADMIN" }
     */
    @PostMapping("/createUser")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String password = request.get("password");
            String role = request.get("role");

            if (username == null || username.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Username is required");
            }
            if (password == null || password.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Password is required");
            }
            if (role == null || role.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Role is required");
            }

            if (userService.getUserByUsername(username).isPresent()) {
                return ResponseEntity.badRequest().body("Username already exists");
            }

            // Validate role
            String upperRole = role.toUpperCase();
            if (!upperRole.matches("USER|MAKER|CHECKER|ADMIN")) {
                return ResponseEntity.badRequest().body("Invalid role. Must be USER, MAKER, CHECKER, or ADMIN");
            }

            User user = new User();
            user.setUsername(username.trim());
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(upperRole);

            User savedUser = userService.saveUser(user);
            return ResponseEntity.ok(UserResponse.fromUser(savedUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating user: " + e.getMessage());
        }
    }
}
