package com.bankingparser.service;

import com.bankingparser.dto.AuthResponse;
import com.bankingparser.dto.LoginRequest;
import com.bankingparser.dto.SignupRequest;
import com.bankingparser.model.User;
import com.bankingparser.repository.UserRepository;
import com.bankingparser.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    public AuthResponse signup(SignupRequest signupRequest) {
        // Check if username already exists
        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            return new AuthResponse(null, null, null, null, "Username already exists");
        }

        // Create new user with default role USER
        User user = new User();
        user.setUsername(signupRequest.getUsername());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setRole("USER");

        User savedUser = userRepository.save(user);

        // Generate JWT token with userId, username, and role
        String token = jwtUtil.generateToken(savedUser.getUserId(), savedUser.getUsername(), savedUser.getRole());

        return new AuthResponse(token, savedUser.getUserId(), savedUser.getUsername(), savedUser.getRole(), "User registered successfully");
    }

    public AuthResponse login(LoginRequest loginRequest) {
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
            );

            // Get user details
            User user = userRepository.findByUsername(loginRequest.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Generate JWT token with userId, username, and role
            String token = jwtUtil.generateToken(user.getUserId(), user.getUsername(), user.getRole());

            return new AuthResponse(token, user.getUserId(), user.getUsername(), user.getRole(), "Login successful");
        } catch (Exception e) {
            return new AuthResponse(null, null, null, null, "Invalid username or password");
        }
    }
}
