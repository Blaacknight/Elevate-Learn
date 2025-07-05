import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-tutor-progress',
  standalone: true,
  templateUrl: './tutor-progress.component.html',
  styleUrls: ['./tutor-progress.component.css'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class TutorProgressComponent implements OnInit {
  courses: any[] = [];
  selectedCourseId = '';
  students: any[] = [];
  summary: any = null;
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchTutorCourses();
  }

  fetchTutorCourses() {
    this.http.get<any[]>('http://localhost:5000/api/courses/mine').subscribe({
      next: res => {
        console.log('Fetched courses:', res);
        this.courses = res;
      },
      error: err => {
        console.error('Error loading courses:', err);
      }
    });
  }

  selectedStudent: any = null;
studentDetails: any = null;

viewStudentProgress(student: any) {
  const courseId = this.selectedCourseId;
  const studentId = student.student.id; // ✅ NOT student.id

  this.http.get<any>(`http://localhost:5000/api/progress/${courseId}/student/${studentId}`)
    .subscribe({
      next: res => {
        console.log('Student details:', res);
        alert(`Student ${student.student.name} has completed ${res.percent}% of the course.`);
      },
      error: err => {
        console.error('Failed to load student detail progress', err);
      }
    });
}


  

  // onCourseSelect() {
  //   if (!this.selectedCourseId) return;

  //   this.loading = true;

  //   // Fetch students progress
  //   this.http.get<any>(`http://localhost:5000/api/progress/course/${this.selectedCourseId}`)
  // .subscribe({
  //   next: res => {
  //     this.students = res;
  //   },
  //   error: err => {
  //     console.error('Failed to fetch student progress', err);
  //     this.students = [];
  //   }
  //     });

  //   // Fetch course progress summary
  //   this.http.get<any>(`http://localhost:5000/api/progress/${this.selectedCourseId}/progress-summary`)
  //     .subscribe({
  //       next: res => {
  //         this.summary = res;
  //         this.loading = false;
  //       },
  //       error: err => {
  //         console.error('Failed to fetch summary', err);
  //         this.summary = null;
  //         this.loading = false;
  //       }
  //     });
  // }

  onCourseSelect() {
    if (!this.selectedCourseId) return;
  
    this.loading = true;
  
    // Fetch student progress list
    this.http.get<any[]>(`http://localhost:5000/api/progress/course/${this.selectedCourseId}`)
      .subscribe({
        next: res => {
          this.students = res; // ✅ it's an array, not an object with `students`
        },
        error: err => {
          console.error('Failed to fetch student progress', err);
          this.students = [];
        }
      });
  
    // Fetch summary
    this.http.get<any>(`http://localhost:5000/api/progress/${this.selectedCourseId}/progress-summary`)
      .subscribe({
        next: res => {
          this.summary = res;
          this.loading = false;
        },
        error: err => {
          console.error('Failed to fetch summary', err);
          this.summary = null;
          this.loading = false;
        }
      });
  }
  
}
