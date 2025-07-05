import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-tutor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tutor-dashboard.component.html',
  styleUrls: ['./tutor-dashboard.component.css']
})
export class TutorDashboardComponent implements OnInit {
  getTotalEnrollments(course: any): number {
    return course?.enrolledStudents?.length || 0;
  }
  
  courses: any[] = [];
  loading = true;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.http.get<any[]>('http://localhost:5000/api/dashboard/tutor').subscribe({
      next: res => {
        this.courses = res;
        this.loading = false;
      },
      
      error: err => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  goToCourse(courseId: string) {
    this.router.navigate([`/tutor-dashboard/course/${courseId}`]);
  }

  get publishedCoursesCount(): number {
    return this.courses?.filter(c => c.isPublished)?.length || 0;
  }
  
}