import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode } from 'jwt-decode';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const cookieService = inject(CookieService);
  const token = cookieService.get('user');
  if (token) {
    const decodedToken: any = jwtDecode(token);
    const userId = decodedToken?.userId;
    const email = decodedToken?.email;
    // console.log('Decoded Token:', decodedToken);
    console.log('User ID:', userId);
    console.log('Email:', email);
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(cloned);
  }
  return next(req);
};
