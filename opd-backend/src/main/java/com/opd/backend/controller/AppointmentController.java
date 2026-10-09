package com.opd.backend.controller;

import com.opd.backend.model.Appointment;
import com.opd.backend.model.Patient;
import com.opd.backend.repository.AppointmentRepository;
import com.opd.backend.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    public static class AppointmentRequest {
        public Long patientId;
        public String doctorName;
        public LocalDateTime appointmentDate;
    }

    @PostMapping
    public Appointment bookAppointment(@RequestBody AppointmentRequest request) {
        Patient patient = patientRepository.findById(request.patientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctorName(request.doctorName);
        appointment.setAppointmentDate(request.appointmentDate);
        appointment.setStatus("SCHEDULED");
        
        return appointmentRepository.save(appointment);
    }

    @GetMapping("/today")
    public List<Appointment> listTodayAppointments() {
        return appointmentRepository.findAll();
    }
}
