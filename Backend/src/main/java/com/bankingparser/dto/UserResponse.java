package com.bankingparser.dto;

import com.bankingparser.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Integer userId;
    private String username;
    private String role;

    // Constructor to create UserResponse from User entity
    public UserResponse(User user) {
        this.userId = user.getUserId();
        this.username = user.getUsername();
        this.role = user.getRole();
    }

    // Static factory method for convenience
    public static UserResponse fromUser(User user) {
        return new UserResponse(user);
    }
}
