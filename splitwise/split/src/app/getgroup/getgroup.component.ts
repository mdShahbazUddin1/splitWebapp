import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, Location, NgClass, NgIf } from '@angular/common';
import { UserService } from '../services/user-c.service';
import { Subscription } from 'rxjs';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  FormControl,
  Validators,
} from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode } from 'jwt-decode';
import { HttpClient } from '@angular/common/http';
import { response } from 'express';

@Component({
  selector: 'app-getgroup',
  imports: [NgClass, CommonModule, NgIf, FormsModule, ReactiveFormsModule],
  templateUrl: './getgroup.component.html',
  styleUrls: ['./getgroup.component.css'],
})
export class GetgroupComponent implements OnInit, OnDestroy {
  currentUrl: string = '';
  groupId: string = '';
  groupData: any = { groupName: '', members: [] };
  newMemberEmail: string = '';
  newMemberName = '';
  isEditModal: boolean = false;
  createdDate: string = '';
  groupName: string = '';
  private subscription!: Subscription;
  isModalOpen: boolean = false;
  isExpenseModal: boolean = false;
  isSettleOpen: boolean = false;
  expenses: any[] = [];
  selectedExpense: any = null;
  expernseForm: FormGroup;
  editExpenseForm: FormGroup;
  group_id: string = '';
  paid_by: string = '';
  amount: number = 0;
  description = '';
  amountPerPerson: number = 0;
  groupMembers: any[] = [];
  isRecordClicked: boolean = false;
  splitDetails: any[] = [];
  senderName: string = '';
  paidAmount: string = '';
  receiverName: string = '';
  user: any;
  token: string | null = null;
  userName: string | null = null;
  isPaidByCurrentUser = false;

  constructor(
    private location: Location,
    private userService: UserService,
    private cookieService: CookieService,
    private http: HttpClient
  ) {
    this.expernseForm = new FormGroup({
      group_id: new FormControl(''),
      paid_by: new FormControl(''),
      amount: new FormControl(''),
      description: new FormControl(''),
    });
    this.editExpenseForm = new FormGroup({
      group_id: new FormControl(''),
      expense_id: new FormControl(''),
      amount: new FormControl(''),
      description: new FormControl(''),
    });
  }

  openEditModal(groupId: string) {
    this.groupId = groupId;
    this.isEditModal = true;
  }

  closeEditModal() {
    this.isEditModal = false;
  }

  updateGroupDetails() {
    const groupId = this.groupId;
    const groupName = this.groupData.groupName;

    const membersToAdd = this.groupData.members.filter(
      (member: any) => !member.id
    );

    const membersToRemove = this.groupData.members
      .filter((member: any) => member.isRemoved)
      .map((member: any) => member.id);
    this.http
      .put(`http://localhost:8080/group/update/${groupId}`, {
        groupName,
        membersToAdd,
        membersToRemove,
      })
      .subscribe(
        (response) => {
          console.log('Group updated successfully:', response);
          this.closeEditModal();
        },
        (error) => {
          console.error('Error updating group:', error);
        }
      );
  }

  // Add a new member to the group by email
  addMember() {
    const name = this.newMemberName.trim();
    const email = this.newMemberEmail.trim();

    if (
      name &&
      email &&
      !this.groupData.members.some((member: any) => member.email === email)
    ) {
      this.groupData.members.push({
        name: name,
        email: email,
      });
      this.newMemberName = '';
      this.newMemberEmail = '';
    }
  }

  removeMember(index: number) {
    this.groupData.members.splice(index, 1);
  }

  hasExpenses(): boolean {
    return (
      Array.isArray(this.expenses) &&
      this.expenses.some((e) => e.group === this.groupName)
    );
  }

  settleAmount() {
    this.isRecordClicked = true;
  }

  getGroupExpenses() {
    return this.expenses.filter((e) => e.group === this.groupName);
  }

