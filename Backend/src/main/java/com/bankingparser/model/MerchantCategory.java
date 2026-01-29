package com.bankingparser.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "merchant_category")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MerchantCategory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "merchant_name", unique = true, nullable = false)
    private String merchantName;
    
    @Column(nullable = false)
    private String category; // FOOD, HEALTH, SHOPPING, TRAVEL, ENTERTAINMENT, BILLS, TRANSFER, OTHER
    
    public MerchantCategory(String merchantName, String category) {
        this.merchantName = merchantName;
        this.category = category;
    }
}
