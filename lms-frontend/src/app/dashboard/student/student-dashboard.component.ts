import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css']
})
export class StudentDashboardComponent implements OnInit {
  courses: any[] = [];
  dashboard: any[] = [];
  loading = true;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.http.get<{ dashboard: any[] }>('http://localhost:5000/api/dashboard/student')
      .subscribe({
        next: res => {
          this.dashboard = res.dashboard;
          this.loading = false;
        },
        error: err => {
          console.error(err);
          this.loading = false;
        }
      });
  }

  // goToLiveCoding() {
  //   this.router.navigate(['/live-coding']);
  // }
  

  goBackToManage() {
    this.router.navigate([`/my-courses`]);
  }
}
