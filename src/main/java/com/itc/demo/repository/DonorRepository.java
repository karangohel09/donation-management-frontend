package com.itc.demo.repository;

import com.itc.demo.entity.Donor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonorRepository extends JpaRepository<Donor, Long> {
    
    // Search by name or email
    List<Donor> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email);
    
    // Find by email
    Donor findByEmail(String email);
    
    // Find by phone number
    Donor findByPhoneNumber(String phoneNumber);
}
