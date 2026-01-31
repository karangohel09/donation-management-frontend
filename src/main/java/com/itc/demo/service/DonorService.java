package com.itc.demo.service;

import com.itc.demo.entity.Donor;
import java.util.List;
import java.util.Optional;

public interface DonorService {
    List<Donor> getAllDonors();
    Optional<Donor> getDonorById(Long id);
    Donor saveDonor(Donor donor);
    Donor updateDonor(Long id, Donor donorDetails);
    void deleteDonor(Long id);
    List<Donor> searchDonors(String keyword);
}
