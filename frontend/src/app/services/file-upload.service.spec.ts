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
  FileUploadResponse,
  FileUploadService
} from './file-upload.service';

describe('FileUploadService', () => {

  let service: FileUploadService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FileUploadService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(FileUploadService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('envoie le fichier avec le JWT et la date d expiration', () => {
    const file = new File(
      ['bonjour'],
      'rapport.pdf',
      { type: 'application/pdf' }
    );

    const expiresAt =
      '2026-09-30T12:00:00';

    const response: FileUploadResponse = {
      id: 42,
      originalName: 'rapport.pdf',
      size: 7,
      mimeType: 'application/pdf',
      downloadToken: 'download-token',
      uploadedAt: '2026-09-23T18:00:00',
      expiresAt
    };

    service.upload(
      file,
      'jwt-test',
      expiresAt
    ).subscribe(result => {
      expect(result).toEqual(response);
    });

    const request =
      httpTesting.expectOne('/api/files');

    expect(request.request.method)
      .toBe('POST');

    expect(
      request.request.headers.get('Authorization')
    ).toBe('Bearer jwt-test');

    const body =
      request.request.body as FormData;

    expect(body.get('file'))
      .toBe(file);

    expect(body.get('expiresAt'))
      .toBe(expiresAt);

    request.flush(response);
  });

  it('envoie le fichier sans date d expiration lorsqu elle est absente', () => {
    const file = new File(
      ['bonjour'],
      'rapport.pdf',
      { type: 'application/pdf' }
    );

    service.upload(
      file,
      'jwt-test'
    ).subscribe();

    const request =
      httpTesting.expectOne('/api/files');

    expect(request.request.method)
      .toBe('POST');

    expect(
      request.request.headers.get('Authorization')
    ).toBe('Bearer jwt-test');

    const body =
      request.request.body as FormData;

    expect(body.get('file'))
      .toBe(file);

    expect(body.has('expiresAt'))
      .toBe(false);

    request.flush({
      id: 42,
      originalName: 'rapport.pdf',
      size: 7,
      mimeType: 'application/pdf',
      downloadToken: 'download-token',
      uploadedAt: '2026-09-23T18:00:00',
      expiresAt: '2026-09-30T18:00:00'
    });
  });
});
