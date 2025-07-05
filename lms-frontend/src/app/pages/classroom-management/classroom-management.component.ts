import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common'; // ⬅️ Added Location
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';


interface Classroom {
  _id: string;
  name: string;
  description: string;
  tutor: any;
  students: any[];
  assignments: any[];
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-classroom-management',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './classroom-management.component.html',
  styleUrls: ['./classroom-management.component.css']
})
export class ClassroomManagementComponent implements OnInit {
  classroom = { name: '', description: '', tutorId: '' };
  classrooms: Classroom[] = [];
  students: User[] = [];
  selectedClassroom: Classroom | null = null;
  selectedStudentIds: string[] = [];
  showAssignStudentsModal = false;
  errorMessage = '';
  successMessage = '';
  isAdmin = false;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private router: Router,
    private location: Location // ⬅️ Injected Location
  ) {}
  

  ngOnInit(): void {
    this.isAdmin = this.auth.getUser()?.role === 'admin';
    this.getClassrooms();
    if (this.isAdmin) {
      this.getStudents();
    }
  }

  getClassrooms(): void {
    this.http.get<any>('http://localhost:5000/api/classrooms/get-all-classrooms')
      .subscribe({
        next: (data) => {
          console.log('Fetched classrooms:', data);
          this.classrooms = data.classrooms;
        },
        error: (err) => {
          console.error('Error fetching classrooms:', err);
          this.errorMessage = 'Failed to fetch classrooms. Please try again.';
        }
      });
  }

  getStudents(): void {
    this.http.get<any>('http://localhost:5000/api/users/students')
      .subscribe({
        next: (data) => {
          console.log('Fetched students:', data);
          this.students = data.students;
        },
        error: (err) => {
          console.error('Error fetching students:', err);
          this.errorMessage = 'Failed to fetch students. Please try again.';
        }
      });
  }

  createClassroom(): void {
    if (!this.isAdmin) {
      this.errorMessage = 'Only admins can create classrooms.';
      return;
    }

    console.log('Creating classroom with data:', this.classroom);
    this.http.post('http://localhost:5000/api/classrooms/create-classroom', this.classroom)
      .subscribe({
        next: (res) => {
          console.log('Classroom created:', res);
          this.getClassrooms();
          this.successMessage = 'Classroom created successfully!';
          this.classroom = { name: '', description: '', tutorId: '' };
        },
        error: (err) => {
          console.error('Error creating classroom:', err);
          this.errorMessage = err.error?.message || 'Failed to create classroom. Please try again.';
        }
      });
  }

  openAssignStudentsModal(classroom: Classroom): void {
    if (!this.isAdmin) {
      this.errorMessage = 'Only admins can assign students.';
      return;
    }
    this.router.navigate(['/assign-students', classroom._id]);
  }

  closeAssignStudentsModal(): void {
    this.showAssignStudentsModal = false;
    this.selectedClassroom = null;
    this.selectedStudentIds = [];
  }

  assignStudents(): void {
    if (!this.isAdmin || !this.selectedClassroom) return;

    const payload = {
      classroomId: this.selectedClassroom._id,
      studentIds: this.selectedStudentIds
    };

    console.log('Assigning students with payload:', payload);

    this.http.post('http://localhost:5000/api/classrooms/assign-students', payload)
      .subscribe({
        next: (response: any) => {
          console.log('Students assigned successfully:', response);
          this.successMessage = 'Students assigned successfully!';
          
          // Update the classroom in the list with the new data
          const updatedClassroom = response.classroom;
          const index = this.classrooms.findIndex(c => c._id === updatedClassroom._id);
          if (index !== -1) {
            this.classrooms[index] = updatedClassroom;
          }
          
          this.closeAssignStudentsModal();
        },
        error: (err) => {
          console.error('Error assigning students:', err);
          this.errorMessage = err.error?.message || 'Failed to assign students. Please try again.';
        }
      });
  }

  isStudentSelected(studentId: string): boolean {
    return this.selectedStudentIds.includes(studentId);
  }

  toggleStudentSelection(studentId: string): void {
    const index = this.selectedStudentIds.indexOf(studentId);
    if (index === -1) {
      this.selectedStudentIds.push(studentId);
    } else {
      this.selectedStudentIds.splice(index, 1);
    }
  }
  goBack(): void {
    this.location.back();
  }
  
  
}
