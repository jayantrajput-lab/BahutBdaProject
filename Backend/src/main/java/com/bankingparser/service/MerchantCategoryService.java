package com.bankingparser.service;

import com.bankingparser.model.MerchantCategory;
import com.bankingparser.repository.MerchantCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class MerchantCategoryService {

    @Autowired
    private MerchantCategoryRepository merchantCategoryRepository;

    @Value("${groq.api.key:}")
    private String groqApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

    // Valid categories
    private static final Set<String> VALID_CATEGORIES = Set.of(
        "FOOD", "HEALTH", "SHOPPING", "TRAVEL", "ENTERTAINMENT", 
        "BILLS", "SALARY", "TRANSFER", "FUEL", "GROCERIES", "OTHER"
    );


    /**
     * Get category for a merchant name
     * 1. First checks the database
     * 2. If not found, calls Groq LLM API
     * 3. Saves the result to database for future lookups
     */
    public String getCategoryForMerchant(String merchantName) {
        if (merchantName == null || merchantName.trim().isEmpty()) {
            return null;
        }

        String cleanedName = merchantName.trim().toUpperCase();

        // Step 1: Check exact match in database
        Optional<MerchantCategory> exactMatch = merchantCategoryRepository.findByMerchantNameIgnoreCase(cleanedName);
        if (exactMatch.isPresent()) {
            return exactMatch.get().getCategory();
        }

        // Step 2: Check partial match (for variations like "ZOMATO FOODS" matching "ZOMATO")
        for (MerchantCategory mc : merchantCategoryRepository.findAll()) {
            if (cleanedName.contains(mc.getMerchantName().toUpperCase()) || 
                mc.getMerchantName().toUpperCase().contains(cleanedName)) {
                return mc.getCategory();
            }
        }

        // Step 3: Call LLM API to classify
        String category = classifyMerchantWithLLM(merchantName);
        
        // Step 4: Save to database for future lookups
        if (category != null && !category.equals("OTHER")) {
            try {
                MerchantCategory newEntry = new MerchantCategory(cleanedName, category);
                merchantCategoryRepository.save(newEntry);
            } catch (Exception e) {
                // Ignore duplicate key errors
            }
        }

        return category;
    }

    /**
     * Call Groq LLM API to classify the merchant
     */
    private String classifyMerchantWithLLM(String merchantName) {
        // If no API key configured, return OTHER
        if (groqApiKey == null || groqApiKey.isEmpty()) {
            return "OTHER";
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(groqApiKey);

            String prompt = String.format(
                "Classify the merchant '%s' into exactly ONE of these categories: " +
                "FOOD, HEALTH, SHOPPING, TRAVEL, ENTERTAINMENT, BILLS, SALARY, TRANSFER, FUEL, GROCERIES, OTHER. " +
                "Respond with ONLY the category name, nothing else.",
                merchantName
            );

            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "llama-3.3-70b-versatile");
            requestBody.put("messages", List.of(message));
            requestBody.put("max_tokens", 20);
            requestBody.put("temperature", 0);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                GROQ_API_URL,
                HttpMethod.POST,
                request,
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> firstChoice = choices.get(0);
                    Map<String, String> messageResponse = (Map<String, String>) firstChoice.get("message");
                    String category = messageResponse.get("content").trim().toUpperCase();
                    
                    // Validate the category
                    if (VALID_CATEGORIES.contains(category)) {
                        return category;
                    }
                }
            }
        } catch (Exception e) {
            // Log error but don't fail
            System.err.println("Error calling Groq API: " + e.getMessage());
        }

        return "OTHER";
    }

    /**
     * Manually add a merchant-category mapping
     */
    public MerchantCategory addMerchantCategory(String merchantName, String category) {
        MerchantCategory mc = new MerchantCategory(merchantName.toUpperCase(), category.toUpperCase());
        return merchantCategoryRepository.save(mc);
    }

    /**
     * Get all merchant categories
     */
    public List<MerchantCategory> getAllMerchantCategories() {
        return merchantCategoryRepository.findAll();
    }
}
