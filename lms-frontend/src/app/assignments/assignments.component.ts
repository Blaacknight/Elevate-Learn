import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';

interface Submission {
  _id: string;
  student: string;
  answerPDF: string;
  submittedAt: string;
}

interface Assignment {
  _id: string;
  course: string;
  title: string;
  description: string;
  questionsPDF: string;
  dueDate: string;
  submissions?: Submission[];
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-assignments',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './assignments.component.html',
})
export class AssignmentsComponent implements OnInit {
  classroomId!: string;
  assignments: Assignment[] = [];
  isTutor = false;
  newAssignment = {
    title: '',
    description: '',
    dueDate: ''
  };
  selectedFile: File | null = null;

  constructor(
    private route: ActivatedRoute, 
    private http: HttpClient,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.classroomId = this.route.snapshot.paramMap.get('classroomId')!;
    this.isTutor = this.auth.getUserRole() === 'tutor';
    this.getAssignments();
  }

  getAssignments() {
    const endpoint = this.isTutor 
      ? 'http://localhost:5000/api/classrooms/tutor-assignments'
      : 'http://localhost:5000/api/classrooms/my-assignments';

    this.http.get<{ assignments: Assignment[] }>(endpoint)
      .subscribe({
        next: (res) => {
          // Initialize submissions as empty array if undefined
          this.assignments = res.assignments.map(assignment => ({
            ...assignment,
            submissions: assignment.submissions || []
          }));
          // Sort assignments by due date
          this.assignments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        },
        error: (err) => {
          console.error('Error fetching assignments:', err);
          if (err.status === 403) {
            alert('You are not authorized to view assignments. Please make sure you are logged in with the correct role.');
          } else {
            alert('Failed to fetch assignments. Please try again.');
          }
        }
      });
  }

  createAssignment() {
    if (!this.classroomId) {
      alert('Classroom ID is required');
      return;
    }

    const body = {
      classroomId: this.classroomId,
      ...this.newAssignment
    };

    this.http.post<{ assignment: Assignment }>('http://localhost:5000/api/classrooms/add-assignment', body)
      .subscribe({
        next: (res) => {
          alert('Assignment created successfully!');
          this.assignments.push(res.assignment);
          this.newAssignment = { title: '', description: '', dueDate: '' };
        },
        error: (err) => {
          console.error('Error creating assignment:', err);
          if (err.status === 403) {
            alert('You are not authorized to create assignments for this classroom. Please make sure you are the tutor of this classroom.');
          } else {
            alert('Failed to create assignment. Please try again.');
          }
        }
      });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedFile = file;
    } else {
      alert('Please select a PDF file');
      event.target.value = null;
    }
  }

  submitAssignment(assignmentId: string) {
    if (!this.selectedFile) {
      alert("Please select a PDF to upload.");
      return;
    }

    const formData = new FormData();
    formData.append('pdf', this.selectedFile);

    this.http.post(`http://localhost:5000/api/classrooms/submit-assignment/${assignmentId}`, formData)
      .subscribe({
        next: () => {
          alert('Assignment submitted successfully!');
          this.selectedFile = null;
          this.getAssignments(); // Refresh the assignments list
        },
        error: (err) => {
          console.error('Error submitting assignment:', err);
          alert('Failed to submit assignment. Please try again.');
        }
      });
  }
}
