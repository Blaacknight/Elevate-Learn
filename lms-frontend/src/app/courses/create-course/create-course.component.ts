import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-course',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-course.component.html',
  styleUrls: ['./create-course.component.css']
})
export class CreateCourseComponent {
  title = '';
  description = '';
  category = '';
  toc = '';
  thumbnail: File | null = null;
  isPublished = false;

  constructor(private http: HttpClient, private router: Router) {}

  onFileChange(event: any) {
    this.thumbnail = event.target.files[0];
  }

  createCourse() {
    const formData = new FormData();
    formData.append('title', this.title);
    formData.append('description', this.description);
    formData.append('category', this.category);
    formData.append('toc', this.toc);
    formData.append('isPublished', this.isPublished ? 'true' : 'false');
    if (this.thumbnail) {
      formData.append('thumbnail', this.thumbnail);
    }

    this.http.post('http://localhost:5000/api/courses', formData).subscribe({
      next: () => this.router.navigate(['/tutor-dashboard']),
      error: err => alert(err.error.message || 'Failed to create course')
    });
  }

  goBackToManage() {
    this.router.navigate([`/tutor-dashboard`]);
  }
}
