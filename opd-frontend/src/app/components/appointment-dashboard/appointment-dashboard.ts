import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService, Appointment, Patient } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-appointment-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div style="margin-bottom: 4rem;">
      <h1 class="page-title">Appointments</h1>
      <p class="page-subtitle">Schedule new sessions and oversee today's active roster.</p>
    </div>

    <div class="layout-split">
      <!-- Form Column -->
      <div>
        <div class="card">
          <h2 class="section-title">Schedule Session</h2>
          <form [formGroup]="aptForm" (ngSubmit)="onSubmit()">
            
            <div class="form-group">
              <label>Select Patient</label>
              <div class="custom-dropdown" [class.open]="isPatientOpen" (click)="isPatientOpen = !isPatientOpen">
                <div class="dropdown-selected">{{ getSelectedPatientName() }}</div>
                <div class="dropdown-options" *ngIf="isPatientOpen">
                  <div class="dropdown-option" (click)="setPatient('')">-- Choose a patient --</div>
                  <div class="dropdown-option" *ngFor="let p of patients" (click)="setPatient(p.id)">
                    {{ p.name }} ({{ p.phoneNumber }})
                  </div>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Doctor Name</label>
              <input type="text" class="form-control" formControlName="doctorName" placeholder="Dr. Kirtan Patel">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
              <div>
                <label>Date</label>
                <input type="date" class="form-control" formControlName="date">
              </div>
              <div>
                <label>Time</label>
                <input type="time" class="form-control" formControlName="time">
              </div>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;" [disabled]="!aptForm.valid">
              Confirm Booking
            </button>
          </form>
        </div>
      </div>

      <!-- Schedule Column -->
      <div style="padding-top: 0.5rem;">
        <h2 class="section-title" style="padding-left: 1rem; border-bottom: none; margin-bottom: 1.5rem;">Today's Roster</h2>
        
        <div class="table-container">
          <div *ngIf="isLoading" class="loading-state">Syncing roster...</div>
          <table class="data-table" *ngIf="!isLoading">
            <thead>
              <tr>
                <th style="padding-left: 1rem;">Details</th>
                <th>Doctor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let apt of todayAppointments">
                <td style="padding-left: 1rem;">
                  <div style="font-weight: 500; font-size: 1.125rem; color: var(--text-primary);">{{ apt.patient?.name }}</div>
                  <div style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.35rem;">
                    {{ apt.appointmentDate | date:'shortTime' }}
                  </div>
                </td>
                <td style="color: var(--text-secondary);">{{ apt.doctorName }}</td>
                <td>
                  <span class="badge" [ngClass]="apt.status === 'COMPLETED' ? 'completed' : 'scheduled'">
                    {{ apt.status }}
                  </span>
                </td>
              </tr>
              <tr *ngIf="todayAppointments.length === 0">
                <td colspan="3" style="border: none;">
                  <div class="empty-state">
                    <svg width="64" height="64" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"></path>
                    </svg>
                    <p style="font-size: 1.125rem;">No appointments scheduled today.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AppointmentDashboardComponent implements OnInit {
  aptForm: FormGroup;
  patients: Patient[] = [];
  todayAppointments: Appointment[] = [];
  isPatientOpen = false;
  isLoading = true;

  constructor(private fb: FormBuilder, private apiService: ApiService, private toastService: ToastService, private cdr: ChangeDetectorRef) {
    const now = new Date();
    // Use local time for date and time formatting
    const offset = now.getTimezoneOffset() * 60000;
    const localNow = new Date(now.getTime() - offset);
    
    const currentDate = localNow.toISOString().split('T')[0];
    const currentTime = localNow.toISOString().split('T')[1].substring(0, 5);

    this.aptForm = this.fb.group({
      patientId: ['', Validators.required],
      doctorName: ['', Validators.required],
      date: [currentDate, Validators.required],
      time: [currentTime, Validators.required]
    });
  }

  ngOnInit(): void {
    this.apiService.getPatients().subscribe(data => {
      this.patients = data;
      this.cdr.detectChanges();
    });
    this.loadTodayAppointments();
  }

  loadTodayAppointments() {
    this.isLoading = true;
    this.apiService.getTodayAppointments().subscribe(data => {
      this.todayAppointments = data;
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  setPatient(id: any) {
    this.aptForm.patchValue({patientId: id});
  }

  getSelectedPatientName() {
    const id = this.aptForm.get('patientId')?.value;
    if (!id) return '-- Choose a patient --';
    const p = this.patients.find(x => x.id === id);
    return p ? `${p.name} (${p.phoneNumber})` : '-- Choose a patient --';
  }

  onSubmit() {
    if (this.aptForm.valid) {
      const v = this.aptForm.value;
      const payload = {
        patientId: v.patientId,
        doctorName: v.doctorName,
        appointmentDate: `${v.date}T${v.time}:00`
      };
      this.apiService.bookAppointment(payload).subscribe(res => {
        this.aptForm.reset({patientId: ''});
        this.isPatientOpen = false;
        this.loadTodayAppointments();
        this.toastService.show('Appointment scheduled successfully!');
        this.cdr.detectChanges();
      });
    }
  }
}
