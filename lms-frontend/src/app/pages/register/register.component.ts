import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 animate-fade-in">
        <!-- Header -->
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900">Create an Account</h2>
          <p class="mt-2 text-gray-600">Join our learning community</p>
        </div>

        <!-- Error Message -->
        <div *ngIf="error" class="alert alert-error">
          {{ error }}
        </div>

        <!-- Register Form -->
        <form (ngSubmit)="onSubmit()" class="card space-y-6">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input
              type="text"
              [(ngModel)]="name"
              name="name"
              required
              class="form-input"
              placeholder="Enter your full name"
            >
          </div>

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
              placeholder="Create a password"
            >
            <p class="mt-1 text-sm text-gray-500">
              Must be at least 8 characters long
            </p>
          </div>

          <div class="form-group">
            <label class="form-label">Confirm Password</label>
            <input
              type="password"
              [(ngModel)]="confirmPassword"
              name="confirmPassword"
              required
              class="form-input"
              placeholder="Confirm your password"
            >
          </div>

          <div class="form-group">
            <label class="form-label">Role</label>
            <select
              [(ngModel)]="role"
              name="role"
              required
              class="form-input"
            >
              <option value="">Select your role</option>
              <option value="student">Student</option>
              <option value="tutor">Tutor</option>
            </select>
          </div>

          <div class="flex items-center">
            <input
              type="checkbox"
              [(ngModel)]="agreeToTerms"
              name="agreeToTerms"
              required
              class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            >
            <label class="ml-2 block text-sm text-gray-900">
              I agree to the
              <a href="#" class="text-primary hover:text-primary-dark">Terms of Service</a>
              and
              <a href="#" class="text-primary hover:text-primary-dark">Privacy Policy</a>
            </label>
          </div>

          <button
            type="submit"
            [disabled]="loading || !agreeToTerms"
            class="btn btn-primary w-full"
          >
            <span *ngIf="!loading">Create Account</span>
            <span *ngIf="loading" class="flex items-center justify-center">
              <div class="loading"></div>
              <span class="ml-2">Creating account...</span>
            </span>
          </button>
        </form>

        <!-- Login Link -->
        <div class="text-center">
          <p class="text-sm text-gray-600">
            Already have an account?
            <a routerLink="/login" class="text-primary hover:text-primary-dark font-medium">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  role = '';
  agreeToTerms = false;
  loading = false;
  error = '';

  constructor(private router: Router) {}

  async onSubmit() {
    try {
      this.loading = true;
      this.error = '';

      // Validate passwords match
      if (this.password !== this.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Validate password length
      if (this.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: this.name,
          email: this.email,
          password: this.password,
          role: this.role
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on user role
      switch (data.user.role) {
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
      console.error('Registration error:', err);
      this.error = err.message || 'An error occurred during registration. Please try again.';
    } finally {
      this.loading = false;
    }
  }
} 