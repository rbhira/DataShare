import {
  ChangeDetectorRef,
  Component
} from '@angular/core';

import {
  FileUploadResponse,
  FileUploadService
} from '../../services/file-upload.service';
import { AuthService } from '../../services/auth.service';
import { AuthShell } from '../../shared/auth-shell/auth-shell';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [AuthShell],
  templateUrl: './upload.html',
  styleUrl: './upload.css'
})
export class Upload {

  private readonly maxFileSize = 1024 * 1024 * 1024;

  selectedFile: File | null = null;
  expirationDays = 7;

  loading = false;
  successMessage = '';
  errorMessage = '';
  linkCopied = false;

  uploadedFile: FileUploadResponse | null = null;

  constructor(
    private fileUploadService: FileUploadService,
    private authService: AuthService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file =
      input.files && input.files.length > 0
        ? input.files[0]
        : null;

    this.successMessage = '';
    this.errorMessage = '';
    this.uploadedFile = null;
    this.linkCopied = false;

    if (file && file.size > this.maxFileSize) {
      this.selectedFile = null;
      input.value = '';
      this.errorMessage =
        'La taille des fichiers est limitée à 1 Go.';
      return;
    }

    this.selectedFile = file;
  }

  onExpirationChanged(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.expirationDays = Number(select.value) || 7;
  }

  upload(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.uploadedFile = null;
    this.linkCopied = false;

    if (!this.selectedFile) {
      this.errorMessage =
        'Veuillez sélectionner un fichier.';
      return;
    }

    const token = this.authService.getToken();

    if (!token) {
      this.errorMessage =
        'Vous devez être connecté pour envoyer un fichier.';
      return;
    }

    this.loading = true;

    this.fileUploadService.upload(
      this.selectedFile,
      token,
      this.buildExpirationDate()
    ).subscribe({
      next: response => {
        this.uploadedFile = response;
        this.successMessage =
          'Fichier envoyé avec succès.';
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

  get downloadUrl(): string {
    if (!this.uploadedFile) {
      return '';
    }

    return `${window.location.origin}/download/${this.uploadedFile.downloadToken}`;
  }

  async copyDownloadLink(): Promise<void> {
    if (!this.downloadUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(this.downloadUrl);
      this.linkCopied = true;
    } catch {
      this.errorMessage =
        'Impossible de copier automatiquement le lien. Vous pouvez le sélectionner manuellement.';
    }

    this.changeDetectorRef.detectChanges();
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} octets`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} Ko`;
    }

    if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
    }

    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} Go`;
  }

  private buildExpirationDate(): string {
    const expiration = new Date();
    expiration.setDate(
      expiration.getDate() + this.expirationDays
    );

    const pad = (value: number): string =>
      value.toString().padStart(2, '0');

    return [
      expiration.getFullYear(),
      '-',
      pad(expiration.getMonth() + 1),
      '-',
      pad(expiration.getDate()),
      'T',
      pad(expiration.getHours()),
      ':',
      pad(expiration.getMinutes()),
      ':',
      pad(expiration.getSeconds())
    ].join('');
  }
}
