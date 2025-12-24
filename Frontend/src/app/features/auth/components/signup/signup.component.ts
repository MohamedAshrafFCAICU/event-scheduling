import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { NgClass, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CustomValidators } from '../../../../shared/validators/custom-validators';


@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgClass, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {

  signupForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  loading: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.signupForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        CustomValidators.username()
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(255)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        CustomValidators.strongPassword()
      ]],
      confirmPassword: ['', [Validators.required]],
      firstName: ['', [
        Validators.required,
        Validators.maxLength(100),
        CustomValidators.nameValidator()
      ]],
      lastName: ['', [
        Validators.required,
        Validators.maxLength(100),
        CustomValidators.nameValidator()
      ]]
    }, {
      validators: CustomValidators.passwordMatch('password', 'confirmPassword')
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  getPasswordStrength(): string {
    const password = this.signupForm.get('password')?.value || '';
    if (!password) return '';

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      this.loading = true;

      // Call auth.service (which internally uses auth-api.service)
      this.authService.signup(this.signupForm.value).subscribe({
        next: (response) => {
          this.successMessage = 'Account created successfully!';
          // User is automatically logged in and redirected
          
          setTimeout(() => {
            this.router.navigate(['/events']);
          }, 2000);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Signup failed';
          this.loading = false;
        }
      });
    }
  }
}
