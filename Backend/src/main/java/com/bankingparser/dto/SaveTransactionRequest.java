package com.bankingparser.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SaveTransactionRequest {
    private String msg;           // Original SMS content
    private String bankName;
    private String merchantName;
    private BigDecimal amount;
    private String accountNumber;
    private String txType;
    private String msgType;
    private String msgSubtype;
    private String date;          // Date string from SMS
}
