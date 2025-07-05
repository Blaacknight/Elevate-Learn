import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-classroom-details',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './classroom-details.component.html'
})
export class ClassroomDetailsComponent implements OnInit {
  classroom: any;
  classroomId: string = '';
  newAssignment = {
    title: '',
    description: '',
    dueDate: ''
  };

  constructor(
    private http: HttpClient, 
    private route: ActivatedRoute,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    // Get classroom ID from route params
    this.classroomId = this.route.snapshot.paramMap.get('id') || '';
    if (this.classroomId) {
      this.fetchClassroom();
    }
  }

  // Fetch classroom details using the classroomId
  fetchClassroom() {
    if (!this.classroomId) {
      console.error('No classroom ID provided');
      return;
    }

    this.http.get(`http://localhost:5000/api/classrooms/${this.classroomId}`)
      .subscribe({
        next: (res: any) => {
          this.classroom = res.classroom;
          // Verify if current user is the tutor
          const currentUserId = this.auth.getUser()?._id;
          if (this.classroom.tutor._id !== currentUserId) {
            console.warn('Current user is not the tutor of this classroom');
          }
        },
        error: (err) => {
          console.error('Error fetching classroom data:', err);
          alert('Failed to fetch classroom data. Please try again.');
        }
      });
  }

  // Create a new assignment
  createAssignment() {
    if (!this.classroomId) {
      alert('Classroom ID is required');
      return;
    }

    const payload = {
      classroomId: this.classroomId,
      title: this.newAssignment.title,
      description: this.newAssignment.description,
      dueDate: this.newAssignment.dueDate
    };

    // Post request to backend to create assignment
    this.http.post('http://localhost:5000/api/classrooms/add-assignment', payload)
      .subscribe({
        next: (res: any) => {
          alert('Assignment created successfully!');
          if (this.classroom && this.classroom.assignments) {
            this.classroom.assignments.push(res.assignment);
          }
          this.newAssignment = { title: '', description: '', dueDate: '' };  // Reset form
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
}