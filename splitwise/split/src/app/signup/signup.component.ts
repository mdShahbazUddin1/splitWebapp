import { UserService } from './../services/user-c.service';
import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, NgModule } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { error } from 'console';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [NgIf, FormsModule, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  userForm: FormGroup;
  name: string = '';
  email: string = '';
  password: string = '';

  isFirstInputFilled = true;
  isSecondInputVisible = false;
  isThirdInputVisible = false;
  isSignupVisible = false;
  isFormSubmitted: Boolean = false;

  constructor(
    private UserService: UserService,
    private auth: Auth,
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService
  ) {
    this.userForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(4)]),
      email: new FormControl('', [Validators.email, Validators.required]),
      password: new FormControl('', [
        Validators.required,
        Validators.pattern('^(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{8,}$'),
      ]),
    });
    this.trackFormChanges();
  }

  trackFormChanges() {
    this.userForm.controls['name'].valueChanges.subscribe((value: string) => {
      this.isSecondInputVisible = this.userForm.controls['name'].valid;
    });

    this.userForm.controls['email'].valueChanges.subscribe((value: string) => {
      this.isThirdInputVisible = this.userForm.controls['email'].valid;
    });

    this.userForm.controls['password'].valueChanges.subscribe(
      (value: string) => {
        this.isSignupVisible = this.userForm.controls['password'].valid;
      }
    );
  }

  onNameInputChange() {
    if (this.name.length > 0) {
      this.isSecondInputVisible = true;
    }
  }

  onEmailInputChange() {
    if (this.email.length > 0) {
      this.isThirdInputVisible = true;
    }
  }

  onPasswordInputChange() {
    if (this.password.length > 0) {
      this.isSignupVisible = true;
    }
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
    this.UserService.register(this.userForm.value).subscribe(
      (response) => {
        console.log('Register Successful', response);
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        console.log('Register Failed', error);
      }
    );
  }
}