  toggleExpenseDetail(expense: any) {
    if (this.selectedExpense !== expense) {
      this.selectedExpense = expense;
    }
    console.log('Selected Expense:', this.selectedExpense);

    this.userService.user$.subscribe((userData) => {
      this.user = userData;
      if (this.user) {
        this.userName = this.user?.name || 'User';
        const userEmail = this.user?.email || '';
        console.log(userEmail, 'userExpense.email');
        console.log(this.userName, 'name');

        if (expense.paid_by === this.userName) {
          this.isPaidByCurrentUser = true;
          console.log('User is the one who paid');
        } else {
          const userExpense = expense.splitDetails.find(
            (detail: any) => detail.email === userEmail
          );
          console.log(userExpense, 'userExpense');

          if (userExpense) {
            if (userExpense.settle) {
              this.isPaidByCurrentUser = true;
            } else {
              this.isPaidByCurrentUser = false;
            }
          } else {
            this.isPaidByCurrentUser = false;
          }
        }
      }
    });
  }

  openExpenseModal() {
    this.isModalOpen = true;
  }

  openSettleModal() {
    const token = this.cookieService.get('user');
    if (token) {
      const decodedToken: any = jwtDecode(token);
      const userEmail = decodedToken?.email;
      console.log(userEmail, 'djiwjck');
      console.log('settle', this.selectedExpense);
      const userSplitDetail = this.selectedExpense.splitDetails.find(
        (detail: any) => detail.email === userEmail
      );

      console.log(userSplitDetail);

      if (userSplitDetail) {
        this.senderName = userSplitDetail.name;
        this.paidAmount = userSplitDetail.lentAmount;
        this.receiverName = this.selectedExpense.paid_by;
      } else {
        this.senderName = '';
        this.paidAmount = '';
        this.receiverName = '';
      }
    }
    this.isSettleOpen = true;
  }

