import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
    const router = inject(Router);
  
    return authService.isAuthenticated$.pipe(
      take(1), // take the latest value and complete
      map(isAuthenticated => {
        if (isAuthenticated && (state.url === '/login' || state.url === '/signup')) {
          router.navigate(['/events']); // redirect to events if authenticated and trying to access login or signup
          return false;
        }
        return true;
      })
    );
};
