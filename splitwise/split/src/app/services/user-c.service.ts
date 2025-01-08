import { CookieService } from 'ngx-cookie-service';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, Subject } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userSubject = new BehaviorSubject<any>(null);
  public user$ = this.userSubject.asObservable();
  private modalVisibilitySubject = new BehaviorSubject<boolean>(false);
  modalVisibility$ = this.modalVisibilitySubject.asObservable();
  private selectedGroupIdSource = new BehaviorSubject<string | null>(null);
  selectedGroupId$ = this.selectedGroupIdSource.asObservable();
  private activeMenuSubject = new BehaviorSubject<string>('dashboard');
  activeMenu$ = this.activeMenuSubject.asObservable();
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();
  firebaseAuth = inject(Auth);
  private userIdSource = new BehaviorSubject<string | null>(null);
  private userEmailSource = new BehaviorSubject<string | null>(null);

  private baseUrl = 'http://localhost:8080/';

  constructor(private http: HttpClient, private cookieService: CookieService) {
    this.loadUserData();
  }

  private loadUserData() {
    const token = this.cookieService.get('user');
    if (token) {
      const decodedToken: any = jwtDecode(token);
      this.userIdSource.next(decodedToken?.userId); // Adjust based on your token
      this.userEmailSource.next(decodedToken?.email); // Adjust based on your token
    }
  }

  // Get the userId from the BehaviorSubject
  getUserId() {
    return this.userIdSource.asObservable();
  }

  // Get the userEmail from the BehaviorSubject
  getUserEmail() {
    return this.userEmailSource.asObservable();
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}auth/login`, credentials).pipe(
      tap((response: any) => {
        this.cookieService.set('user', response.token);
        this.isLoggedInSubject.next(true);
        this.userSubject.next(response.user);
      })
    );
  }

  setActiveMenu(menu: string) {
    this.activeMenuSubject.next(menu);
  }

  register(userData: {
    name: string;
    email: string;
    password: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}auth/register`, userData);
  }

  updateLoginState(user: any, isLoggedIn: boolean): void {
    this.userSubject.next(user);
    this.isLoggedInSubject.next(isLoggedIn);
  }

  getLoggedInUser(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}auth/getLoggedInUser`);
  }
  setUser(userData: any) {
    this.userSubject.next(userData);
  }

  logout(): Observable<any> {
    return this.http.get(`${this.baseUrl}auth/logout`).pipe(
      tap(() => {
        this.cookieService.delete('user');
        this.isLoggedInSubject.next(false);
        this.userSubject.next(null);
      })
    );
  }

  getAllGroups(): Observable<any> {
    return this.http.get(`${this.baseUrl}group/get`);
  }

  getRecentActivities(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}recent/get`);
  }

  getGroupsById(groupId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}group/getgroup/${groupId}`);
  }

  createGroup(groupData: {
    groupName: string;
    members: any[];
    groupImage: string;
    groupType: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}group/create`, groupData).pipe(
      tap((response: any) => {
        console.log('Group created successfully:', response);
      })
    );
  }

  getExpenses(): Observable<any> {
    return this.http.get(`${this.baseUrl}expense/get`).pipe(
      tap((response) => {
        console.log('Expenses fetched successfully:', response);
      })
    );
  }
  getFriend(): Observable<any> {
    return this.http.get(`${this.baseUrl}friend/accepted`).pipe(
      tap((response) => {
        console.log('Friend list fetched successfully:', response);
      })
    );
  }

  addExpense(expenseData: {
    group_id: string;
    paid_by: string;
    amount: number;
    description: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}expense/add`, expenseData).pipe(
      tap((response: any) => {
        console.log('Expense added successfully:', response);
      })
    );
  }
  updateExpense(expenseData: {
    group_id: string;
    expense_id: string;
    updatedExpense: {
      amount: number;
      description: string;
    };
  }): Observable<any> {
    return this.http.put(`${this.baseUrl}expense/update`, expenseData).pipe(
      tap((response: any) => {
        console.log('Expense updated successfully:', response);
      })
    );
  }

  deleteExpense(groupId: string, expenseId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}expense/delete`, {
      body: { group_id: groupId, expense_id: expenseId },
    });
  }

  deleteGroup(groupId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}group/delete/${groupId}`);
  }

  setSelectedGroupId(groupId: string): void {
    this.selectedGroupIdSource.next(groupId);
  }

  openModal() {
    this.modalVisibilitySubject.next(true);
  }

  closeModal() {
    this.modalVisibilitySubject.next(false);
  }  

  private friendUpdateSource = new Subject<void>();
  friendUpdate$ = this.friendUpdateSource.asObservable();

  triggerFriendUpdate() {
    console.log('trigger');

    this.friendUpdateSource.next();
  }
}
