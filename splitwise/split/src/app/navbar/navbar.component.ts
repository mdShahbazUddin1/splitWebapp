import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { UserService } from '../services/user-c.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterOutlet, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  user: any;
  token: string | null = null;
  userName: string | null = null;
  profile_image: string | null = null;
  accountVisible: boolean = false;
  isLoggedIn = false;

  constructor(
    private cookieService: CookieService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
      this.token = this.cookieService.get('user');
    });

    this.token = this.cookieService.get('user');
    if (this.token) {
      this.isLoggedIn = true;
      this.userService.user$.subscribe((userData) => {
        this.user = userData;
        if (this.user) {
          this.userName = this.user?.name || 'User';
          this.profile_image =
            this.user?.profile_image ||
            'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=1575&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
        }
      });
    }
  }

  toggleAccount() {
    this.accountVisible = !this.accountVisible;
  }

  onLogout(): void {
    this.userService.logout().subscribe(
      (response) => {
        console.log('Logout successful', response);
        this.isLoggedIn = false;
        this.router.navigate(['/']);
      },
      (error) => {
        console.error('Logout failed', error);
      }
    );
  }
}
