import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../services/user-c.service';
import { ToasterComponent } from '../toaster/toaster.component';
import { Auth, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  providers: [ToasterComponent],
})
export class LoginComponent {
  userForm: FormGroup;
  email: string = '';
  password: string = '';
  isFormSubmitted: Boolean = false;

  constructor(
    private UserService: UserService,
    private toaster: ToasterComponent,
    private auth: Auth,
    private http: HttpClient,
    private cookieService: CookieService,
    private router: Router
  ) {
    this.userForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.pattern('^(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{8,}$'),
      ]),
    });
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();

    try {
      provider.setCustomParameters({
        prompt: 'select_account',
      });
      const result = await signInWithPopup(this.auth, provider);
      const user = result.user;
      const accessToken = await user.getIdToken();
      // console.log('Google Login Successful:', user);

      const response: any = await this.http
        .post('http://localhost:8080/auth/google_login', {
          access_token: accessToken,
        })
        .toPromise();
      this.cookieService.set(
        'user',
        response.token,
        1,
        '/',
        undefined,
        true,
        'None'
      );
      this.UserService.updateLoginState(response.user, true);
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Google Login Error:', error);
    }
  }

  onSubmit() {
    this.isFormSubmitted = true;
    if (this.userForm.invalid) {
      return;
    }
    this.UserService.login(this.userForm.value).subscribe(
      (response) => {
        console.log('Login Successfull', response);
        this.cookieService.set(
          'user',
          response.token,
          1,
          '/',
          undefined,
          true,
          'None'
        );
        this.UserService.updateLoginState(response.user, true);
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        console.log('Login Failed', error);
        if (error.status === 401) {
          alert('Invalid email or password');
        } else if (error.status === 400) {
          alert('Email and Password required');
        } else {
          alert('Something went wrong. Please try again.');
        }
      }
    );
  }
}
