import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../services/auth.service';
import { AuthShell } from '../../../shared/auth-shell/auth-shell';

const passwordsMatchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword
    ? null
    : { passwordMismatch: true };
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AuthShell
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  readonly registerForm = new FormGroup(
    {
      email: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.email
        ]
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(8)
        ]
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required]
      })
    },
    { validators: [passwordsMatchValidator] }
  );

  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  get emailInvalid(): boolean {
    const control = this.registerForm.controls.email;
    return control.invalid && (control.touched || control.dirty);
  }

  get passwordInvalid(): boolean {
    const control = this.registerForm.controls.password;
    return control.invalid && (control.touched || control.dirty);
  }

  get confirmPasswordInvalid(): boolean {
    const control = this.registerForm.controls.confirmPassword;
    const interacted = control.touched || control.dirty;

    return interacted && (
      control.invalid ||
      this.registerForm.hasError('passwordMismatch')
    );
  }

  get emailErrorMessage(): string {
    const control = this.registerForm.controls.email;

    if (control.hasError('required')) {
      return 'Veuillez saisir votre email.';
    }

    return 'Veuillez saisir une adresse email valide.';
  }

  get passwordErrorMessage(): string {
    const control = this.registerForm.controls.password;

    if (control.hasError('required')) {
      return 'Veuillez saisir un mot de passe.';
    }

    return 'Le mot de passe doit contenir au moins 8 caractères.';
  }

  get confirmPasswordErrorMessage(): string {
    const control = this.registerForm.controls.confirmPassword;

    if (control.hasError('required')) {
      return 'Veuillez confirmer votre mot de passe.';
    }

    return 'Les mots de passe ne correspondent pas.';
  }

  submit(): void {
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const { email, password } = this.registerForm.getRawValue();

    this.authService.register(email, password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(
          ['/login'],
          {
            state: {
              accountCreated: true
            }
          }
        );
      },

      error: (error: HttpErrorResponse) => {
        this.errorMessage =
          error.error?.message ??
          'Création du compte impossible.';

        this.loading = false;
        this.changeDetectorRef.detectChanges();
      }
    });
  }
}
