import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FileDownloadInfo {
  originalName: string;
  mimeType: string;
  size: number;
  expiresAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileDownloadService {

  private readonly apiUrl = '/api/download';

  constructor(private http: HttpClient) {}

  getFileInfo(token: string): Observable<FileDownloadInfo> {
    return this.http.get<FileDownloadInfo>(
      `${this.apiUrl}/${encodeURIComponent(token)}`
    );
  }

  getDownloadUrl(token: string): string {
    return `${this.apiUrl}/${encodeURIComponent(token)}/file`;
  }
}
