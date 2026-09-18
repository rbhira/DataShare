import {
  ChangeDetectorRef,
  Component
} from '@angular/core';

import { CommonModule } from '@angular/common';
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

  accessFile(file: FileHistoryItem): void {

    if (file.expired) {
      return;
    }

    this.router.navigate([
      '/download',
      file.downloadToken
    ]);
  }

  addFiles(): void {
    this.router.navigate(['/upload']);
  }

  logout(): void {
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
