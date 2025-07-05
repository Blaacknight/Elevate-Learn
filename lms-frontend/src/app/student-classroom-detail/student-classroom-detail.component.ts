import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router'; // ✅ Import Router
// ✅ Import Location for "go back"

@Component({
  selector: 'app-student-classroom-detail',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './student-classroom-detail.component.html',
  styleUrls: ['./student-classroom-detail.component.css']
})
export class StudentClassroomDetailComponent implements OnInit {
  classroom: any;
  isLoading = true;
  error = '';
  selectedFiles: { [assignmentId: string]: File | null } = {};

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private location: Location // ✅ Only one constructor, all dependencies injected here
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.http.get(`http://localhost:5000/api/classrooms/${id}`).subscribe({
      next: (data: any) => {
        this.classroom = data.classroom;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load classroom.';
        this.isLoading = false;
      }
    });
  }

  onFileChange(event: Event, assignmentId: string): void {
    const file = (event.target as HTMLInputElement).files?.[0] || null;
    if (file && file.type !== 'application/pdf') {
      alert('Only PDF files are allowed.');
      return;
    }
    this.selectedFiles[assignmentId] = file;
  }

  isOverdue(dueDate: string): boolean {
    const now = new Date();
    return new Date(dueDate) < now;
  }

  goBack(): void {
    this.location.back(); // ✅ Proper back functionality
  }

  submitAssignment(assignmentId: string): void {
    const file = this.selectedFiles[assignmentId];
    if (!file) {
      alert('Please select a PDF to upload.');
      return;
    }
  
    const formData = new FormData();
    formData.append('pdf', file);
  
    const endpoint = `http://localhost:5000/api/classrooms/submit-assignment/${assignmentId}`;
  
    this.http.post(endpoint, formData).subscribe({
      next: () => alert('✅ Assignment submitted successfully.'),
      error: (err) => {
        console.error(err);
        alert('❌ Failed to submit assignment.');
      }
    });
  }
  
}
