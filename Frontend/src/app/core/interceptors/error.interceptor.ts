import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private router: Router) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Client Error: ${error.error.message}`;
          console.error('Client-side error:', error.error.message);
        } else {
          // Server-side error
          errorMessage = `Server Error: ${error.status} - ${error.message}`;

          // Handle specific status codes
          switch (error.status) {
            case 401:
              // Unauthorized - token expired or invalid
              console.error('Unauthorized access - redirecting to login');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              this.router.navigate(['/login']);
              break;

            case 403:
              // Forbidden
              console.error('Access forbidden');
              break;

            case 404:
              // Not found
              console.error('Resource not found');
              break;

            case 500:
              // Server error
              console.error('Internal server error');
              break;

            case 0:
              // Network error
              console.error('Network error - server might be down');
              errorMessage = 'Cannot connect to server. Please check your connection.';
              break;
          }
        }

        // You can also show a toast/notification here
        // this.toastService.showError(errorMessage);

        return throwError(() => error);
      })
    );
  }
}