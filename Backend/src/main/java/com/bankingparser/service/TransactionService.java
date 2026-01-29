package com.bankingparser.service;

import com.bankingparser.dto.SaveTransactionRequest;
import com.bankingparser.model.Transaction;
import com.bankingparser.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Locale;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    public List<Transaction> getTransactionsByUserId(Integer userId) {
        return transactionRepository.findByUserId(userId);
    }

    /**
     * Save a new transaction for a user
     */
    public Transaction saveTransaction(Integer userId, SaveTransactionRequest request) {
        Transaction transaction = new Transaction();
        transaction.setUserId(userId);
        transaction.setMsg(request.getMsg());
        transaction.setBankName(request.getBankName());
        transaction.setMerchantName(request.getMerchantName());
        transaction.setAmount(request.getAmount());
        transaction.setAccountNumber(request.getAccountNumber());
        transaction.setTxType(request.getTxType());
        transaction.setMsgType(request.getMsgType());
        transaction.setMsgSubtype(request.getMsgSubtype());
        transaction.setReferenceNo(request.getReferenceNo());
        transaction.setAvailableBalance(request.getAvailableBalance());
        
        // Parse date string to LocalDate
        if (request.getDate() != null && !request.getDate().isEmpty()) {
            transaction.setDate(parseDate(request.getDate()));
        }
        
        return transactionRepository.save(transaction);
    }

    /**
     * Parse various date formats from SMS
     */
    private LocalDate parseDate(String dateStr) {
        // Try different date formats
        String[] patterns = {
            "d-MMM-yy",      // 10-Jan-26
            "d-MMM-yyyy",    // 10-Jan-2026
            "dd-MMM-yy",     // 10-Jan-26
            "dd-MMM-yyyy",   // 10-Jan-2026
            "dMMMyy",        // 14Jan26
            "ddMMMyy",       // 14Jan26
            "dMMMyyyy",      // 14Jan2026
            "ddMMMyyyy",     // 14Jan2026
            "yyyy-MM-dd",    // 2026-01-10
            "dd/MM/yyyy",    // 10/01/2026
            "dd/MM/yy",      // 10/01/26
            "d/M/yyyy",      // 1/1/2026
            "d/M/yy"         // 1/1/26
        };
        
        for (String pattern : patterns) {
            try {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern, Locale.ENGLISH);
                return LocalDate.parse(dateStr, formatter);
            } catch (DateTimeParseException e) {
                // Try next pattern
            }
        }
        
        // If no pattern matches, return null
        return null;
    }
}
