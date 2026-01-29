package com.bankingparser.service;

import com.bankingparser.dto.SavePatternRequest;
import com.bankingparser.dto.UpdatePatternRequest;
import com.bankingparser.model.Bank;
import com.bankingparser.model.Pattern;
import com.bankingparser.repository.BankRepository;
import com.bankingparser.repository.PatternRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PatternService {

    @Autowired
    private PatternRepository patternRepository;

    @Autowired
    private BankRepository bankRepository;

    public List<Pattern> getDrafts() {
        return patternRepository.findByStatus("DRAFT");
    }

    public List<Pattern> getRejected() {
        return patternRepository.findByStatus("REJECTED");
    }

    public List<Pattern> getFailed() {
        return patternRepository.findByStatus("FAILED");
    }

    public List<Pattern> getPendings() {
        return patternRepository.findByStatus("PENDING");
    }

    /**
     * Save pattern with given status (DRAFT or PENDING)
     * First finds bank from smsTitle, if not found creates new bank using bankName from request
     */
    public Pattern savePattern(SavePatternRequest request, String status) {
        Bank matchedBank = null;

        // Step 1: Try to find bank from smsTitle (if provided)
        if (request.getSmsTitle() != null && !request.getSmsTitle().trim().isEmpty()) {
            List<Bank> allBanks = bankRepository.findAll();
            String upperTitle = request.getSmsTitle().toUpperCase();
            
            for (Bank bank : allBanks) {
                if (upperTitle.contains(bank.getBankname().toUpperCase())) {
                    matchedBank = bank;
                    break;
                }
            }
        }

        // Step 2: If no bank found from title, try to find or create using bankName
        if (matchedBank == null) {
            if (request.getBankName() == null || request.getBankName().trim().isEmpty()) {
                throw new RuntimeException("Bank not found in SMS title and bankName not provided in request");
            }
            
            // Try to find existing bank by name first
            String bankNameUpper = request.getBankName().toUpperCase();
            List<Bank> allBanks = bankRepository.findAll();
            for (Bank bank : allBanks) {
                if (bank.getBankname().toUpperCase().contains(bankNameUpper) || 
                    bankNameUpper.contains(bank.getBankname().toUpperCase())) {
                    matchedBank = bank;
                    break;
                }
            }
            
            // If still not found, create new bank
            if (matchedBank == null) {
                Bank newBank = new Bank();
                newBank.setBankname(request.getBankName().toUpperCase());
                matchedBank = bankRepository.save(newBank);
            }
        }

        // Step 3: Create and save pattern
        Pattern pattern = new Pattern();
        pattern.setBankId(matchedBank.getBankId());
        pattern.setPattern(request.getPattern());
        pattern.setSample(request.getSample());
        pattern.setStatus(status);
        pattern.setBankName(request.getBankName());
        pattern.setMerchantName(request.getMerchantName());
        pattern.setTxType(request.getTxType());
        pattern.setMsgType(request.getMsgType());
        pattern.setMsgSubtype(request.getMsgSubtype());
        pattern.setSmsTitle(request.getSmsTitle());

        return patternRepository.save(pattern);
    }

    /**
     * Helper method to find or create bank from smsTitle or bankName
     */
    private Bank findOrCreateBank(String smsTitle, String bankName) {
        Bank matchedBank = null;
        
        // Step 1: Try to find bank from smsTitle
        if (smsTitle != null && !smsTitle.trim().isEmpty()) {
            List<Bank> allBanks = bankRepository.findAll();
            String upperTitle = smsTitle.toUpperCase();
            
            for (Bank bank : allBanks) {
                if (upperTitle.contains(bank.getBankname().toUpperCase())) {
                    matchedBank = bank;
                    break;
                }
            }
        }
        
        // Step 2: If not found, try to find from bankName
        if (matchedBank == null && bankName != null && !bankName.trim().isEmpty()) {
            String bankNameUpper = bankName.toUpperCase();
            List<Bank> allBanks = bankRepository.findAll();
            for (Bank bank : allBanks) {
                if (bank.getBankname().toUpperCase().contains(bankNameUpper) || 
                    bankNameUpper.contains(bank.getBankname().toUpperCase())) {
                    matchedBank = bank;
                    break;
                }
            }
            
            // If still not found, create new bank
            if (matchedBank == null) {
                Bank newBank = new Bank();
                newBank.setBankname(bankNameUpper);
                matchedBank = bankRepository.save(newBank);
            }
        }
        
        return matchedBank;
    }

    /**
     * Update existing draft pattern to PENDING (for Maker to submit for approval)
     */
    public Pattern updatePatternToPending(Integer patternId, SavePatternRequest request) {
        Pattern pattern = patternRepository.findById(patternId)
                .orElseThrow(() -> new RuntimeException("Pattern not found with id: " + patternId));
        
        // Find or create bank and update bankId
        Bank bank = findOrCreateBank(request.getSmsTitle(), request.getBankName());
        if (bank != null) {
            pattern.setBankId(bank.getBankId());
        }
        
        // Update all fields
        pattern.setPattern(request.getPattern());
        pattern.setSample(request.getSample());
        pattern.setBankName(request.getBankName());
        pattern.setMerchantName(request.getMerchantName());
        pattern.setTxType(request.getTxType());
        pattern.setMsgType(request.getMsgType());
        pattern.setMsgSubtype(request.getMsgSubtype());
        pattern.setSmsTitle(request.getSmsTitle());
        pattern.setStatus("PENDING");
        
        return patternRepository.save(pattern);
    }

    /**
     * Update existing pattern and set status to DRAFT
     * Used when maker saves a pattern (whether it was DRAFT, FAILED, or REJECTED)
     */
    public Pattern updateDraft(Integer patternId, SavePatternRequest request) {
        Pattern pattern = patternRepository.findById(patternId)
                .orElseThrow(() -> new RuntimeException("Pattern not found with id: " + patternId));
        
        // Find or create bank and update bankId
        Bank bank = findOrCreateBank(request.getSmsTitle(), request.getBankName());
        if (bank != null) {
            pattern.setBankId(bank.getBankId());
        }
        
        // Update all fields
        pattern.setPattern(request.getPattern());
        pattern.setSample(request.getSample());
        pattern.setBankName(request.getBankName());
        pattern.setMerchantName(request.getMerchantName());
        pattern.setTxType(request.getTxType());
        pattern.setMsgType(request.getMsgType());
        pattern.setMsgSubtype(request.getMsgSubtype());
        pattern.setSmsTitle(request.getSmsTitle());
        pattern.setStatus("DRAFT"); // Set status to DRAFT
        
        return patternRepository.save(pattern);
    }

    /**
     * Update existing pattern with all fields and new status (for Checker to approve/reject)
     */
    public Pattern updatePattern(UpdatePatternRequest request, String status) {
        Pattern pattern = patternRepository.findById(request.getPatternId())
                .orElseThrow(() -> new RuntimeException("Pattern not found with id: " + request.getPatternId()));
        
        // Find or create bank and update bankId
        Bank bank = findOrCreateBank(request.getSmsTitle(), request.getBankName());
        if (bank != null) {
            pattern.setBankId(bank.getBankId());
        }
        
        // Update all fields
        if (request.getPattern() != null) {
            pattern.setPattern(request.getPattern());
        }
        if (request.getSample() != null) {
            pattern.setSample(request.getSample());
        }
        if (request.getBankName() != null) {
            pattern.setBankName(request.getBankName());
        }
        if (request.getMerchantName() != null) {
            pattern.setMerchantName(request.getMerchantName());
        }
        if (request.getTxType() != null) {
            pattern.setTxType(request.getTxType());
        }
        if (request.getMsgType() != null) {
            pattern.setMsgType(request.getMsgType());
        }
        if (request.getMsgSubtype() != null) {
            pattern.setMsgSubtype(request.getMsgSubtype());
        }
        if (request.getSmsTitle() != null) {
            pattern.setSmsTitle(request.getSmsTitle());
        }
        
        // Update status
        pattern.setStatus(status);
        
        return patternRepository.save(pattern);
    }
}
