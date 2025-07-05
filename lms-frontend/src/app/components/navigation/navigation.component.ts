import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="nav">
      <div class="container nav-container">
        <!-- Logo -->
        <a routerLink="/" class="nav-brand">
          LMS Platform
        </a>

        <!-- Navigation Menu -->
        <div class="nav-menu">
          <!-- Admin Menu -->
          <ng-container *ngIf="userRole === 'admin'">
            <a routerLink="/admin/dashboard" class="nav-link">Dashboard</a>
            <a routerLink="/admin/users" class="nav-link">Users</a>
            <a routerLink="/admin/classrooms" class="nav-link">Classrooms</a>
            <a routerLink="/admin/reports" class="nav-link">Reports</a>
          </ng-container>

          <!-- Tutor Menu -->
          <ng-container *ngIf="userRole === 'tutor'">
            <a routerLink="/tutor/dashboard" class="nav-link">Dashboard</a>
            <a routerLink="/tutor/classrooms" class="nav-link">My Classrooms</a>
            <a routerLink="/tutor/assignments" class="nav-link">Assignments</a>
          </ng-container>

          <!-- Student Menu -->
          <ng-container *ngIf="userRole === 'student'">
            <a routerLink="/student/dashboard" class="nav-link">Dashboard</a>
            <a routerLink="/student/classrooms" class="nav-link">My Classes</a>
            <a routerLink="/student/assignments" class="nav-link">Assignments</a>
          </ng-container>

          <!-- Common Menu Items -->
          <ng-container *ngIf="isLoggedIn">
            <a routerLink="/profile" class="nav-link">Profile</a>
            <button (click)="logout()" class="btn btn-outline">Logout</button>
          </ng-container>

          <!-- Login/Register for non-authenticated users -->
          <ng-container *ngIf="!isLoggedIn">
            <a routerLink="/login" class="nav-link">Login</a>
            <a routerLink="/register" class="btn btn-primary">Register</a>
          </ng-container>
        </div>
      </div>
    </nav>
  `,
  styles: []
})
export class NavigationComponent implements OnInit {
  isLoggedIn = false;
  userRole = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkAuthStatus();
  }

  checkAuthStatus() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      this.isLoggedIn = true;
      const userData = JSON.parse(user);
      this.userRole = userData.role;
    } else {
      this.isLoggedIn = false;
      this.userRole = '';
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isLoggedIn = false;
    this.userRole = '';
    this.router.navigate(['/login']);
  }
} 