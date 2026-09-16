import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface FileUploadResponse {
  id: number;
  originalName: string;
  size: number;
  mimeType: string;
  downloadToken: string;
  uploadedAt: string;
  expiresAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  private readonly apiUrl = '/api/files';

  constructor(private http: HttpClient) {}

  upload(
    file: File,
    token: string,
    expiresAt?: string
  ): Observable<FileUploadResponse> {

    const formData = new FormData();

    formData.append('file', file);

    if (expiresAt) {
      formData.append('expiresAt', expiresAt);
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post<FileUploadResponse>(
      this.apiUrl,
      formData,
      { headers }
    );
  }
}
