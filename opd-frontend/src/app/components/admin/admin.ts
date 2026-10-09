import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Patient, Appointment, Consultation } from '../../services/api.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="margin-bottom: 3rem;">
      <h1 class="page-title">Admin Dashboard</h1>
      <p class="page-subtitle">Complete overview of all clinic data in one unified view.</p>
    </div>

    <!-- KPI Cards -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-bottom: 4rem;">
      <div class="card" style="text-align: center; padding: 2.5rem 1rem;">
        <h3 style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Total Patients</h3>
        <div style="font-size: 3rem; font-weight: 700; color: var(--text-primary);">{{ patients.length }}</div>
      </div>
      <div class="card" style="text-align: center; padding: 2.5rem 1rem;">
        <h3 style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Today's Appointments</h3>
        <div style="font-size: 3rem; font-weight: 700; color: var(--text-primary);">{{ appointments.length }}</div>
      </div>
      <div class="card" style="text-align: center; padding: 2.5rem 1rem;">
        <h3 style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Total Consultations</h3>
        <div style="font-size: 3rem; font-weight: 700; color: var(--text-primary);">{{ consultations.length }}</div>
      </div>
    </div>

    <!-- Patients Database -->
    <div class="card" style="margin-bottom: 3rem;">
      <h2 class="section-title">Patients Database</h2>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of patients">
              <td style="font-weight: 500;">#{{ p.id }}</td>
              <td>{{ p.name }}</td>
              <td>{{ p.age }}</td>
              <td>{{ p.gender }}</td>
              <td>{{ p.phoneNumber }}</td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="patients.length === 0" class="empty-state">No patients found.</div>
      </div>
    </div>

    <!-- Appointments Database -->
    <div class="card" style="margin-bottom: 3rem;">
      <h2 class="section-title">Appointments Database</h2>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date/Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let a of appointments">
              <td style="font-weight: 500;">#{{ a.id }}</td>
              <td>{{ a.patient?.name }}</td>
              <td>{{ a.doctorName }}</td>
              <td>{{ a.appointmentDate | date:'medium' }}</td>
              <td><span class="badge" [ngClass]="a.status === 'COMPLETED' ? 'completed' : 'scheduled'">{{ a.status }}</span></td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="appointments.length === 0" class="empty-state">No appointments found.</div>
      </div>
    </div>

    <!-- Consultations Database -->
    <div class="card" style="margin-bottom: 3rem;">
      <h2 class="section-title">Consultations Database</h2>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Vitals (BP / HR)</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of consultations">
              <td style="font-weight: 500;">#{{ c.id }}</td>
              <td>{{ c.appointment?.patient?.name }}</td>
              <td>{{ c.vitalsBp || 'N/A' }} / {{ c.vitalsHeartRate || 'N/A' }}</td>
              <td>{{ c.notes }}</td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="consultations.length === 0" class="empty-state">No consultations found.</div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  patients: Patient[] = [];
  appointments: Appointment[] = [];
  consultations: Consultation[] = [];

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.api.getPatients().subscribe(data => {
      this.patients = data;
      // Also fetch all consultations by extracting IDs or creating a new endpoint.
      // Since we don't have a "getAllConsultations" endpoint, we can iterate or add one to backend.
      // Wait, there's no endpoint for all consultations. But I can add one!
      this.cdr.detectChanges();
    });
    this.api.getTodayAppointments().subscribe(data => {
      this.appointments = data;
      this.cdr.detectChanges();
    });
    // For full dashboard, we need all consultations. I will add a method to backend and frontend.
    this.api.getAllConsultations().subscribe(data => {
       this.consultations = data;
       this.cdr.detectChanges();
    });
  }
}
