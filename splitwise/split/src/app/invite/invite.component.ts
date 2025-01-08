import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.css'],
})
export class InviteComponent implements OnInit {
  token: string | null = null;
  inviteStatus: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token');

    if (this.token) {
      this.acceptInvite(this.token);
      console.log(this.token);
    } else {
      this.inviteStatus = 'Invalid token.';
    }
  }

  acceptInvite(token: string): void {
    const inviteUrl = `http://localhost:8080/invite/accept/${token}`;

    this.inviteStatus = 'Processing your invite...';

    this.http.get(inviteUrl).subscribe(
      (response: any) => {
        if (response.success) {
          this.inviteStatus = 'You have successfully joined the group!';
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 2000);
        } else {
          this.inviteStatus = response.message || 'An error occurred.';
        }
      },
      (error) => {
        console.error('Error accepting invite:', error);
        if (error.status === 404) {
          this.inviteStatus = 'This invite link is invalid or has expired.';
        } else if (error.status === 400) {
          this.inviteStatus = 'This invite link is no longer valid.';
        } else {
          this.inviteStatus =
            'An error occurred while accepting the invite. Please try again.';
        }
      }
    );
  }
}
