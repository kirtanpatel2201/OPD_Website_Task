import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService, Patient, Appointment, Consultation } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-consultation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div style="margin-bottom: 4rem;">
      <h1 class="page-title">Consultations</h1>
      <p class="page-subtitle">Record clinical vitals, save session notes, and review history.</p>
    </div>

    <div class="layout-split">
      <!-- Form Column -->
      <div class="card">
        <h2 class="section-title">Session Details</h2>

        <div class="form-group">
          <label>Select Patient</label>
          <div class="custom-dropdown" [class.open]="isPatientOpen" (click)="isPatientOpen = !isPatientOpen">
            <div class="dropdown-selected">{{ getSelectedPatientName() }}</div>
            <div class="dropdown-options" *ngIf="isPatientOpen">
              <div class="dropdown-option" (click)="setPatient('')">-- Choose a patient --</div>
              <div class="dropdown-option" *ngFor="let p of patients" (click)="setPatient(p.id)">{{ p.name }}</div>
            </div>
          </div>
        </div>

        <form [formGroup]="consultationForm" (ngSubmit)="onSubmit()" *ngIf="selectedPatientId">
          <div class="form-group">
            <label>Active Appointment</label>
            <div class="custom-dropdown" [class.open]="isAptOpen" (click)="isAptOpen = !isAptOpen">
              <div class="dropdown-selected">{{ getSelectedAptName() }}</div>
              <div class="dropdown-options" *ngIf="isAptOpen">
                <div class="dropdown-option" (click)="setApt('')">-- Select Appointment --</div>
                <div class="dropdown-option" *ngFor="let apt of activeAppointments" (click)="setApt(apt.id)">
                  {{ apt.appointmentDate | date:'shortTime' }} - {{ apt.doctorName }}
                </div>
              </div>
            </div>
            <div *ngIf="activeAppointments.length === 0" style="margin-top: 0.75rem; font-size: 0.875rem; color: #A1A1AA;">
              No active appointments found for this patient today.
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.75rem;">
            <div>
              <label style="display:block; font-size: 0.875rem; font-weight: 500; color: var(--text-secondary); margin-bottom: 0.75rem;">Blood Pressure</label>
              <input type="text" class="form-control" formControlName="vitalsBp" placeholder="120/80">
            </div>
            <div>
              <label style="display:block; font-size: 0.875rem; font-weight: 500; color: var(--text-secondary); margin-bottom: 0.75rem;">Heart Rate</label>
              <input type="text" class="form-control" formControlName="vitalsHeartRate" placeholder="72 bpm">
            </div>
          </div>

          <div class="form-group">
            <label>Clinical Notes</label>
            <textarea class="form-control" formControlName="notes" placeholder="Detailed session notes..."></textarea>
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;" [disabled]="!consultationForm.valid">
            Complete Session
          </button>
        </form>
        
        <div *ngIf="!selectedPatientId" class="empty-state" style="border: none; background: transparent; padding: 2rem;">
          <p style="font-size: 1.125rem;">Select a patient to begin.</p>
        </div>
      </div>

      <!-- History Column -->
      <div style="padding-top: 0.5rem;">
        <h2 class="section-title" style="padding-left: 1rem; border: none; margin-bottom: 1.5rem;">Patient History</h2>
        
        <div *ngIf="consultationHistory.length === 0" class="empty-state">
          <svg width="64" height="64" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"></path>
          </svg>
          <p style="font-size: 1.125rem;">No prior records.</p>
        </div>

        <div *ngFor="let cons of consultationHistory" class="card" style="margin-bottom: 1.5rem; padding: 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 1.25rem;">
            <strong style="color: var(--text-primary); font-size: 1.125rem;">{{ cons.appointment?.doctorName }}</strong>
            <span style="color: var(--text-secondary); font-size: 0.875rem;">
              {{ cons.appointment?.appointmentDate | date:'medium' }}
            </span>
          </div>
          <div style="display: flex; gap: 2rem; margin-bottom: 1.5rem;">
            <div>
              <span style="display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 0.25rem;">Blood Pressure</span>
              <span style="font-size: 1.125rem; color: var(--text-primary); font-weight: 500;">{{ cons.vitalsBp || '--' }}</span>
            </div>
            <div>
              <span style="display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 0.25rem;">Heart Rate</span>
              <span style="font-size: 1.125rem; color: var(--text-primary); font-weight: 500;">{{ cons.vitalsHeartRate || '--' }}</span>
            </div>
          </div>
          <div>
            <span style="display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 0.5rem;">Clinical Notes</span>
            <p style="font-size: 1rem; line-height: 1.6; color: var(--text-primary);">
              {{ cons.notes }}
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ConsultationFormComponent implements OnInit {
  consultationForm: FormGroup;
  patients: Patient[] = [];
  selectedPatientId: number | null = null;
  activeAppointments: Appointment[] = [];
  consultationHistory: Consultation[] = [];
  isPatientOpen = false;
  isAptOpen = false;
  isLoading = false;

  constructor(private fb: FormBuilder, private apiService: ApiService, private toastService: ToastService, private cdr: ChangeDetectorRef) {
    this.consultationForm = this.fb.group({
      appointmentId: ['', Validators.required],
      vitalsBp: [''],
      vitalsHeartRate: [''],
      notes: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.apiService.getPatients().subscribe(data => this.patients = data);
  }

  onPatientSelect(event: any) {
    const pId = event.target.value;
    if (pId) {
      this.selectedPatientId = Number(pId);
      this.apiService.getTodayAppointments().subscribe(apts => {
        this.activeAppointments = apts.filter(a => a.patient?.id === this.selectedPatientId && a.status === 'SCHEDULED');
      });
      this.loadHistory();
    } else {
      this.selectedPatientId = null;
      this.activeAppointments = [];
      this.consultationHistory = [];
    }
  }

  loadHistory() {
    if (this.selectedPatientId) {
      this.isLoading = true;
      this.apiService.getPatientConsultations(this.selectedPatientId).subscribe(data => {
        this.consultationHistory = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      });
    }
  }

  setPatient(id: any) {
    this.onPatientSelect({ target: { value: id } });
  }

  getSelectedPatientName() {
    if (!this.selectedPatientId) return '-- Choose a patient --';
    const p = this.patients.find(x => x.id === this.selectedPatientId);
    return p ? p.name : '-- Choose a patient --';
  }

  setApt(id: any) {
    this.consultationForm.patchValue({appointmentId: id});
  }

  getSelectedAptName() {
    const id = this.consultationForm.get('appointmentId')?.value;
    if (!id) return '-- Select Appointment --';
    const apt = this.activeAppointments.find(x => x.id === id);
    if (!apt) return '-- Select Appointment --';
    const time = new Date(apt.appointmentDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    return `${time} - ${apt.doctorName}`;
  }

  onSubmit() {
    if (this.consultationForm.valid) {
      this.apiService.submitConsultation(this.consultationForm.value).subscribe(res => {
        this.consultationForm.reset({appointmentId: ''});
        this.activeAppointments = this.activeAppointments.filter(a => a.id !== res.appointment?.id);
        this.isAptOpen = false;
        this.loadHistory();
        this.toastService.show('Consultation saved securely!');
        this.cdr.detectChanges();
      });
    }
  }
}
