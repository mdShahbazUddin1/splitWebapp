import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user-c.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MainComponent } from '../main/main.component';
import { RightsidebarComponent } from '../rightsidebar/rightsidebar.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [SidebarComponent, MainComponent, RightsidebarComponent],
})
export class DashboardComponent implements OnInit {
  user: any;

  constructor(private UserService: UserService) {}

  ngOnInit(): void {
    this.UserService.getLoggedInUser().subscribe(
      (response) => {
        // console.log('Logged-in User:', response);
        this.UserService.setUser(response);
      },
      (error) => {
        console.error('Error fetching logged-in user:', error);
      }
    );
  }
}
