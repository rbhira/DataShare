import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  FileDownloadInfo,
  FileDownloadService
} from '../../services/file-download.service';

@Component({
  selector: 'app-download',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './download.html',
  styleUrl: './download.css'
})
export class Download implements OnInit {

  fileInfo: FileDownloadInfo | null = null;

  token = '';

  loading = true;
  downloading = false;

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

  download(): void {
    if (!this.fileInfo || this.downloading) {
      return;
    }

    this.downloading = true;
    this.errorMessage = '';

    this.fileDownloadService
      .downloadFile(this.token)
      .subscribe({
        next: (blob) => {
          const url =
            window.URL.createObjectURL(blob);

          const link =
            document.createElement('a');

          link.href = url;
          link.download =
            this.fileInfo!.originalName;

          document.body.appendChild(link);
          link.click();
          link.remove();

          window.URL.revokeObjectURL(url);

          this.downloading = false;

          this.changeDetectorRef.detectChanges();
        },
        error: (error) => {
          this.downloading = false;

          if (error.status === 410) {
            this.errorMessage =
              'Ce lien de téléchargement a expiré.';
          } else if (error.status === 404) {
            this.errorMessage =
              'Le fichier est introuvable.';
          } else {
            this.errorMessage =
              'Le téléchargement a échoué.';
          }

          this.changeDetectorRef.detectChanges();
        }
      });
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
