package com.opd.backend.controller;

import com.opd.backend.model.Appointment;
import com.opd.backend.model.Consultation;
import com.opd.backend.repository.AppointmentRepository;
import com.opd.backend.repository.ConsultationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/consultations")
@CrossOrigin(origins = "*")
public class ConsultationController {

    @Autowired
    private ConsultationRepository consultationRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    public static class ConsultationRequest {
        public Long appointmentId;
        public String vitalsBp;
        public String vitalsHeartRate;
        public String notes;
    }

    @PostMapping
    public Consultation submitConsultation(@RequestBody ConsultationRequest request) {
        Appointment appointment = appointmentRepository.findById(request.appointmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));

        if ("COMPLETED".equals(appointment.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Appointment already completed");
        }

        Consultation consultation = new Consultation();
        consultation.setAppointment(appointment);
        consultation.setVitalsBp(request.vitalsBp);
        consultation.setVitalsHeartRate(request.vitalsHeartRate);
        consultation.setNotes(request.notes);

        Consultation saved = consultationRepository.save(consultation);

        // Mark appointment as complete
        appointment.setStatus("COMPLETED");
        appointmentRepository.save(appointment);

        return saved;
    }

    @GetMapping("/patient/{patientId}")
    public List<Consultation> getConsultationsForPatient(@PathVariable Long patientId) {
        return consultationRepository.findByAppointment_Patient_IdOrderByAppointment_AppointmentDateDesc(patientId);
    }

    @GetMapping
    public List<Consultation> getAllConsultations() {
        return consultationRepository.findAll();
    }
}
