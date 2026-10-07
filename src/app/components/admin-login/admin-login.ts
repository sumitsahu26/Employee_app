import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css'
})
export class AdminLogin {

  email = '';
  password = '';

  errorMessage = '';

  constructor(private router: Router) {}

  login() {

    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter email and password';
      return;
    }

    // Temporary login
    if (
      this.email === 'admin@gmail.com' &&
      this.password === '123456'
    ) {

      localStorage.setItem('adminLoggedIn', 'true');

      this.router.navigate(['/admin/dashboard']);

    } else {

      this.errorMessage = 'Invalid email or password';

    }
  }
}