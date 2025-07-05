import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-student-classrooms',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  templateUrl: './student-classrooms.component.html',
  styleUrls: ['./student-classrooms.component.css']
})
export class StudentClassroomsComponent implements OnInit {
  classrooms: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    console.log(this.fetchClassrooms());
    this.fetchClassrooms();
  }

  fetchClassrooms(): void {
    this.http.get<{ classrooms: any[] }>('http://localhost:5000/api/classrooms/get-all-classrooms')
      .subscribe({
        next: response => {
          console.log('Fetched classrooms:', response.classrooms);
          this.classrooms = response.classrooms;
          this.isLoading = false;
        },
        error: error => {
          this.errorMessage = 'Failed to load classrooms.';
          this.isLoading = false;
        }
      });
  }
  
  
}


