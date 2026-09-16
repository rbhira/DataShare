import {
  ChangeDetectorRef,
  Component
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  email = '';
  password = '';
  confirmPassword = '';

  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  submit(): void {

    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage =
        'Veuillez renseigner tous les champs.';
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage =
        'Le mot de passe doit contenir au moins 8 caractères.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage =
        'Les mots de passe ne correspondent pas.';
      return;
    }

    this.loading = true;

    this.authService.register(
      this.email,
      this.password
    ).subscribe({

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

      error: error => {
        this.errorMessage =
          error.error?.message ??
          'Création du compte impossible.';

        this.loading = false;

        this.changeDetectorRef.detectChanges();
      }
    });
  }
}
