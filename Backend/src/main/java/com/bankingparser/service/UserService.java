package com.bankingparser.service;

import com.bankingparser.model.User;
import com.bankingparser.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    /**
     * Get count of users by each role
     */
    public Map<String, Long> getUserCountsByRole() {
        Map<String, Long> counts = new HashMap<>();
        counts.put("total", userRepository.count());
        counts.put("ADMIN", userRepository.countByRole("ADMIN"));
        counts.put("MAKER", userRepository.countByRole("MAKER"));
        counts.put("CHECKER", userRepository.countByRole("CHECKER"));
        counts.put("USER", userRepository.countByRole("USER"));
        return counts;
    }
}
