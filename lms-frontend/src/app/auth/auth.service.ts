import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:5000/api/auth';
  private user: any = null;
  private logoutTimer: any;

  constructor(private http: HttpClient,
              private router: Router,
              private toastr: ToastrService) {
    this.loadUserFromToken();
    this.startSessionWatcher();
  }

  // Load user from token if token exists and is valid
  loadUserFromToken() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp > now) {
        this.user = JSON.parse(user); // Load full user object
      } else {
        this.logout('Session expired. Please log in again.');
      }
    }
  }
  

  // Start watching the session for expiration
  startSessionWatcher() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiresAt = payload.exp * 1000; // Convert to ms
    const now = Date.now();

    const timeLeft = expiresAt - now;

    if (timeLeft <= 0) {
      this.logout('Session expired. Please log in again.');
    } else {
      this.logoutTimer = setTimeout(() => {
        this.logout('Session expired. Please log in again.');
      }, timeLeft);
    }
  }

  // Logout user, clear session and redirect to login page
  logout(message = 'You have been logged out.') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.user = null;
    clearTimeout(this.logoutTimer);
    this.toastr.info(message, 'Session Ended');
    this.router.navigate(['/login']);
  }

  // Login method: Authenticate user and store token
  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, data).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user)); // Save the entire user
        this.user = { _id: res.user._id, name: res.user.name, role: res.user.role }; // Include name
        this.startSessionWatcher();
  
        // Role-based redirect
        if (this.user.role === 'admin') {
          this.router.navigate(['admin-dashboard']);
        } else {
          const redirect = this.user.role === 'tutor' ? '/tutor-dashboard' : '/courses';
          console.log(redirect);
          this.router.navigate([redirect]);
        }
      })
    );
  }
  

  // Register method: Create a new user and login
  register(data: { name: string; email: string; password: string; role: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user)); // Save the entire user
        this.user = { _id: res.user._id, role: res.user.role };
        this.startSessionWatcher();

        // 🎯 Redirect based on role
        const redirect = this.user.role === 'tutor' ? '/tutor-dashboard' : '/courses';
        this.router.navigate([redirect]);
      })
    );
  }

  // Get the stored user object from localStorage
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Get the name of the logged-in user
  getUserName(): string {
    return this.getUser()?.name || '';
  }

  // Get the role of the logged-in user
  getUserRole(): string {
    return this.getUser()?.role || '';
  }

  // Get the token from localStorage
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Check if the user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}
