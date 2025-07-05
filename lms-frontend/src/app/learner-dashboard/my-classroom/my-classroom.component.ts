import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-my-classroom',
  standalone: true,
  imports: [],
  templateUrl: './my-classroom.component.html',
  styleUrls: ['./my-classroom.component.css']
})
export class MyClassroomComponent implements OnInit {
  assignments: any[] = [];
  selectedFile: File | null = null;
  uploadForm: FormGroup;

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.uploadForm = this.fb.group({
      pdf: [null]
    });
  }

  ngOnInit(): void {
    this.fetchAssignments();
  }

  fetchAssignments() {
    this.http.get<any>('http://localhost:3000/api/assignments/my')
      .subscribe({
        next: (res) => this.assignments = res.assignments,
        error: (err) => console.error(err)
      });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  submitAssignment(assignmentId: string) {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('pdf', this.selectedFile);

    this.http.post(`http://localhost:3000/api/assignments/submit/${assignmentId}`, formData)
      .subscribe({
        next: () => {
          alert('Assignment submitted successfully');
          this.selectedFile = null;
          this.fetchAssignments(); // Refresh list
        },
        error: (err) => alert(err.error.message || 'Submission failed')
      });
  }
}
