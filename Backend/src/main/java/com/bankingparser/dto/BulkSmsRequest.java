package com.bankingparser.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkSmsRequest {
    private List<SmsItem> smsList;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SmsItem {
        private String smsTitle;
        private String sms;
    }
}
