import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Patient {
  id?: number;
  name: string;
  gender: string;
  age: number;
  phoneNumber: string;
}

export interface Appointment {
  id?: number;
  patient?: Patient;
  doctorName: string;
  appointmentDate: string;
  status?: string;
}

export interface Consultation {
  id?: number;
  appointment?: Appointment;
  vitalsBp: string;
  vitalsHeartRate: string;
  notes: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Change this to your deployed backend URL when deploying to Vercel/Render (e.g., 'https://your-backend.up.railway.app/api')
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient, private zone: NgZone) { }

  private runInZone<T>(obs: Observable<T>): Observable<T> {
    return new Observable(sub => {
      obs.subscribe({
        next: v => this.zone.run(() => sub.next(v)),
        error: e => this.zone.run(() => sub.error(e)),
        complete: () => this.zone.run(() => sub.complete())
      });
    });
  }

  // --- Patients ---
  getPatients(search?: string): Observable<Patient[]> {
    let url = `${this.baseUrl}/patients`;
    if (search) {
      url += `?search=${encodeURIComponent(search)}`;
    }
    return this.runInZone(this.http.get<Patient[]>(url));
  }

  addPatient(patient: Patient): Observable<Patient> {
    return this.runInZone(this.http.post<Patient>(`${this.baseUrl}/patients`, patient));
  }

  // --- Appointments ---
  getTodayAppointments(): Observable<Appointment[]> {
    return this.runInZone(this.http.get<Appointment[]>(`${this.baseUrl}/appointments/today`));
  }

  bookAppointment(payload: { patientId: number, doctorName: string, appointmentDate: string }): Observable<Appointment> {
    return this.runInZone(this.http.post<Appointment>(`${this.baseUrl}/appointments`, payload));
  }

  // --- Consultations ---
  submitConsultation(payload: { appointmentId: number, vitalsBp: string, vitalsHeartRate: string, notes: string }): Observable<Consultation> {
    return this.runInZone(this.http.post<Consultation>(`${this.baseUrl}/consultations`, payload));
  }

  getPatientConsultations(patientId: number): Observable<Consultation[]> {
    return this.runInZone(this.http.get<Consultation[]>(`${this.baseUrl}/consultations/patient/${patientId}`));
  }

  getAllConsultations(): Observable<Consultation[]> {
    return this.runInZone(this.http.get<Consultation[]>(`${this.baseUrl}/consultations`));
  }
}
