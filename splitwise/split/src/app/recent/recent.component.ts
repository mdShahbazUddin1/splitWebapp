import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user-c.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recent',
  imports: [CommonModule],
  templateUrl: './recent.component.html',
  styleUrl: './recent.component.css',
})
export class RecentComponent implements OnInit {
  activities: any[] = [];

  constructor(private userServices: UserService) {}

  ngOnInit(): void {
    this.loadRecentActivities();
  }

  loadRecentActivities(): void {
    this.userServices.getRecentActivities().subscribe(
      (response) => {
        this.activities = response.activities;
      },
      (error) => {
        console.error('Error fetching recent activities', error);
      }
    );
  }
}
