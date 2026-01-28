package com.bankingparser.controller;

import com.bankingparser.dto.ExtractedFieldsResponse;
import com.bankingparser.dto.FindPatternRequest;
import com.bankingparser.dto.SaveTransactionRequest;
import com.bankingparser.model.Transaction;
import com.bankingparser.service.RegexService;
import com.bankingparser.service.TransactionService;
import com.bankingparser.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private RegexService regexService;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Get all transactions for the current user
     * Endpoint: GET /user/transactions
     * Extracts userId from Authorization header
     */
    @GetMapping("/transactions")
    public ResponseEntity<?> getTransactions(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            Integer userId = jwtUtil.extractUserId(token);
            
            List<Transaction> transactions = transactionService.getTransactionsByUserId(userId);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving transactions: " + e.getMessage());
        }
    }

    /**
     * Find matching pattern for SMS and extract fields
     * Endpoint: POST /user/findPattern
     * Body: { "sms": "...", "smsTitle": "AD-SBIBNK-S" }
     * 
     * First finds bank from smsTitle, then matches patterns for that bank only
     */
    @PostMapping("/findPattern")
    public ResponseEntity<ExtractedFieldsResponse> findPattern(@RequestBody FindPatternRequest request) {
        ExtractedFieldsResponse response = regexService.findPattern(request.getSms(), request.getSmsTitle());
        return ResponseEntity.ok(response);
    }

    /**
     * Save a parsed transaction to history
     * Endpoint: POST /user/saveTransaction
     * Body: { "msg": "...", "bankName": "...", "amount": 1000, ... }
     */
    @PostMapping("/saveTransaction")
    public ResponseEntity<?> saveTransaction(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody SaveTransactionRequest request) {
        try {
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            Integer userId = jwtUtil.extractUserId(token);
            
            Transaction savedTransaction = transactionService.saveTransaction(userId, request);
            return ResponseEntity.ok(savedTransaction);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error saving transaction: " + e.getMessage());
        }
    }
}
