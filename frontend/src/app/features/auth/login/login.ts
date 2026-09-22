import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../services/auth.service';
import { AuthShell } from '../../../shared/auth-shell/auth-shell';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AuthShell
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  readonly loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.email
      ]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    if (history.state?.accountCreated) {
      this.successMessage =
        'Compte créé. Vous pouvez maintenant vous connecter.';
    }
  }

  get emailInvalid(): boolean {
    const control = this.loginForm.controls.email;
    return control.invalid && (control.touched || control.dirty);
  }

  get passwordInvalid(): boolean {
    const control = this.loginForm.controls.password;
    return control.invalid && (control.touched || control.dirty);
  }

  get emailErrorMessage(): string {
    const control = this.loginForm.controls.email;

    if (control.hasError('required')) {
      return 'Veuillez saisir votre email.';
    }

    return 'Veuillez saisir une adresse email valide.';
  }

  submit(): void {
    if (this.loading) {
      return;
    }

    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const { email, password } = this.loginForm.getRawValue();

    this.authService.login(email, password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/upload']);
      },

      error: (error: HttpErrorResponse) => {
        if (error.status === 0) {
          this.errorMessage =
            'Connexion réseau indisponible. Vérifiez votre connexion puis réessayez.';
        } else {
          this.errorMessage =
            error.error?.message ??
            'Connexion impossible.';
        }

        this.loading = false;
        this.changeDetectorRef.detectChanges();
      }
    });
  }
}
