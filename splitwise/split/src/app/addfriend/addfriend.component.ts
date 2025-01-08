import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'; // Import necessary modules
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-addfriend',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // Use ReactiveFormsModule
  templateUrl: './addfriend.component.html',
  styleUrls: ['./addfriend.component.css'],
})
export class AddfriendComponent {
  addFriendForm: FormGroup; // Declare the form group
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder // Inject FormBuilder
  ) {
    // Initialize the form with a receiverEmail control and validation
    this.addFriendForm = this.fb.group({
      receiverEmail: ['', [Validators.required, Validators.email]], // Receiver email field
    });
  }

  // Method to send the friend request
  sendFriendRequest(): void {
    if (this.addFriendForm.invalid) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    const apiUrl = 'http://localhost:8080/friend/send-request';
    const requestData = {
      receiverEmail: this.addFriendForm.get('receiverEmail')?.value, // Get value from form control
    };

    this.http.post<any>(apiUrl, requestData).subscribe({
      next: (response) => {
        console.log(response);
        this.successMessage = response.message;
        this.errorMessage = '';
      },
      error: (error) => {
        console.error('Error sending friend request:', error);
        this.successMessage = '';
        this.errorMessage =
          error.error.message || 'Error sending friend request';
      },
    });
  }
}
