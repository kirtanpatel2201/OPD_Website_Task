package com.opd.backend.repository;

import com.opd.backend.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    @Query("SELECT p FROM Patient p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR p.phoneNumber LIKE CONCAT('%', :query, '%')")
    List<Patient> searchByNameOrPhone(@Param("query") String query);
}
