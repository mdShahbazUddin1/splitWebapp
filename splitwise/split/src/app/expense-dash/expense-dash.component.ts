import { Component } from '@angular/core';
import { UserService } from '../services/user-c.service';
import { ExpensemodalComponent } from '../expensemodal/expensemodal.component';

@Component({
  selector: 'app-expense-dash',
  imports: [],
  templateUrl: './expense-dash.component.html',
  styleUrl: './expense-dash.component.css',
})
export class ExpenseDashComponent {
  constructor(private modalService: UserService) {}

  openModal() {
    this.modalService.openModal();
  }
}
