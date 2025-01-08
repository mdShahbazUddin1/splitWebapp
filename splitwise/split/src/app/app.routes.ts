import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './auth.guard';
import { NgModule } from '@angular/core';
import { GuestGuard } from './GuestGuard.guard';
import { AllComponent } from './all/all.component';
import { RecentComponent } from './recent/recent.component';
import { GroupsComponent } from './groups/groups.component';
import { GetgroupComponent } from './getgroup/getgroup.component';
import { ExpensemodalComponent } from './expensemodal/expensemodal.component';
import { InviteComponent } from './invite/invite.component';
import { AddfriendComponent } from './addfriend/addfriend.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, canActivate: [GuestGuard] },
  { path: 'login', component: LoginComponent, canActivate: [GuestGuard] },
  { path: 'register', component: SignupComponent, canActivate: [GuestGuard] },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'all',
    component: AllComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'recent',
    component: RecentComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'addfriend',
    component: AddfriendComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'groups/new',
    component: GroupsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'groups/:groupId',
    component: GetgroupComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'expense-mod',
    component: ExpensemodalComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'invite/:token',
    component: InviteComponent,
  },
  { path: '**', redirectTo: '/login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
