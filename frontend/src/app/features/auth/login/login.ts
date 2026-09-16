import {
  ChangeDetectorRef,
  Component
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  email = '';
  password = '';

  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    if (history.state.accountCreated) {
      this.successMessage =
        'Compte créé. Vous pouvez maintenant vous connecter.';
    }
  }

  submit(): void {

    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage =
        'Veuillez renseigner votre email et votre mot de passe.';
      return;
    }

    this.loading = true;

    this.authService.login(
      this.email,
      this.password
    ).subscribe({

      next: () => {
        this.loading = false;
        this.router.navigate(['/upload']);
      },

      error: error => {
        this.errorMessage =
          error.error?.message ??
          'Connexion impossible.';

        this.loading = false;

        this.changeDetectorRef.detectChanges();
      }
    });
  }
}
