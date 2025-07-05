import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 animate-fade-in">
        <!-- Header -->
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p class="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <!-- Error Message -->
        <div *ngIf="error" class="alert alert-error">
          {{ error }}
        </div>

        <!-- Login Form -->
        <form (ngSubmit)="onSubmit()" class="card space-y-6">
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              required
              class="form-input"
              placeholder="Enter your email"
            >
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              required
              class="form-input"
              placeholder="Enter your password"
            >
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                type="checkbox"
                [(ngModel)]="rememberMe"
                name="rememberMe"
                class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              >
              <label class="ml-2 block text-sm text-gray-900">Remember me</label>
            </div>

            <a routerLink="/forgot-password" class="text-sm text-primary hover:text-primary-dark">
              Forgot your password?
            </a>
          </div>

          <button
            type="submit"
            [disabled]="loading"
            class="btn btn-primary w-full"
          >
            <span *ngIf="!loading">Sign in</span>
            <span *ngIf="loading" class="flex items-center justify-center">
              <div class="loading"></div>
              <span class="ml-2">Signing in...</span>
            </span>
          </button>
        </form>

        <!-- Register Link -->
        <div class="text-center">
          <p class="text-sm text-gray-600">
            Don't have an account?
            <a routerLink="/register" class="text-primary hover:text-primary-dark font-medium">
              Register now
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  email = '';
  password = '';
  rememberMe = false;
  loading = false;
  error = '';

  constructor(private router: Router) {}

  async onSubmit() {
    try {
      this.loading = true;
      this.error = '';

      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: this.email,
          password: this.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on user role
      switch (data.user.role) {
        case 'admin':
          this.router.navigate(['/admin/dashboard']);
          break;
        case 'tutor':
          this.router.navigate(['/tutor/dashboard']);
          break;
        case 'student':
          this.router.navigate(['/student/dashboard']);
          break;
        default:
          this.router.navigate(['/']);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      this.error = err.message || 'An error occurred during login. Please try again.';
    } finally {
      this.loading = false;
    }
  }
} 