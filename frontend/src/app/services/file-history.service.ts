import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface FileHistoryItem {
  id: number;
  originalName: string;
  size: number;
  uploadedAt: string;
  expiresAt: string;
  downloadToken: string;
  expired: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FileHistoryService {

  private readonly apiUrl = '/api/files';

  constructor(private http: HttpClient) {}

  getHistory(token: string): Observable<FileHistoryItem[]> {

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<FileHistoryItem[]>(
      this.apiUrl,
      { headers }
    );
  }
}
