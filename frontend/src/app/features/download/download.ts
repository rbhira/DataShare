import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthShell } from '../../shared/auth-shell/auth-shell';
import {
  FileDownloadInfo,
  FileDownloadService
} from '../../services/file-download.service';

@Component({
  selector: 'app-download',
  standalone: true,
  imports: [CommonModule, AuthShell],
  templateUrl: './download.html',
  styleUrl: './download.css'
})
export class Download implements OnInit {

  fileInfo: FileDownloadInfo | null = null;

  token = '';

  loading = true;

  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private fileDownloadService: FileDownloadService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.token =
      this.route.snapshot.paramMap.get('token') ?? '';

    if (!this.token) {
      this.loading = false;
      this.errorMessage =
        'Lien de téléchargement invalide.';
      return;
    }

    this.loadFileInfo();
  }

  private loadFileInfo(): void {
    this.fileDownloadService
      .getFileInfo(this.token)
      .subscribe({
        next: (fileInfo) => {
          this.fileInfo = fileInfo;
          this.loading = false;

          this.changeDetectorRef.detectChanges();
        },
        error: (error) => {
          this.loading = false;

          if (error.status === 410) {
            this.errorMessage =
              'Ce lien de téléchargement a expiré.';
          } else if (error.status === 404) {
            this.errorMessage =
              'Ce lien de téléchargement est introuvable.';
          } else {
            this.errorMessage =
              'Impossible de charger le fichier.';
          }

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  get downloadUrl(): string {
    return this.fileDownloadService.getDownloadUrl(this.token);
  }

  formatSize(size: number): string {
    if (size < 1024) {
      return `${size} octets`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} Ko`;
    }

    if (size < 1024 * 1024 * 1024) {
      return `${(
        size /
        (1024 * 1024)
      ).toFixed(1)} Mo`;
    }

    return `${(
      size /
      (1024 * 1024 * 1024)
    ).toFixed(1)} Go`;
  }
}