  settleExpense() {
    const token = this.cookieService.get('user');
    const decodedToken: any = jwtDecode(token);
    const userEmail = decodedToken?.email;

    console.log('toke', token);

    if (!this.selectedExpense) {
      console.error('No expense selected');
      return;
    }
    const expenseData = {
      group_id: this.groupData._id,
      expense_id: this.selectedExpense._id,
    };

    // Make the PUT request to the backend to settle the expense
    this.http
      .post('http://localhost:8080/settle/settle-expense', expenseData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (response: any) => {
          console.log('Expense settled successfully:', response);
          this.userService.getExpenses().subscribe({
            next: (updatedExpenses) => {
              this.expenses = updatedExpenses;
              console.log('Updated expenses:', this.expenses);
              this.isRecordClicked = false;
              this.isSettleOpen = false;
              alert('Expense settled successfully');
            },
            error: (error) => {
              console.error('Error fetching updated expenses:', error);
              alert('Error fetching updated expenses');
            },
          });
        },
        error: (error) => {
          console.error('Error settling expense:', error);
          alert('Error settling the expense');
        },
      });
  }

  closeExpenseModal() {
    this.isSettleOpen = false;
    this.isModalOpen = false;
  }
  openEditExpenseModal() {
    this.isExpenseModal = true;
  }
  closeEditExpenseModal() {
    // this.isSettleOpen = false;
    this.isExpenseModal = false;
  }

  ngOnInit(): void {
    this.currentUrl = this.location.path();
    this.groupId = this.extractGroupIdFromUrl(this.currentUrl);

    if (this.groupId) {
      this.getGroupData(this.groupId);
    }
    this.subscription = this.userService.selectedGroupId$.subscribe(
      (groupId) => {
        if (groupId) {
          this.getGroupData(groupId);
        }
      }
    );

    this.userService.getExpenses().subscribe({
      next: (response) => {
        this.expenses = response;
      },
      error: (error) => {
        console.log('Error fetching expenses:', error);
      },
    });
  }

  extractGroupIdFromUrl(url: string): string {
    const parts = url.split('/');
    return parts.length > 2 ? parts[2] : '';
  }

  getGroupData(groupId: string): void {
    this.userService.getGroupsById(groupId).subscribe(
      (data) => {
        this.groupData = data.group;

        this.groupName = this.groupData.groupName;
        this.createdDate = new Date(
          this.groupData.created_at
        ).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        console.log('group data', this.groupData);
        this.group_id = this.groupData._id;
        this.paid_by = this.groupData.created_by;
        this.groupMembers = this.groupData.members || [];

        this.expernseForm.patchValue({
          group_id: this.group_id,
          paid_by: this.paid_by,
        });
      },
      (error) => {
        console.error('Error fetching group data:', error);
      }
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  calculateAmountPerPerson(): void {
    const numberOfMembers = this.groupMembers.length + 1;
    const amountFromExpenseForm = this.expernseForm.get('amount')?.value || 0;
    const amountFromEditExpenseForm =
      this.editExpenseForm.get('amount')?.value || 0;

    this.amount =
      amountFromEditExpenseForm > 0
        ? amountFromEditExpenseForm
        : amountFromExpenseForm;

    if (numberOfMembers > 0) {
      this.amountPerPerson = this.amount / numberOfMembers;
    }
  }

  deleteExpense(expenseId: string): void {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.userService.deleteExpense(this.groupId, expenseId).subscribe({
        next: (response) => {
          console.log('Expense deleted successfully', response);
          // Refresh the expenses list after deletion
          this.expenses = this.expenses.filter(
            (expense) => expense._id !== expenseId
          );
        },
        error: (error) => {
          console.error('Error deleting expense', error);
          if (error.status === 400) {
            alert('Bad request: Please try again later.');
          } else if (error.status === 403) {
            alert('You are not authorized to delete this expense.');
          } else if (error.status === 404) {
            alert('Expense not found or already deleted.');
          } else {
            alert('An unexpected error occurred. Please try again later.');
          }
        },
      });
    }
  }

  onEditExpenseSubmit() {
    if (this.editExpenseForm.valid) {
      const formValues = this.editExpenseForm.value;
      const editExpenseData = {
        group_id: this.groupData._id,
        expense_id: this.selectedExpense._id,
        updatedExpense: {
          amount: formValues.amount,
          description: formValues.description,
        },
      };

      this.userService.updateExpense(editExpenseData).subscribe({
        next: (response) => {
          console.log('Expense updated:', response);
          this.closeEditExpenseModal();
          this.userService.getExpenses().subscribe({
            next: (updatedExpenses) => {
              this.expenses = updatedExpenses;
              console.log('Updated expenses:', this.expenses);
              this.isRecordClicked = false;
              this.isSettleOpen = false;
              alert('Expense settled successfully');
            },
            error: (error) => {
              console.error('Error fetching updated expenses:', error);
              alert('Error fetching updated expenses');
            },
          });
        },
        error: (error) => {
          console.error('Error updating expense:', error);
        },
      });
    } else {
      console.log('Form is not valid!');
    }
  }

  deleteGroup(groupId: string) {
    if (confirm('Are you sure you want to delete this group?')) {
      this.userService.deleteGroup(groupId).subscribe({
        next: (response) => {
          console.log('Group deleted successfully', response);
          alert('Group deleted successfully.');
        },
        error: (error) => {
          console.error('Error deleting group', error);
          if (error.status === 400) {
            alert('Bad request: Please try again later.');
          } else if (error.status === 403) {
            alert('You are not authorized to delete this group.');
          } else if (error.status === 404) {
            alert('Group not found or already deleted.');
          } else {
            alert('An unexpected error occurred. Please try again later.');
          }
        },
      });
    }
  }

  onSubmit(): void {
    if (this.expernseForm.valid) {
      const expenseData = this.expernseForm.value;
      this.userService.addExpense(expenseData).subscribe(
        (response) => {
          // console.log('Expenses added successfully', response);
          this.closeExpenseModal();
          this.expenses.push(response);
          this.userService.getExpenses().subscribe({
            next: (updatedExpenses) => {
              this.expenses = updatedExpenses;
              // console.log('Updated expenses:', this.expenses);
            },
            error: (error) => {
              console.error('Error fetching updated expenses:', error);
            },
          });
          this.expernseForm.reset();
        },
        (error) => {
          console.error('Error adding expense', error);
        }
      );
    } else {
      console.log('Form is not valid!');
    }
  }
}
