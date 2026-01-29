package com.bankingparser.repository;

import com.bankingparser.model.MerchantCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MerchantCategoryRepository extends JpaRepository<MerchantCategory, Integer> {
    
    /**
     * Find category by exact merchant name (case-insensitive)
     */
    @Query("SELECT mc FROM MerchantCategory mc WHERE UPPER(mc.merchantName) = UPPER(:merchantName)")
    Optional<MerchantCategory> findByMerchantNameIgnoreCase(@Param("merchantName") String merchantName);
    
    /**
     * Find category where merchant name contains the search term (case-insensitive)
     */
    @Query("SELECT mc FROM MerchantCategory mc WHERE UPPER(mc.merchantName) LIKE UPPER(CONCAT('%', :searchTerm, '%'))")
    Optional<MerchantCategory> findByMerchantNameContainingIgnoreCase(@Param("searchTerm") String searchTerm);
}
