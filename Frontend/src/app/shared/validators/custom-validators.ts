import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
    // Username: 3-50 chars, only letters, numbers, underscores
    static username(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) return null;

            const usernameRegex = /^[a-zA-Z0-9_]+$/;
            const valid = usernameRegex.test(control.value) &&
                control.value.length >= 3 &&
                control.value.length <= 50;

            return valid ? null : { invalidUsername: true };
        };
    }

    // Password: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    static strongPassword(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) return null;

            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
            const valid = control.value.length >= 8 && passwordRegex.test(control.value);

            return valid ? null : { weakPassword: true };
        };
    }

    // Name: only letters and spaces
    static nameValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) return null;

            const nameRegex = /^[a-zA-Z\s]+$/;
            const valid = nameRegex.test(control.value) && control.value.length <= 100;

            return valid ? null : { invalidName: true };
        };
    }

    // Password match validator
    static passwordMatch(passwordField: string, confirmPasswordField: string): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const password = control.get(passwordField);
            const confirmPassword = control.get(confirmPasswordField);

            if (!password || !confirmPassword) return null;

            return password.value === confirmPassword.value ? null : { passwordMismatch: true };
        };
    }
}