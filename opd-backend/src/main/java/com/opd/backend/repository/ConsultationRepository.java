package com.opd.backend.repository;

import com.opd.backend.model.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsultationRepository extends JpaRepository<Consultation, Long> {
    List<Consultation> findByAppointment_Patient_IdOrderByAppointment_AppointmentDateDesc(Long patientId);
}
