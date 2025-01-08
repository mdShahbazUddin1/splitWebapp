import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class GuestGuard implements CanActivate {
  constructor(private router: Router, private cookieService: CookieService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Check if the user cookie exists
    if (this.cookieService.check('user')) {
      // Redirect to dashboard if the user is already authenticated
      this.router.navigate(['/dashboard']);
      return false;
    } else {
      return true; // Allow access to the route
    }
  }
}
