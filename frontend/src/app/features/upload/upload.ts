import {
  ChangeDetectorRef,
  Component
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FileUploadResponse,
  FileUploadService
} from '../../services/file-upload.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.html',
  styleUrl: './upload.css'
})
export class Upload {

  selectedFile: File | null = null;
  expiresAt = '';

  loading = false;
  successMessage = '';
  errorMessage = '';

  uploadedFile: FileUploadResponse | null = null;

  constructor(
    private fileUploadService: FileUploadService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.selectedFile =
      input.files && input.files.length > 0
        ? input.files[0]
        : null;

    this.successMessage = '';
    this.errorMessage = '';
  }

  onExpirationChanged(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.expiresAt = input.value;
  }

  upload(): void {

    this.successMessage = '';
    this.errorMessage = '';
    this.uploadedFile = null;

    if (!this.selectedFile) {
      this.errorMessage =
        'Veuillez sélectionner un fichier.';
      return;
    }

    const token =
      localStorage.getItem('datashare_token');

    if (!token) {
      this.errorMessage =
        'Vous devez être connecté pour envoyer un fichier.';
      return;
    }

    let expiration: string | undefined;

    if (this.expiresAt) {
      expiration =
        this.expiresAt.length === 16
          ? `${this.expiresAt}:00`
          : this.expiresAt;
    }

    this.loading = true;

    this.fileUploadService.upload(
      this.selectedFile,
      token,
      expiration
    ).subscribe({

      next: response => {
        this.uploadedFile = response;

        this.successMessage =
          'Fichier envoyé';

        this.loading = false;

        this.changeDetectorRef.detectChanges();
      },

      error: error => {
        this.errorMessage =
          error.error?.message ??
          'Une erreur est survenue pendant l’envoi.';

        this.loading = false;

        this.changeDetectorRef.detectChanges();
      }
    });
  }
}
