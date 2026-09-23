import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it
} from 'vitest';

import {
  FileHistoryItem,
  FileHistoryService
} from './file-history.service';

describe('FileHistoryService', () => {

  let service: FileHistoryService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FileHistoryService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(FileHistoryService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('recupere l historique avec le JWT', () => {
    const files: FileHistoryItem[] = [
      {
        id: 42,
        originalName: 'rapport.pdf',
        size: 1024,
        uploadedAt: '2026-09-23T18:00:00',
        expiresAt: '2026-09-30T18:00:00',
        downloadToken: 'download-token',
        expired: false
      }
    ];

    service.getHistory('jwt-test')
      .subscribe(result => {
        expect(result).toEqual(files);
      });

    const request =
      httpTesting.expectOne('/api/files');

    expect(request.request.method)
      .toBe('GET');

    expect(
      request.request.headers.get('Authorization')
    ).toBe('Bearer jwt-test');

    request.flush(files);
  });

  it('supprime un fichier avec son identifiant et le JWT', () => {
    service.deleteFile(
      42,
      'jwt-test'
    ).subscribe();

    const request =
      httpTesting.expectOne('/api/files/42');

    expect(request.request.method)
      .toBe('DELETE');

    expect(
      request.request.headers.get('Authorization')
    ).toBe('Bearer jwt-test');

    request.flush(null);
  });
});
