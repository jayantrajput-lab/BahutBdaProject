package com.bankingparser.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExtractedFieldsResponse {
    private boolean matched;
    private String message;
    
    // Extracted fields from regex
    private BigDecimal amount;
    private String accountNumber;
    private String bankName;
    private String merchantName;
    private String txType;
    private String msgType;
    private String msgSubtype;
    private String date;
    private BigDecimal availableBalance;
    
    // Flags to track if values were parsed from SMS or came from pattern defaults
    private Boolean parsedBankName;
    private Boolean parsedMerchantName;
    private Boolean parsedTxType;
    private Boolean parsedMsgType;
    private Boolean parsedMsgSubtype;
    
    // Pattern info (only for findPattern)
    private Integer patternId;
    private String pattern;
    
    public static ExtractedFieldsResponse notMatched(String message) {
        ExtractedFieldsResponse response = new ExtractedFieldsResponse();
        response.setMatched(false);
        response.setMessage(message);
        return response;
    }
    
    public static ExtractedFieldsResponse matched() {
        ExtractedFieldsResponse response = new ExtractedFieldsResponse();
        response.setMatched(true);
        response.setMessage("Pattern matched successfully");
        return response;
    }
}
