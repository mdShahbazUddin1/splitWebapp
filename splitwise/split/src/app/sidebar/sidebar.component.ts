import { Component, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { UserService } from '../services/user-c.service';
import { CommonModule, Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterOutlet, CommonModule, FormsModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  activeMenu: string = 'dashboard';
  groups: any[] = [];
  friends: any[] = [];
  pendingRequest: any[] = [];
  loading: boolean = true;
  recipientEmail: string = '';
  currentUrl: string = '';
  groupId: string = '';

  constructor(
    private activeMenuService: UserService,
    private location: Location,
    private router: Router,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private friendService: UserService
  ) {}

  ngOnInit() {
    this.fetchGroups();
    this.fetchFriend();
    this.currentUrl = this.location.path();
    console.log('Current URL:', this.currentUrl);
    this.groupId = this.extractGroupIdFromUrl(this.currentUrl);
    console.log('Extracted Group ID:', this.groupId);
    this.fetchPendingFriendRequests();
    // Subscribe to friend update events
    this.friendService.friendUpdate$.subscribe(() => {
      this.fetchFriend(); // Refresh the friend list
    });
  }

  fetchPendingFriendRequests(): void {
    const apiUrl = 'http://localhost:8080/friend/pending'; // API endpoint

    this.http.get<any>(apiUrl).subscribe({
      next: (response) => {
        console.log('Pending friend requests:', response);
        this.pendingRequest = response.data.map((request: any) => ({
          id: request.requestId,
          sender: {
            id: request.sender.id,
            name: request.sender.name,
            email: request.sender.email,
          },
          receiver: {
            id: request.receiver.id,
            name: request.receiver.name,
            email: request.receiver.email,
          },
          status: request.status,
          createdAt: request.createdAt,
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching pending requests:', error);
        this.loading = false;
      },
    });
  }

  acceptRequest(requestId: string): void {
    const apiUrl = `http://localhost:8080/friend/accept-request/${requestId}`;

    this.http.post(apiUrl, {}).subscribe({
      next: () => {
        this.friends = this.friends.filter((friend) => friend.id !== requestId);
        alert('Friend request accepted!');
        this.fetchPendingFriendRequests();
        this.fetchFriend();
        this.friendService.triggerFriendUpdate();
      },
      error: (error) => {
        console.error('Error accepting friend request:', error);
        alert('Failed to accept the request.');
      },
    });
  }

  rejectRequest(requestId: string): void {
    const apiUrl = `http://localhost:8080/friend/reject-request/${requestId}`;

    this.http.post(apiUrl, {}).subscribe({
      next: () => {
        this.friends = this.friends.filter((friend) => friend.id !== requestId);
        alert('Friend request rejected!');
        this.fetchPendingFriendRequests();
      },
      error: (error) => {
        console.error('Error rejecting friend request:', error);
        alert('Failed to reject the request.');
      },
    });
  }

  selectedMenuItem(menuItem: string, groupId?: string): void {
    this.activeMenu = menuItem;
    this.activeMenuService.setActiveMenu(menuItem);
    this.activeMenuService.setSelectedGroupId(groupId!);

    let path = '';

    switch (menuItem) {
      case 'dashboard':
        path = '/dashboard';
        break;
      case 'recent-activity':
        path = '/recent';
        break;
      case 'all-expenses':
        path = '/all';
        break;
      case 'group':
        path = `/group/${groupId}`;
        break;
      default:
        path = '/dashboard';
    }
    this.location.replaceState(path);
    this.groupId = groupId || '';
  }

  addGroup() {
    this.router.navigate(['/groups/new']);
  }

  addFriend() {
    this.router.navigate(['/addfriend']);
  }

  fetchGroups() {
    this.activeMenuService.getAllGroups().subscribe(
      (data) => {
        this.groups = data.groups;
        this.loading = false;
        console.log('Groups:', this.groups);
      },
      (error) => {
        console.error('Error fetching groups:', error);
        this.loading = false;
      }
    );
  }

  fetchFriend() {
    this.activeMenuService.getFriend().subscribe(
      (data) => {
        this.friends = data.friends;
        this.loading = false;
        console.log('Friends:', this.friends);
      },
      (error) => {
        console.error('Error fetching friends:', error);
        this.loading = false;
      }
    );
  }

  extractGroupIdFromUrl(url: string): string {
    const parts = url.split('/');
    return parts.length > 2 ? parts[2] : '';
  }

  sendInvite(): void {
    console.log('Group ID:', this.groupId);
    console.log('Recipient Email:', this.recipientEmail);

    if (!this.groupId) {
      alert('Please select group to send invitation');
      return;
    }

    if (!this.recipientEmail) {
      alert('Please provide a valid email address to send the invite.');
      return;
    }

    const inviteData = {
      groupId: this.groupId,
      recipientEmail: this.recipientEmail,
    };

    this.http.post('http://localhost:8080/invite/send', inviteData).subscribe(
      (response) => {
        alert('Invite sent successfully!');
        console.log('Response:', response);
      },
      (error) => {
        console.error('Error sending invite:', error);
        alert('Failed to send invite. Please try again.');
      }
    );
  }
}
