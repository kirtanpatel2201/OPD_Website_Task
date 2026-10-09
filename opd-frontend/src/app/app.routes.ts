import { Routes } from '@angular/router';
import { PatientListComponent } from './components/patient-list/patient-list';
import { AppointmentDashboardComponent } from './components/appointment-dashboard/appointment-dashboard';
import { ConsultationFormComponent } from './components/consultation-form/consultation-form';
import { AdminDashboardComponent } from './components/admin/admin';

export const routes: Routes = [
  { path: '', redirectTo: 'patients', pathMatch: 'full' },
  { path: 'patients', component: PatientListComponent },
  { path: 'appointments', component: AppointmentDashboardComponent },
  { path: 'consultation', component: ConsultationFormComponent },
  { path: 'admin', component: AdminDashboardComponent }
];
