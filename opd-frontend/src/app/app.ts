import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-layout">
      <!-- Minimalist Light Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-brand">
          <span>+</span> MedCare
        </div>
        <nav style="display: flex; flex-direction: column; gap: 0.5rem;">
          <a routerLink="/patients" routerLinkActive="active" class="nav-item">Patients</a>
          <a routerLink="/appointments" routerLinkActive="active" class="nav-item">Appointments</a>
          <a routerLink="/consultation" routerLinkActive="active" class="nav-item">Consultations</a>
        </nav>
      </aside>

      <!-- Main Content Area with max-width wrapper -->
      <main class="main-content">
        <div class="content-wrapper">
          
          <div style="display: flex; justify-content: flex-end; align-items: center; width: 100%; margin-bottom: 2rem; gap: 1.5rem;">
            
            <div style="display: flex; align-items: center; gap: 1rem;">
              <button *ngIf="!isLoggedIn" class="btn" style="padding: 0.4rem 1rem; border: 1px solid var(--border-color); background: transparent; color: var(--text-primary); font-size: 0.875rem;" (click)="showLogin = true">
                Staff Login
              </button>
              
              <button *ngIf="isLoggedIn" class="btn" style="padding: 0.4rem 1rem; border: 1px solid var(--border-color); background: var(--text-primary); color: var(--bg-main); font-size: 0.875rem;" (click)="goToAdmin()">
                Admin Dashboard
              </button>
              <button *ngIf="isLoggedIn" class="btn" style="padding: 0.4rem 1rem; border: none; background: transparent; color: #EF4444; font-size: 0.875rem;" (click)="logout()">
                Logout
              </button>
            </div>

            <div style="display: flex; align-items: center; gap: 0.75rem; border-left: 1px solid var(--border-color); padding-left: 1.5rem;">
              <span style="font-size: 0.875rem; font-weight: 500; color: var(--text-secondary);">Theme</span>
              <label class="theme-switch" aria-label="Toggle Dark Mode">
                <input type="checkbox" (change)="toggleTheme()" [checked]="isDarkMode">
                <span class="slider">
                  <svg class="sun-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-2.25l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"></path></svg>
                  <svg class="moon-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                </span>
              </label>
            </div>
          </div>

          <router-outlet></router-outlet>
        </div>
      </main>

      <!-- Toast -->
      <div class="toast-container" *ngIf="message" [class.error]="toastType === 'error'">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; vertical-align: middle;">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        {{ message }}
      </div>
    </div>

    <!-- Login Modal -->
    <div *ngIf="showLogin" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(4px);">
      <div class="card" style="width: 100%; max-width: 400px; padding: 2.5rem; position: relative;">
        <button (click)="showLogin = false" style="position: absolute; top: 1rem; right: 1.5rem; background: transparent; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-secondary);">&times;</button>
        <h2 style="margin-top: 0; font-size: 1.5rem; margin-bottom: 2rem; color: var(--text-primary); text-align: center;">Staff Login</h2>
        <div class="form-group" style="text-align: left;">
          <label>Username</label>
          <input type="text" class="form-control" [(ngModel)]="username" placeholder="admin">
        </div>
        <div class="form-group" style="text-align: left;">
          <label>Password</label>
          <input type="password" class="form-control" [(ngModel)]="password" placeholder="password">
        </div>
        <button class="btn btn-primary" style="width: 100%; margin-top: 1rem;" (click)="login()">Login</button>
        <p style="color: #EF4444; margin-top: 1rem; font-size: 0.875rem; text-align: center;" *ngIf="loginError">{{ loginError }}</p>
      </div>
    </div>
  `
})
export class App implements OnInit {
  title = 'opd-frontend';
  isDarkMode = false;
  message = '';
  toastType = '';
  
  isLoggedIn = false;
  showLogin = false;
  username = '';
  password = '';
  loginError = '';

  constructor(private toastService: ToastService, private cdr: ChangeDetectorRef, private router: Router) {
    this.toastService.toast$.subscribe(t => {
      this.message = t.message;
      this.toastType = t.type;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.message = '';
        this.cdr.detectChanges();
      }, 3500);
    });
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  ngOnInit() {
    this.isLoggedIn = localStorage.getItem('auth') === 'true';
  }

  login() {
    if (this.username === 'admin' && this.password === 'password') {
      localStorage.setItem('auth', 'true');
      this.isLoggedIn = true;
      this.showLogin = false;
      this.loginError = '';
      this.goToAdmin();
    } else {
      this.loginError = 'Invalid credentials. Use admin / password.';
    }
  }

  logout() {
    localStorage.removeItem('auth');
    this.isLoggedIn = false;
    this.username = '';
    this.password = '';
    this.router.navigate(['/patients']);
  }

  goToAdmin() {
    this.router.navigate(['/admin']);
  }
}
