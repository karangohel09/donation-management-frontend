package com.itc.demo.repository;

import com.itc.demo.entity.DonorAppeal;
import com.itc.demo.entity.Donor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonorAppealRepository extends JpaRepository<DonorAppeal, Long> {
    
    // Find all donor-appeal links for a specific appeal
    List<DonorAppeal> findByAppealId(Long appealId);
    
    // Find all donor-appeal links for a specific donor
    List<DonorAppeal> findByDonorId(Long donorId);
    
    // Find all donors linked to an appeal
    @Query("SELECT da.donor FROM DonorAppeal da WHERE da.appeal.id = :appealId")
    List<Donor> findDonorsByAppealId(@Param("appealId") Long appealId);
    
    // Check if a donor is linked to an appeal
    boolean existsByDonorIdAndAppealId(Long donorId, Long appealId);
}
