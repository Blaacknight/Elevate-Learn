import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  submissions: any[];
}

interface Classroom {
  _id: string;
  name: string;
  description: string;
  tutor: {
    name: string;
    email: string;
  };
  assignments: Assignment[];
}

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <p class="mt-2 text-gray-600">View your classrooms and assignments</p>
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
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="dashboard-card">
            <div class="dashboard-card-header">
              <h3 class="dashboard-card-title">Total Classrooms</h3>
              <span class="badge badge-info">{{ classrooms.length }}</span>
            </div>
            <p class="text-gray-600">Active classrooms you're enrolled in</p>
          </div>

          <div class="dashboard-card">
            <div class="dashboard-card-header">
              <h3 class="dashboard-card-title">Pending Assignments</h3>
              <span class="badge badge-warning">{{ getPendingAssignmentsCount() }}</span>
            </div>
            <p class="text-gray-600">Assignments due soon</p>
          </div>

          <div class="dashboard-card">
            <div class="dashboard-card-header">
              <h3 class="dashboard-card-title">Completed</h3>
              <span class="badge badge-success">{{ getCompletedAssignmentsCount() }}</span>
            </div>
            <p class="text-gray-600">Successfully submitted assignments</p>
          </div>
        </div>

        <!-- Classrooms Section -->
        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-6">My Classrooms</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let classroom of classrooms" class="card animate-fade-in">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-xl font-semibold text-gray-900">{{ classroom.name }}</h3>
                  <p class="text-gray-600 mt-1">{{ classroom.description }}</p>
                </div>
                <button (click)="viewClassroom(classroom._id)" class="btn btn-primary">
                  View Details
                </button>
              </div>

              <!-- Tutor Info -->
              <div class="mb-4 p-3 bg-gray-50 rounded-lg">
                <p class="text-sm font-medium text-gray-900">Tutor</p>
                <p class="text-gray-600">{{ classroom.tutor.name }}</p>
                <p class="text-sm text-gray-500">{{ classroom.tutor.email }}</p>
              </div>

              <!-- Assignments Preview -->
              <div>
                <h4 class="text-lg font-medium text-gray-900 mb-3">Recent Assignments</h4>
                <div *ngIf="classroom.assignments.length === 0" class="text-gray-500 italic">
                  No assignments yet
                </div>
                <div *ngIf="classroom.assignments.length > 0" class="space-y-3">
                  <div *ngFor="let assignment of classroom.assignments.slice(0, 2)" 
                       class="p-3 bg-white border border-gray-200 rounded-lg">
                    <div class="flex justify-between items-start">
                      <div>
                        <h5 class="font-medium text-gray-900">{{ assignment.title }}</h5>
                        <p class="text-sm text-gray-600 mt-1">{{ assignment.description }}</p>
                      </div>
                      <span class="badge" [ngClass]="{
                        'badge-success': hasSubmitted(assignment),
                        'badge-warning': !hasSubmitted(assignment)
                      }">
                        {{ hasSubmitted(assignment) ? 'Submitted' : 'Pending' }}
                      </span>
                    </div>
                    <div class="mt-2 text-sm text-gray-500">
                      Due: {{ assignment.dueDate | date:'mediumDate' }}
                    </div>
                  </div>
                  <button *ngIf="classroom.assignments.length > 2" 
                          (click)="viewClassroom(classroom._id)"
                          class="text-primary hover:text-primary-dark text-sm font-medium">
                    View all {{ classroom.assignments.length }} assignments →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Upcoming Assignments Section -->
        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Upcoming Assignments</h2>
          <div class="card">
            <div class="overflow-x-auto">
              <table class="table">
                <thead>
                  <tr>
                    <th>Assignment</th>
                    <th>Classroom</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let assignment of getUpcomingAssignments()">
                    <td>
                      <div>
                        <p class="font-medium text-gray-900">{{ assignment.title }}</p>
                        <p class="text-sm text-gray-600">{{ assignment.description }}</p>
                      </div>
                    </td>
                    <td>{{ getClassroomName(assignment) }}</td>
                    <td>{{ assignment.dueDate | date:'mediumDate' }}</td>
                    <td>
                      <span class="badge" [ngClass]="{
                        'badge-success': hasSubmitted(assignment),
                        'badge-warning': !hasSubmitted(assignment)
                      }">
                        {{ hasSubmitted(assignment) ? 'Submitted' : 'Pending' }}
                      </span>
                    </td>
                    <td>
                      <button (click)="viewAssignment(assignment._id)" 
                              class="btn btn-outline">
                        View Details
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
export class StudentDashboardComponent implements OnInit {
  classrooms: Classroom[] = [];
  loading = true;
  error = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.getClassrooms();
  }

  async getClassrooms() {
    try {
      this.loading = true;
      this.error = '';

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5000/api/classrooms/student-classrooms', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to view your dashboard');
        }
        if (response.status === 403) {
          throw new Error('You do not have permission to view this dashboard');
        }
        throw new Error('Failed to fetch classrooms');
      }

      const data = await response.json();
      if (data.classrooms) {
        this.classrooms = data.classrooms;
      } else {
        this.classrooms = [];
      }
    } catch (err: any) {
      console.error('Error fetching classrooms:', err);
      this.error = err.message || 'Failed to fetch classrooms. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  getPendingAssignmentsCount(): number {
    return this.classrooms.reduce((count, classroom) => {
      return count + classroom.assignments.filter(assignment => !this.hasSubmitted(assignment)).length;
    }, 0);
  }

  getCompletedAssignmentsCount(): number {
    return this.classrooms.reduce((count, classroom) => {
      return count + classroom.assignments.filter(assignment => this.hasSubmitted(assignment)).length;
    }, 0);
  }

  hasSubmitted(assignment: Assignment): boolean {
    const userId = localStorage.getItem('userId');
    return assignment.submissions.some(submission => submission.student === userId);
  }

  getUpcomingAssignments(): Assignment[] {
    const allAssignments = this.classrooms.reduce((assignments, classroom) => {
      return [...assignments, ...classroom.assignments.map(assignment => ({
        ...assignment,
        classroomId: classroom._id,
        classroomName: classroom.name
      }))];
    }, [] as any[]);

    return allAssignments
      .filter(assignment => !this.hasSubmitted(assignment))
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  }

  getClassroomName(assignment: any): string {
    const classroom = this.classrooms.find(c => c._id === assignment.classroomId);
    return classroom ? classroom.name : 'Unknown Classroom';
  }

  viewClassroom(classroomId: string) {
    this.router.navigate(['/classroom', classroomId]);
  }

  viewAssignment(assignmentId: string) {
    this.router.navigate(['/assignment', assignmentId]);
  }
} 