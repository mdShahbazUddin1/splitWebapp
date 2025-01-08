import { Component, OnInit } from '@angular/core';
import { RecentComponent } from '../recent/recent.component';
import { AllComponent } from '../all/all.component';
import { UserService } from '../services/user-c.service';
import { NgIf } from '@angular/common';
import { ExpenseDashComponent } from '../expense-dash/expense-dash.component';
import { GetgroupComponent } from '../getgroup/getgroup.component';

@Component({
  selector: 'app-main',
  imports: [
    RecentComponent,
    AllComponent,
    ExpenseDashComponent,
    GetgroupComponent,
    NgIf,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent implements OnInit {
  activeMenu: string = 'dashboard';
  constructor(private activeMenuService: UserService) {}

  ngOnInit() {
    this.activeMenuService.activeMenu$.subscribe((menu) => {
      this.activeMenu = menu;
    });
  }
}
