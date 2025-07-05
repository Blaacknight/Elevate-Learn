import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    FormsModule,
    HttpClientModule,
    CommonModule,
    RouterModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'lms-frontend';
  loading: boolean = true;

  constructor(private router: Router, private auth: AuthService) {
    setTimeout(() => {
      this.loading = false;
      const user = this.auth.getUser();

      if (user && user.role === 'student') {
        this.router.navigate(['/courses']);
      } else {
        this.router.navigate(['/welcome']);
      }
    }, 1500);
  }
}
