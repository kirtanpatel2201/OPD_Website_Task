package com.opd.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "consultations")
public class Consultation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    @Column(name = "vitals_bp")
    private String vitalsBp;

    @Column(name = "vitals_heart_rate")
    private String vitalsHeartRate;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
