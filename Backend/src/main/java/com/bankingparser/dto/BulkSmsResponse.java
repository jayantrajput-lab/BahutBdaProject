package com.bankingparser.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkSmsResponse {
    private int totalCount;
    private int successCount;
    private int failedCount;
    private List<SmsResult> results;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SmsResult {
        private int index;              // Original index in request
        private String smsTitle;
        private String sms;
        private boolean matched;
        private String message;         // Error message if not matched
        
        // Extracted fields (null if not matched)
        private BigDecimal amount;
        private String accountNumber;
        private String bankName;
        private String merchantName;
        private String txType;
        private String msgType;
        private String msgSubtype;
        private String date;
        private BigDecimal availableBalance;
        private String referenceNo;
        
        // Pattern info
        private Integer patternId;
        
        public static SmsResult success(int index, String smsTitle, String sms, ExtractedFieldsResponse extracted) {
            SmsResult result = new SmsResult();
            result.setIndex(index);
            result.setSmsTitle(smsTitle);
            result.setSms(sms);
            result.setMatched(true);
            result.setMessage("Pattern matched successfully");
            
            // Copy extracted fields
            result.setAmount(extracted.getAmount());
            result.setAccountNumber(extracted.getAccountNumber());
            result.setBankName(extracted.getBankName());
            result.setMerchantName(extracted.getMerchantName());
            result.setTxType(extracted.getTxType());
            result.setMsgType(extracted.getMsgType());
            result.setMsgSubtype(extracted.getMsgSubtype());
            result.setDate(extracted.getDate());
            result.setAvailableBalance(extracted.getAvailableBalance());
            result.setReferenceNo(extracted.getReferenceNo());
            result.setPatternId(extracted.getPatternId());
            
            return result;
        }
        
        public static SmsResult failed(int index, String smsTitle, String sms, String errorMessage) {
            SmsResult result = new SmsResult();
            result.setIndex(index);
            result.setSmsTitle(smsTitle);
            result.setSms(sms);
            result.setMatched(false);
            result.setMessage(errorMessage);
            return result;
        }
    }
}
