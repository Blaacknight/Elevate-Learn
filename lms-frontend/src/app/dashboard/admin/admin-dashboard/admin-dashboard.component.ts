import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink,FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  loading = true;
  dashboardData: any = {};

  constructor(
    private auth: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  fetchDashboardData() {
    this.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load dashboard data:', err);
        this.loading = false;
      }
    });
  }

  getDashboardData(): Observable<any> {
    return this.http.get<any>('http://localhost:5000/api/dashboard/admin');
  }

  openCreateClassroomModal() {
    // Logic to open a modal or navigate to a classroom creation form
    console.log('Create Classroom button clicked');
  }
  

  logout() {
    this.auth.logout();
  }
}
