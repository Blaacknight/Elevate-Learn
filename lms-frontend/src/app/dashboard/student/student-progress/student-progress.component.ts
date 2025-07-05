import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgressToggleComponent } from '../../../progress/progress-toggle.component';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-student-progress',
  standalone: true,
  imports: [CommonModule, FormsModule, ProgressToggleComponent],
  templateUrl: './student-progress.component.html',
  styleUrls: ['./student-progress.component.css']
})
export class StudentProgressComponent implements OnInit {
  courses: any[] = [];
  selectedCourseId = '';
  structure: any[] = [];
  loading = false;
  percentComplete = 0;

  constructor(private http: HttpClient, private auth: AuthService) {}
  completedMaterialIds: string[] = [];
  ngOnInit(): void {
    this.http.get<any[]>('http://localhost:5000/api/courses/my-courses')
      .subscribe({
        next: res => this.courses = res,
        error: err => console.error('Error loading courses:', err)
      });
  }



loadProgress() {
  if (!this.selectedCourseId) return;

  this.loading = true;

  // Fetch structure first
  this.http.get<any[]>(`http://localhost:5000/api/courses/${this.selectedCourseId}/structure`)
    .subscribe({
      next: structureRes => {
        this.structure = structureRes;

        // Then fetch progress
        this.http.get<any>(`http://localhost:5000/api/progress/${this.selectedCourseId}`)
          .subscribe({
            next: progressRes => {
              this.completedMaterialIds = progressRes.completedMaterials.map((m: any) => m._id);
              this.percentComplete = progressRes.percent;
              this.loading = false;
            },
            error: err => {
              console.error('Error loading progress:', err);
              this.loading = false;
            }
          });
      },
      error: err => {
        console.error('Error loading structure:', err);
        this.loading = false;
      }
    });
}

isMaterialCompleted(id: string): boolean {
  return this.completedMaterialIds.includes(id);
}

}
