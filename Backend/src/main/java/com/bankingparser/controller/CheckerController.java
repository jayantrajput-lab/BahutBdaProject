package com.bankingparser.controller;

import com.bankingparser.dto.ExtractFieldsRequest;
import com.bankingparser.dto.ExtractedFieldsResponse;
import com.bankingparser.dto.UpdatePatternRequest;
import com.bankingparser.model.Pattern;
import com.bankingparser.service.PatternService;
import com.bankingparser.service.RegexService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/checker")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('CHECKER')")
public class CheckerController {

    @Autowired
    private PatternService patternService;

    @Autowired
    private RegexService regexService;

    /**
     * Get all pending patterns for approval
     * Endpoint: GET /checker/getPendings
     */
    @GetMapping("/getPendings")
    public ResponseEntity<List<Pattern>> getPendings() {
        List<Pattern> pendings = patternService.getPendings();
        return ResponseEntity.ok(pendings);
    }

    /**
     * Extract fields from SMS using provided regex pattern
     * Endpoint: POST /checker/extractFields
     * Body: { "regexPattern": "...", "sms": "..." }
     */
    @PostMapping("/extractFields")
    public ResponseEntity<ExtractedFieldsResponse> extractFields(@RequestBody ExtractFieldsRequest request) {
        ExtractedFieldsResponse response = regexService.extractFields(request.getRegexPattern(), request.getSms());
        return ResponseEntity.ok(response);
    }

    /**
     * Approve a pattern (update all fields and status to APPROVED)
     * Endpoint: POST /checker/approve
     * Body: { "patternId": 1, "pattern": "...", "sample": "...", "bankName": "...", ... }
     */
    @PostMapping("/approve")
    public ResponseEntity<?> approve(@RequestBody UpdatePatternRequest request) {
        try {
            Pattern updatedPattern = patternService.updatePattern(request, "APPROVED");
            return ResponseEntity.ok(updatedPattern);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error approving pattern: " + e.getMessage());
        }
    }

    /**
     * Reject a pattern (update all fields and status to REJECTED)
     * Endpoint: POST /checker/reject
     * Body: { "patternId": 1, "pattern": "...", "sample": "...", "bankName": "...", ... }
     */
    @PostMapping("/reject")
    public ResponseEntity<?> reject(@RequestBody UpdatePatternRequest request) {
        try {
            Pattern updatedPattern = patternService.updatePattern(request, "REJECTED");
            return ResponseEntity.ok(updatedPattern);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error rejecting pattern: " + e.getMessage());
        }
    }
}
