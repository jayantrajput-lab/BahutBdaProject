package com.bankingparser.controller;

import com.bankingparser.dto.ExtractFieldsRequest;
import com.bankingparser.dto.ExtractedFieldsResponse;
import com.bankingparser.dto.FindPatternRequest;
import com.bankingparser.dto.SavePatternRequest;
import com.bankingparser.model.Pattern;
import com.bankingparser.service.PatternService;
import com.bankingparser.service.RegexService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/maker")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('MAKER')")
public class MakerController {

    @Autowired
    private PatternService patternService;

    @Autowired
    private RegexService regexService;

    /**
     * Get all draft patterns
     * Endpoint: GET /maker/getDrafts
     */
    @GetMapping("/getDrafts")
    public ResponseEntity<List<Pattern>> getDrafts() {
        List<Pattern> drafts = patternService.getDrafts();
        return ResponseEntity.ok(drafts);
    }

    /**
     * Get all rejected patterns
     * Endpoint: GET /maker/getRejected
     */
    @GetMapping("/getRejected")
    public ResponseEntity<List<Pattern>> getRejected() {
        List<Pattern> rejected = patternService.getRejected();
        return ResponseEntity.ok(rejected);
    }

    /**
     * Get all failed patterns
     * Endpoint: GET /maker/getFailed
     */
    @GetMapping("/getFailed")
    public ResponseEntity<List<Pattern>> getFailed() {
        List<Pattern> failed = patternService.getFailed();
        return ResponseEntity.ok(failed);
    }

    /**
     * Extract fields from SMS using provided regex pattern
     * Endpoint: POST /maker/extractFields
     * Body: { "regexPattern": "...", "sms": "..." }
     */
    @PostMapping("/extractFields")
    public ResponseEntity<ExtractedFieldsResponse> extractFields(@RequestBody ExtractFieldsRequest request) {
        ExtractedFieldsResponse response = regexService.extractFields(request.getRegexPattern(), request.getSms());
        return ResponseEntity.ok(response);
    }

    /**
     * Save pattern as DRAFT
     * Endpoint: POST /maker/saveDraft
     * Body: { "smsTitle": "...", "pattern": "...", "sample": "...", "bankName": "...", ... }
     */
    @PostMapping("/saveDraft")
    public ResponseEntity<?> saveDraft(@RequestBody SavePatternRequest request) {
        try {
            Pattern savedPattern = patternService.savePattern(request, "DRAFT");
            return ResponseEntity.ok(savedPattern);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error saving draft: " + e.getMessage());
        }
    }

    /**
     * Save pattern as PENDING (submit for approval)
     * Endpoint: POST /maker/savePending
     * Body: { "smsTitle": "...", "pattern": "...", "sample": "...", "bankName": "...", ... }
     */
    @PostMapping("/savePending")
    public ResponseEntity<?> savePending(@RequestBody SavePatternRequest request) {
        try {
            Pattern savedPattern = patternService.savePattern(request, "PENDING");
            return ResponseEntity.ok(savedPattern);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error saving pattern: " + e.getMessage());
        }
    }

    /**
     * Update existing pattern to PENDING (submit draft for approval)
     * Endpoint: PUT /maker/submitDraft/{patternId}
     */
    @PutMapping("/submitDraft/{patternId}")
    public ResponseEntity<?> submitDraft(@PathVariable Integer patternId, @RequestBody SavePatternRequest request) {
        try {
            Pattern updatedPattern = patternService.updatePatternToPending(patternId, request);
            return ResponseEntity.ok(updatedPattern);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error submitting draft: " + e.getMessage());
        }
    }

    /**
     * Update existing draft pattern
     * Endpoint: PUT /maker/updateDraft/{patternId}
     */
    @PutMapping("/updateDraft/{patternId}")
    public ResponseEntity<?> updateDraft(@PathVariable Integer patternId, @RequestBody SavePatternRequest request) {
        try {
            Pattern updatedPattern = patternService.updateDraft(patternId, request);
            return ResponseEntity.ok(updatedPattern);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating draft: " + e.getMessage());
        }
    }

    /**
     * Check if an approved pattern already exists for the given SMS
     * Endpoint: POST /maker/checkPattern
     * Body: { "sms": "...", "smsTitle": "AD-SBIBNK-S" }
     * 
     * Returns matched=true if pattern exists, matched=false if no pattern found
     * Does NOT save failed patterns to DB
     */
    @PostMapping("/checkPattern")
    public ResponseEntity<ExtractedFieldsResponse> checkPattern(@RequestBody FindPatternRequest request) {
        ExtractedFieldsResponse response = regexService.checkPatternExists(request.getSms(), request.getSmsTitle());
        return ResponseEntity.ok(response);
    }
}
