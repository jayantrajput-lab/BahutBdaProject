package com.bankingparser.service;

import com.bankingparser.dto.ExtractedFieldsResponse;
import com.bankingparser.model.Bank;
import com.bankingparser.model.Pattern;
import com.bankingparser.repository.BankRepository;
import com.bankingparser.repository.PatternRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.regex.Matcher;

@Service
public class RegexService {

    @Autowired
    private PatternRepository patternRepository;

    @Autowired
    private BankRepository bankRepository;

    /**
     * Extract fields from SMS using provided regex pattern
     * Used by Maker and Checker to test patterns
     */
    public ExtractedFieldsResponse extractFields(String regexPattern, String sms) {
        try {
            java.util.regex.Pattern regex = java.util.regex.Pattern.compile(
                    regexPattern,
                    java.util.regex.Pattern.CASE_INSENSITIVE
            );
            Matcher matcher = regex.matcher(sms);

            if (matcher.find()) {
                return buildResponse(matcher, null);
            } else {
                return ExtractedFieldsResponse.notMatched("Pattern did not match the SMS");
            }
        } catch (Exception e) {
            return ExtractedFieldsResponse.notMatched("Invalid regex pattern: " + e.getMessage());
        }
    }

    /**
     * Find matching pattern from DB and extract fields
     * First finds bank from smsTitle, then matches patterns for that bank only
     */
    public ExtractedFieldsResponse findPattern(String sms, String smsTitle) {
        // Step 1: Find bank from smsTitle
        List<Bank> allBanks = bankRepository.findAll();
        Bank matchedBank = null;

        String upperTitle = smsTitle.toUpperCase();
        for (Bank bank : allBanks) {
            if (upperTitle.contains(bank.getBankname().toUpperCase())) {
                matchedBank = bank;
                break;
            }
        }

        if (matchedBank == null) {
            return ExtractedFieldsResponse.notMatched("No bank found in SMS title: " + smsTitle);
        }

        // Step 2: Get approved patterns for this bank only
        List<Pattern> bankPatterns = patternRepository.findByBankIdAndStatus(matchedBank.getBankId(), "APPROVED");

        if (bankPatterns.isEmpty()) {
            return ExtractedFieldsResponse.notMatched("No approved patterns found for bank: " + matchedBank.getBankname());
        }

        // Step 3: Try to match patterns
        for (Pattern pattern : bankPatterns) {
            try {
                java.util.regex.Pattern regex = java.util.regex.Pattern.compile(
                        pattern.getPattern(),
                        java.util.regex.Pattern.CASE_INSENSITIVE
                );
                Matcher matcher = regex.matcher(sms);

                if (matcher.find()) {
                    ExtractedFieldsResponse response = buildResponse(matcher, pattern);
                    // Set pattern info
                    response.setPatternId(pattern.getPatternId());
                    response.setPattern(pattern.getPattern());
                    
                    // Track which fields were parsed vs filled from pattern defaults
                    // Initially mark all as parsed (true) based on what buildResponse extracted
                    response.setParsedBankName(response.getBankName() != null);
                    response.setParsedMerchantName(response.getMerchantName() != null);
                    response.setParsedTxType(response.getTxType() != null);
                    response.setParsedMsgType(response.getMsgType() != null);
                    response.setParsedMsgSubtype(response.getMsgSubtype() != null);
                    
                    // Set default values from pattern if not extracted (and mark as not parsed)
                    if (response.getBankName() == null) {
                        response.setBankName(pattern.getBankName() != null ? pattern.getBankName() : matchedBank.getBankname());
                        response.setParsedBankName(false);
                    }
                    if (response.getMerchantName() == null && pattern.getMerchantName() != null) {
                        response.setMerchantName(pattern.getMerchantName());
                        response.setParsedMerchantName(false);
                    }
                    if (response.getTxType() == null && pattern.getTxType() != null) {
                        response.setTxType(pattern.getTxType());
                        response.setParsedTxType(false);
                    }
                    if (response.getMsgType() == null && pattern.getMsgType() != null) {
                        response.setMsgType(pattern.getMsgType());
                        response.setParsedMsgType(false);
                    }
                    if (response.getMsgSubtype() == null && pattern.getMsgSubtype() != null) {
                        response.setMsgSubtype(pattern.getMsgSubtype());
                        response.setParsedMsgSubtype(false);
                    }
                    return response;
                }
            } catch (Exception e) {
                // Skip invalid patterns
                continue;
            }
        }

        return ExtractedFieldsResponse.notMatched("No matching pattern found for SMS from bank: " + matchedBank.getBankname());
    }

    private ExtractedFieldsResponse buildResponse(Matcher matcher, Pattern pattern) {
        ExtractedFieldsResponse response = ExtractedFieldsResponse.matched();

        // Extract amount
        try {
            String amountStr = matcher.group("amount").replace(",", "");
            response.setAmount(new BigDecimal(amountStr));
        } catch (Exception e) { /* skip */ }

        // Extract account number
        try {
            response.setAccountNumber(matcher.group("accountNumber"));
        } catch (Exception e) { /* skip */ }

        // Extract bank name
        try {
            response.setBankName(matcher.group("bankName"));
        } catch (Exception e) { /* skip */ }

        // Extract merchant name
        try {
            response.setMerchantName(matcher.group("merchantName"));
        } catch (Exception e) {
            try {
                response.setMerchantName(matcher.group("merchant"));
            } catch (Exception ex) { /* skip */ }
        }

        // Extract transaction type
        try {
            response.setTxType(matcher.group("txType"));
        } catch (Exception e) {
            try {
                response.setTxType(matcher.group("type"));
            } catch (Exception ex) { /* skip */ }
        }

        // Extract message type
        try {
            response.setMsgType(matcher.group("msgType"));
        } catch (Exception e) { /* skip */ }

        // Extract message subtype
        try {
            response.setMsgSubtype(matcher.group("msgSubtype"));
        } catch (Exception e) { /* skip */ }

        // Extract date
        try {
            response.setDate(matcher.group("date"));
        } catch (Exception e) { /* skip */ }

        // Extract available balance
        try {
            String balStr = matcher.group("availableBalance").replace(",", "");
            response.setAvailableBalance(new BigDecimal(balStr));
        } catch (Exception e) { /* skip */ }

        return response;
    }
}
