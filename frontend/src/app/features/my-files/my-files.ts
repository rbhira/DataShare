import {
  ChangeDetectorRef,
  Component
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import {
  Router,
  RouterLink
} from '@angular/router';

import { AuthService } from '../../services/auth.service';

import {
  FileHistoryItem,
  FileHistoryService
} from '../../services/file-history.service';

type FileFilter = 'all' | 'active' | 'expired';

@Component({
  selector: 'app-my-files',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './my-files.html',
  styleUrl: './my-files.css'
})
export class MyFiles {

  files: FileHistoryItem[] = [];

  loading = true;
  errorMessage = '';

  selectedFilter: FileFilter = 'active';

  mobileMenuOpen = false;

  deletingFileIds = new Set<number>();

  constructor(
    private authService: AuthService,
    private fileHistoryService: FileHistoryService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.loadFiles();
  }

  get filteredFiles(): FileHistoryItem[] {

    if (this.selectedFilter === 'active') {
      return this.files.filter(file => !file.expired);
    }

    if (this.selectedFilter === 'expired') {
      return this.files.filter(file => file.expired);
    }

    return this.files;
  }

  loadFiles(): void {

    const token = this.authService.getToken();

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.fileHistoryService
      .getHistory(token)
      .subscribe({

        next: files => {
          this.files = files;
          this.loading = false;

          this.changeDetectorRef.detectChanges();
        },

        error: error => {

          if (error.status === 401) {
            this.authService.logout();
            this.router.navigate(['/login']);
            return;
          }

          this.errorMessage =
            'Impossible de charger vos fichiers.';

          this.loading = false;

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  selectFilter(filter: FileFilter): void {
    this.selectedFilter = filter;
  }

  openMobileMenu(): void {
    this.mobileMenuOpen = true;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  accessFile(file: FileHistoryItem): void {

    if (file.expired) {
      return;
    }

    this.router.navigate([
      '/download',
      file.downloadToken
    ]);
  }

  deleteFile(file: FileHistoryItem): void {

    if (
      file.expired ||
      this.deletingFileIds.has(file.id)
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Supprimer définitivement « ${file.originalName} » ?`
    );

    if (!confirmed) {
      return;
    }

    const token = this.authService.getToken();

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.errorMessage = '';
    this.deletingFileIds.add(file.id);

    this.fileHistoryService
      .deleteFile(file.id, token)
      .subscribe({

        next: () => {
          this.files =
            this.files.filter(
              currentFile =>
                currentFile.id !== file.id
            );

          this.deletingFileIds.delete(file.id);

          this.changeDetectorRef.detectChanges();
        },

        error: (error: HttpErrorResponse) => {

          this.deletingFileIds.delete(file.id);

          if (error.status === 401) {
            this.authService.logout();
            this.router.navigate(['/login']);
            return;
          }

          if (error.status === 0) {
            this.errorMessage =
              'Connexion réseau indisponible. Vérifiez votre connexion puis réessayez.';
          } else if (error.status === 404) {
            this.errorMessage =
              'Ce fichier n’existe plus ou a déjà été supprimé.';
          } else {
            this.errorMessage =
              'Impossible de supprimer ce fichier.';
          }

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  isDeleting(fileId: number): boolean {
    return this.deletingFileIds.has(fileId);
  }

  addFiles(): void {
    this.mobileMenuOpen = false;
    this.router.navigate(['/upload']);
  }

  logout(): void {
    this.mobileMenuOpen = false;
    this.authService.logout();
    this.router.navigate(['/login']);
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

  expirationText(file: FileHistoryItem): string {

    if (file.expired) {
      return 'Expiré';
    }

    const now = new Date();
    const expiration = new Date(file.expiresAt);

    const difference =
      expiration.getTime() - now.getTime();

    const days = Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );

    if (days <= 1) {
      return 'Expire demain';
    }

    return `Expire dans ${days} jours`;
  }
}
