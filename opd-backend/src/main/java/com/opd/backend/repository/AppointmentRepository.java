package com.opd.backend.repository;

import com.opd.backend.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByAppointmentDateBetweenOrderByAppointmentDateAsc(LocalDateTime startOfDay, LocalDateTime endOfDay);
}
