import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Classroom {
  _id: string;
  name: string;
  description: string;
  tutor: {
    name: string;
    email: string;
  };
  students: {
    name: string;
    email: string;
  }[];
  assignments: any[];
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p class="mt-2 text-gray-600">Manage your learning management system</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex justify-center items-center py-12">
        <div class="loading"></div>
        <span class="ml-3 text-gray-600">Loading dashboard...</span>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="alert alert-error mb-6">
        {{ error }}
      </div>

      <!-- Dashboard Content -->
      <div *ngIf="!loading && !error" class="space-y-8">
        <!-- Overview Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="dashboard-card">
            <div class="dashboard-card-header">
              <h3 class="dashboard-card-title">Total Users</h3>
              <span class="badge badge-info">{{ users.length }}</span>
            </div>
            <p class="text-gray-600">Registered users in the system</p>
          </div>

          <div class="dashboard-card">
            <div class="dashboard-card-header">
              <h3 class="dashboard-card-title">Active Classrooms</h3>
              <span class="badge badge-success">{{ classrooms.length }}</span>
            </div>
            <p class="text-gray-600">Currently active classrooms</p>
          </div>

          <div class="dashboard-card">
            <div class="dashboard-card-header">
              <h3 class="dashboard-card-title">Tutors</h3>
              <span class="badge badge-warning">{{ getTutorsCount() }}</span>
            </div>
            <p class="text-gray-600">Active tutors in the system</p>
          </div>

          <div class="dashboard-card">
            <div class="dashboard-card-header">
              <h3 class="dashboard-card-title">Students</h3>
              <span class="badge badge-primary">{{ getStudentsCount() }}</span>
            </div>
            <p class="text-gray-600">Enrolled students</p>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button (click)="createClassroom()" class="btn btn-primary">
              Create New Classroom
            </button>
            <button (click)="manageUsers()" class="btn btn-secondary">
              Manage Users
            </button>
            <button (click)="viewReports()" class="btn btn-outline">
              View Reports
            </button>
          </div>
        </div>

        <!-- Recent Classrooms -->
        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Recent Classrooms</h2>
          <div class="card">
            <div class="overflow-x-auto">
              <table class="table">
                <thead>
                  <tr>
                    <th>Classroom</th>
                    <th>Tutor</th>
                    <th>Students</th>
                    <th>Assignments</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let classroom of classrooms.slice(0, 5)">
                    <td>
                      <div>
                        <p class="font-medium text-gray-900">{{ classroom.name }}</p>
                        <p class="text-sm text-gray-600">{{ classroom.description }}</p>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p class="text-gray-900">{{ classroom.tutor.name }}</p>
                        <p class="text-sm text-gray-600">{{ classroom.tutor.email }}</p>
                      </div>
                    </td>
                    <td>
                      <span class="badge badge-info">{{ classroom.students.length }} Students</span>
                    </td>
                    <td>
                      <span class="badge badge-warning">{{ classroom.assignments.length }} Assignments</span>
                    </td>
                    <td>
                      <button (click)="viewClassroom(classroom._id)" class="btn btn-outline">
                        View Details
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- User Management Preview -->
        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Recent Users</h2>
          <div class="card">
            <div class="overflow-x-auto">
              <table class="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let user of users.slice(0, 5)">
                    <td>
                      <p class="font-medium text-gray-900">{{ user.name }}</p>
                    </td>
                    <td>
                      <p class="text-gray-600">{{ user.email }}</p>
                    </td>
                    <td>
                      <span class="badge" [ngClass]="{
                        'badge-primary': user.role === 'student',
                        'badge-warning': user.role === 'tutor',
                        'badge-info': user.role === 'admin'
                      }">
                        {{ user.role | titlecase }}
                      </span>
                    </td>
                    <td>
                      <button (click)="editUser(user._id)" class="btn btn-outline">
                        Edit User
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AdminDashboardComponent implements OnInit {
  users: User[] = [];
  classrooms: Classroom[] = [];
  loading = true;
  error = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.getDashboardData();
  }

  async getDashboardData() {
    try {
      this.loading = true;
      this.error = '';

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch users
      const usersResponse = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!usersResponse.ok) {
        throw new Error('Failed to fetch users');
      }

      const usersData = await usersResponse.json();
      this.users = usersData.users || [];

      // Fetch classrooms
      const classroomsResponse = await fetch('http://localhost:5000/api/classrooms/get-all-classrooms', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!classroomsResponse.ok) {
        throw new Error('Failed to fetch classrooms');
      }

      const classroomsData = await classroomsResponse.json();
      this.classrooms = classroomsData.classrooms || [];
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      this.error = err.message || 'Failed to fetch dashboard data. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  getTutorsCount(): number {
    return this.users.filter(user => user.role === 'tutor').length;
  }

  getStudentsCount(): number {
    return this.users.filter(user => user.role === 'student').length;
  }

  createClassroom() {
    this.router.navigate(['/admin/create-classroom']);
  }

  manageUsers() {
    this.router.navigate(['/admin/users']);
  }

  viewReports() {
    this.router.navigate(['/admin/reports']);
  }

  viewClassroom(classroomId: string) {
    this.router.navigate(['/admin/classroom', classroomId]);
  }

  editUser(userId: string) {
    this.router.navigate(['/admin/user', userId]);
  }
} 