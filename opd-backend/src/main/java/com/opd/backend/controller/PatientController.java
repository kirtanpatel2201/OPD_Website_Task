package com.opd.backend.controller;

import com.opd.backend.model.Patient;
import com.opd.backend.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "*")
public class PatientController {

    @Autowired
    private PatientRepository patientRepository;

    @PostMapping
    public Patient addPatient(@RequestBody Patient patient) {
        return patientRepository.save(patient);
    }

    @GetMapping
    public List<Patient> listPatients(@RequestParam(required = false) String search) {
        if (search != null && !search.trim().isEmpty()) {
            return patientRepository.searchByNameOrPhone(search);
        }
        return patientRepository.findAll();
    }
}
