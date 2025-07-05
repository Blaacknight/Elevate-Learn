import { Component, HostListener, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'], // You might need a CSS file for mobile menu styles
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule],
})
export class LayoutComponent implements OnInit {
  dropdownOpen = false;
  mobileMenuOpen = false;

  constructor(
    public auth: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    // Check if the user is authenticated when the component loads
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login']); // Redirect to login if not authenticated
    }
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  logout() {
    this.auth.logout('You have been logged out.'); // Logout and show toast
    this.router.navigate(['/login']); // Redirect to login after logout
  }

  get userRole() {
    return this.auth.getUserRole(); // Retrieve the current user's role
  }

  get isAuthenticated() {
    return this.auth.isAuthenticated();
  }

  get userName() {
    return this.auth.getUserName();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative') && this.dropdownOpen) {
      this.closeDropdown();
    }
  }

  goToLiveCoding() {
    this.router.navigate(['/live-coding']);
  }

  // New method to navigate to chatroom
  goToChatroom() {
    this.router.navigate(['/chatroom']); // Navigate to chatroom
  }
}
