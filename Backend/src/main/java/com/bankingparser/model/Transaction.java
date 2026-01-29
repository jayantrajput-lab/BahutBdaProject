package com.bankingparser.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "transaction_table")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tx_id")
    private Integer txId;
    
    @Column(name = "user_id", nullable = false)
    private Integer userId;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String msg;
    
    @Column(name = "bank_name")
    private String bankName;
    
    @Column(name = "merchant_name")
    private String merchantName;
    
    private BigDecimal amount;
    
    @Column(name = "account_number")
    private String accountNumber;
    
    @Column(name = "tx_type")
    private String txType;
    
    @Column(name = "msg_type")
    private String msgType;
    
    @Column(name = "msg_subtype")
    private String msgSubtype;
    
    private LocalDate date;
    
    @Column(name = "reference_no")
    private String referenceNo;
    
    @Column(name = "available_balance")
    private java.math.BigDecimal availableBalance;
    
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
}
