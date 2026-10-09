import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService, Patient } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div style="margin-bottom: 4rem;">
      <h1 class="page-title">Patients Directory</h1>
      <p class="page-subtitle">Register new patients and seamlessly browse the directory.</p>
    </div>

    <div class="layout-split">
      <!-- Left Column: Form -->
      <div>
        <div class="card">
          <h2 class="section-title">New Patient</h2>
          <form [formGroup]="patientForm" (ngSubmit)="onSubmit()">
            
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" class="form-control" formControlName="name" placeholder="Kirtan Patel">
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.75rem;">
              <div>
                <label style="display:block; font-size: 0.875rem; font-weight: 500; color: var(--text-secondary); margin-bottom: 0.75rem;">Gender</label>
                <div class="custom-dropdown" [class.open]="isGenderOpen" (click)="isGenderOpen = !isGenderOpen">
                  <div class="dropdown-selected">{{ patientForm.get('gender')?.value || 'Select...' }}</div>
                  <div class="dropdown-options" *ngIf="isGenderOpen">
                    <div class="dropdown-option" (click)="setGender('')">Select...</div>
                    <div class="dropdown-option" (click)="setGender('Male')">Male</div>
                    <div class="dropdown-option" (click)="setGender('Female')">Female</div>
                    <div class="dropdown-option" (click)="setGender('Other')">Other</div>
                  </div>
                </div>
              </div>
              <div>
                <label style="display:block; font-size: 0.875rem; font-weight: 500; color: var(--text-secondary); margin-bottom: 0.75rem;">Age</label>
                <input type="number" class="form-control" formControlName="age" placeholder="30">
              </div>
            </div>

            <div class="form-group">
              <label>Phone Number</label>
              <div style="display: flex; align-items: center; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0 0.75rem; height: 3.25rem; transition: border-color 0.2s ease, box-shadow 0.2s ease;" class="phone-input-wrapper">
                <span style="font-weight: 500; color: var(--text-secondary); margin-right: 0.5rem;">+91</span>
                <input type="text" style="border: none; box-shadow: none; padding: 0; flex: 1; background: transparent; outline: none; color: var(--text-primary); font-size: 1rem; height: 100%;" formControlName="phoneNumber" placeholder="9898123456" maxlength="10">
              </div>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;" [disabled]="!patientForm.valid">
              Register Patient
            </button>
          </form>
        </div>
      </div>

      <!-- Right Column: List -->
      <div style="padding-top: 0.5rem;">
        <div class="form-group">
          <input type="text" class="form-control" placeholder="Search patients by name or phone..." 
                 (input)="onSearch($event)" style="border-radius: 9999px; padding-left: 1.5rem; box-shadow: var(--shadow-soft); background: var(--bg-surface);">
        </div>

        <div class="table-container">
          <div *ngIf="isLoading" class="loading-state">Syncing patients...</div>
          <table class="data-table" *ngIf="!isLoading">
            <thead>
              <tr>
                <th style="padding-left: 1rem;">Patient</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of patients">
                <td style="padding-left: 1rem;">
                  <div style="font-weight: 500; font-size: 1.125rem; color: var(--text-primary);">{{ p.name }}</div>
                  <div style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.35rem;">
                    {{ p.gender }} &middot; {{ p.age }} yrs
                  </div>
                </td>
                <td style="color: var(--text-secondary);">{{ p.phoneNumber }}</td>
              </tr>
              <tr *ngIf="patients.length === 0">
                <td colspan="2" style="border: none;">
                  <div class="empty-state">
                    <svg width="64" height="64" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"></path>
                    </svg>
                    <p style="font-size: 1.125rem;">No patients found.</p>
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
export class PatientListComponent implements OnInit {
  patientForm: FormGroup;
  patients: Patient[] = [];
  isGenderOpen = false;
  isLoading = true;

  constructor(private fb: FormBuilder, private apiService: ApiService, private toastService: ToastService, private cdr: ChangeDetectorRef) {
    this.patientForm = this.fb.group({
      name: ['', Validators.required],
      gender: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(0)]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
    });
  }

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(search?: string) {
    this.isLoading = true;
    this.apiService.getPatients(search).subscribe(data => {
      this.patients = data;
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  onSearch(event: any) {
    const term = event.target.value;
    this.loadPatients(term);
  }

  setGender(val: string) {
    this.patientForm.patchValue({gender: val});
  }

  onSubmit() {
    if (this.patientForm.valid) {
      this.apiService.addPatient(this.patientForm.value).subscribe(res => {
        this.patientForm.reset({gender: ''});
        this.isGenderOpen = false;
        this.loadPatients();
        this.toastService.show('Patient registered successfully!');
        this.cdr.detectChanges();
      });
    }
  }
}
