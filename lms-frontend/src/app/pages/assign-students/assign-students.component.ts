import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-assign-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-2xl mt-12">
      <h2 class="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">Assign Students to Classroom</h2>

      <!-- Error Message -->
      <div *ngIf="errorMessage" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ errorMessage }}
      </div>

      <!-- Success Message -->
      <div *ngIf="successMessage" class="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
        {{ successMessage }}
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Loading...</p>
      </div>

      <!-- Assignment Form -->
      <form *ngIf="!loading" (ngSubmit)="assignStudent()" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Classroom</label>
          <input type="text" [value]="classroomName" disabled
                 class="w-full border border-gray-300 px-4 py-3 rounded-xl shadow-sm bg-gray-50">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
          <input type="text" [(ngModel)]="studentId" name="studentId" required
                 class="w-full border border-gray-300 px-4 py-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                 placeholder="Enter student ID">
        </div>

        <div class="flex justify-end space-x-4">
          <button type="button" (click)="goBack()"
                  class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-xl transition">
            Back
          </button>
          <button type="submit" [disabled]="!studentId"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition disabled:opacity-50">
            Assign Student
          </button>
        </div>
      </form>

      <!-- Current Students List -->
      <div *ngIf="!loading && currentStudents.length > 0" class="mt-8">
        <h3 class="text-xl font-semibold text-gray-900 mb-4">Current Students</h3>
        <div class="bg-gray-50 rounded-lg p-4">
          <div *ngFor="let student of currentStudents" class="flex justify-between items-center py-2 border-b last:border-b-0">
            <div>
              <p class="font-medium">{{ student.name }}</p>
              <p class="text-sm text-gray-600">{{ student.email }}</p>
            </div>
            <button (click)="removeStudent(student._id)"
                    class="text-red-600 hover:text-red-800">
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AssignStudentsComponent implements OnInit {
  classroomId: string = '';
  classroomName: string = '';
  studentId: string = '';
  currentStudents: any[] = [];
  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.classroomId = this.route.snapshot.params['id'];
    this.loadClassroomDetails();
  }

  loadClassroomDetails() {
    this.loading = true;
    this.http.get<any>(`http://localhost:5000/api/classrooms/${this.classroomId}`)
      .subscribe({
        next: (response) => {
          this.classroomName = response.classroom.name;
          this.currentStudents = response.classroom.students || [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading classroom:', err);
          this.errorMessage = 'Failed to load classroom details';
          this.loading = false;
        }
      });
  }

  assignStudent() {
    if (!this.studentId) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      classroomId: this.classroomId,
      studentIds: [this.studentId]
    };

    this.http.post('http://localhost:5000/api/classrooms/assign-students', payload)
      .subscribe({
        next: (response: any) => {
          console.log('Student assigned successfully:', response);
          this.successMessage = 'Student assigned successfully!';
          this.studentId = '';
          this.currentStudents = response.classroom.students;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error assigning student:', err);
          this.errorMessage = err.error?.message || 'Failed to assign student';
          this.loading = false;
        }
      });
  }

  removeStudent(studentId: string) {
    if (!confirm('Are you sure you want to remove this student?')) return;

    this.loading = true;
    const currentStudentIds = this.currentStudents.map(s => s._id);
    const updatedStudentIds = currentStudentIds.filter(id => id !== studentId);

    const payload = {
      classroomId: this.classroomId,
      studentIds: updatedStudentIds
    };

    this.http.post('http://localhost:5000/api/classrooms/assign-students', payload)
      .subscribe({
        next: (response: any) => {
          console.log('Student removed successfully:', response);
          this.successMessage = 'Student removed successfully!';
          this.currentStudents = response.classroom.students;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error removing student:', err);
          this.errorMessage = err.error?.message || 'Failed to remove student';
          this.loading = false;
        }
      });
  }

  goBack() {
    this.router.navigate(['/classroom-management']);
  }
} 