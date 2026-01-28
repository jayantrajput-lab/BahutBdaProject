package com.bankingparser.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePatternRequest {
    private Integer patternId;
    private String pattern;
    private String sample;
    private String bankName;
    private String merchantName;
    private String txType;
    private String msgType;
    private String msgSubtype;
}
