import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ProgressBarComponent } from "../../progress/progress-bar/progress-bar.component";

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [CommonModule, RouterModule, ProgressBarComponent],
  templateUrl: './my-courses.component.html',
  styleUrls: ['./my-courses.component.css']
})
export class MyCoursesComponent implements OnInit {
  myCourses: any[] = [];
  courseProgress: { [courseId: string]: number } = {};
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('http://localhost:5000/api/courses/my-courses').subscribe({
      next: data => {
        this.myCourses = data;
        this.loading = false;
        this.loadAllProgress();
      },
      error: err => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  loadAllProgress() {
    this.myCourses.forEach(course => {
      this.http.get<any>(`http://localhost:5000/api/progress/${course._id}`).subscribe({
        next: res => {
          this.courseProgress[course._id] = res.percent || 0;
        },
        error: err => console.error(`Error loading progress for ${course._id}`, err)
      });
    });
  }

  updateCourseProgress(courseId: string, newPercent: number) {
    this.courseProgress[courseId] = newPercent;
  }
}
