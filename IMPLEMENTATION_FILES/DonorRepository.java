package com.itc.demo.repository;

import com.itc.demo.entity.Donor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonorRepository extends JpaRepository<Donor, Long> {
    
    /**
     * Find all donors who donated to a specific appeal
     */
    @Query("SELECT d FROM Donor d WHERE d.id IN (SELECT da.donorId FROM DonorAppeal da WHERE da.appealId = :appealId)")
    List<Donor> findDonorsByAppealId(@Param("appealId") Long appealId);
    
    /**
     * Find donors by name
     */
    List<Donor> findByNameContainingIgnoreCase(String name);
    
    /**
     * Find donor by email
     */
    Donor findByEmail(String email);
}
