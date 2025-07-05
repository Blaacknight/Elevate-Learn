import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-course',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-course.component.html'
})
export class EditCourseComponent implements OnInit {
  courseId = '';
  courseForm!: FormGroup; 

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.params['id'];

    this.courseForm = this.fb.group({
      title: [''],
      description: [''],
      category: [''],
      isPublished: [false]
    });

    this.loadCourse();
  }

  loadCourse() {
    this.http.get<any>(`http://localhost:5000/api/courses/${this.courseId}`).subscribe(course => {
      this.courseForm.patchValue({
        title: course.title,
        description: course.description,
        category: course.category,
        isPublished: course.isPublished
      });
    });
  }

  onSubmit() {
    this.http.put(`http://localhost:5000/api/courses/${this.courseId}`, this.courseForm.value).subscribe(() => {
      this.router.navigate(['/tutor-dashboard']);
    });
  }


  goBackToManage() {
    this.router.navigate([`/tutor-dashboard/course/${this.courseId}`]);
  }
}
