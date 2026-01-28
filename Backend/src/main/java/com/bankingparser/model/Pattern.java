package com.bankingparser.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "pattern_table")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pattern {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pattern_id")
    private Integer patternId;
    
    @Column(name = "bank_id")
    private Integer bankId;
    
    @Column(name = "regex_pattern", nullable = false, columnDefinition = "TEXT")
    private String pattern;
    
    @Column(name = "sample_ex", columnDefinition = "TEXT")
    private String sample;
    
    @Column(nullable = false)
    private String status; // "PENDING", "APPROVED", "REJECTED", "FAILED"
    
    @Column(name = "bank_name")
    private String bankName;
    
    @Column(name = "merchant_name")
    private String merchantName;
    
    @Column(name = "tx_type")
    private String txType;
    
    @Column(name = "msg_type")
    private String msgType;
    
    @Column(name = "msg_subtype")
    private String msgSubtype;
    
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_id", insertable = false, updatable = false)
    private Bank bank;
}
