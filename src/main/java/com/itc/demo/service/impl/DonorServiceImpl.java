package com.itc.demo.service.impl;

import com.itc.demo.entity.Donor;
import com.itc.demo.repository.DonorRepository;
import com.itc.demo.service.DonorService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@Transactional
public class DonorServiceImpl implements DonorService {
    
    @Autowired
    private DonorRepository donorRepository;
    
    @Override
    public List<Donor> getAllDonors() {
        log.info("Fetching all donors");
        List<Donor> donors = donorRepository.findAll();
        log.info("Found {} donors", donors.size());
        return donors;
    }
    
    @Override
    public Optional<Donor> getDonorById(Long id) {
        log.info("Fetching donor with ID: {}", id);
        return donorRepository.findById(id);
    }
    
    @Override
    public Donor saveDonor(Donor donor) {
        log.info("Saving new donor: {}", donor.getName());
        
        // Set creation timestamp
        if (donor.getCreatedAt() == null) {
            donor.setCreatedAt(LocalDateTime.now());
        }
        
        Donor savedDonor = donorRepository.save(donor);
        log.info("Donor saved successfully with ID: {}", savedDonor.getId());
        return savedDonor;
    }
    
    @Override
    public Donor updateDonor(Long id, Donor donorDetails) {
        log.info("Updating donor with ID: {}", id);
        
        Donor donor = donorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Donor not found with ID: " + id));
        
        if (donorDetails.getName() != null && !donorDetails.getName().isEmpty()) {
            donor.setName(donorDetails.getName());
        }
        if (donorDetails.getEmail() != null && !donorDetails.getEmail().isEmpty()) {
            donor.setEmail(donorDetails.getEmail());
        }
        if (donorDetails.getPhoneNumber() != null && !donorDetails.getPhoneNumber().isEmpty()) {
            donor.setPhoneNumber(donorDetails.getPhoneNumber());
        }
        
        Donor updatedDonor = donorRepository.save(donor);
        log.info("Donor updated successfully");
        return updatedDonor;
    }
    
    @Override
    public void deleteDonor(Long id) {
        log.info("Deleting donor with ID: {}", id);
        
        if (!donorRepository.existsById(id)) {
            throw new RuntimeException("Donor not found with ID: " + id);
        }
        
        donorRepository.deleteById(id);
        log.info("Donor deleted successfully");
    }
    
    @Override
    public List<Donor> searchDonors(String keyword) {
        log.info("Searching donors with keyword: {}", keyword);
        List<Donor> donors = donorRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                keyword, keyword
        );
        log.info("Found {} donors matching keyword", donors.size());
        return donors;
    }
}
