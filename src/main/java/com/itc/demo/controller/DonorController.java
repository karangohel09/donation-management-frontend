package com.itc.demo.controller;

import com.itc.demo.entity.Donor;
import com.itc.demo.service.DonorService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/donors")
@CrossOrigin
@Slf4j
public class DonorController {
    
    @Autowired
    private DonorService donorService;
    
    /**
     * Get all donors
     */
    @GetMapping
    public ResponseEntity<List<Donor>> getAllDonors() {
        try {
            log.info("Fetching all donors");
            List<Donor> donors = donorService.getAllDonors();
            return ResponseEntity.ok(donors);
        } catch (Exception e) {
            log.error("Error fetching donors: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get donor by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Donor> getDonorById(@PathVariable Long id) {
        try {
            log.info("Fetching donor with ID: {}", id);
            Donor donor = donorService.getDonorById(id)
                    .orElseThrow(() -> new RuntimeException("Donor not found"));
            return ResponseEntity.ok(donor);
        } catch (Exception e) {
            log.error("Error fetching donor: ", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    /**
     * Add new donor
     */
    @PostMapping
    public ResponseEntity<?> addDonor(@RequestBody Donor donor) {
        try {
            log.info("Adding new donor: {}", donor.getName());
            
            // Validate required fields
            if (donor.getName() == null || donor.getName().isEmpty()) {
                return ResponseEntity.badRequest().body("Donor name is required");
            }
            if (donor.getEmail() == null || donor.getEmail().isEmpty()) {
                return ResponseEntity.badRequest().body("Email is required");
            }
            if (donor.getPhoneNumber() == null || donor.getPhoneNumber().isEmpty()) {
                return ResponseEntity.badRequest().body("Phone number is required");
            }
            
            Donor savedDonor = donorService.saveDonor(donor);
            log.info("Donor added successfully with ID: {}", savedDonor.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(savedDonor);
        } catch (Exception e) {
            log.error("Error adding donor: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to add donor: " + e.getMessage());
        }
    }
    
    /**
     * Update donor
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateDonor(@PathVariable Long id, @RequestBody Donor donorDetails) {
        try {
            log.info("Updating donor with ID: {}", id);
            Donor updatedDonor = donorService.updateDonor(id, donorDetails);
            log.info("Donor updated successfully");
            return ResponseEntity.ok(updatedDonor);
        } catch (Exception e) {
            log.error("Error updating donor: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update donor: " + e.getMessage());
        }
    }
    
    /**
     * Delete donor
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDonor(@PathVariable Long id) {
        try {
            log.info("Deleting donor with ID: {}", id);
            donorService.deleteDonor(id);
            log.info("Donor deleted successfully");
            return ResponseEntity.ok("Donor deleted successfully");
        } catch (Exception e) {
            log.error("Error deleting donor: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete donor: " + e.getMessage());
        }
    }
    
    /**
     * Search donors by name or email
     */
    @GetMapping("/search")
    public ResponseEntity<List<Donor>> searchDonors(@RequestParam String keyword) {
        try {
            log.info("Searching donors with keyword: {}", keyword);
            List<Donor> donors = donorService.searchDonors(keyword);
            return ResponseEntity.ok(donors);
        } catch (Exception e) {
            log.error("Error searching donors: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
