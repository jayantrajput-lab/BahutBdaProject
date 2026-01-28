package com.bankingparser.repository;

import com.bankingparser.model.Pattern;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatternRepository extends JpaRepository<Pattern, Integer> {
    List<Pattern> findByStatus(String status);
    List<Pattern> findByBankId(Integer bankId);
    List<Pattern> findByBankIdAndStatus(Integer bankId, String status);
}
