package com.bankingparser.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "bank_table")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Bank {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bank_id")
    private Integer bankId;
    
    @Column(nullable = false)
    private String bankname;
}
