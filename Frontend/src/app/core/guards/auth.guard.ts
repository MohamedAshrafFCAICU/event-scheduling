import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1), // take the latest value and complete
    map(isAuthenticated => {
      if (!isAuthenticated) {
        router.navigate(['/login']); // redirect to login if not authenticated
        return false;
      }
      return true;
    })
  );
};
