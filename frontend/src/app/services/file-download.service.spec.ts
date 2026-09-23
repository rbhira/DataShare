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
  FileDownloadInfo,
  FileDownloadService
} from './file-download.service';

describe('FileDownloadService', () => {

  let service: FileDownloadService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FileDownloadService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(FileDownloadService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('recupere les informations du fichier public', () => {
    const token = 'token/avec espace';

    const response: FileDownloadInfo = {
      originalName: 'rapport.pdf',
      mimeType: 'application/pdf',
      size: 1024,
      expiresAt: '2026-09-30T18:00:00'
    };

    service.getFileInfo(token)
      .subscribe(result => {
        expect(result).toEqual(response);
      });

    const request =
      httpTesting.expectOne(
        '/api/download/token%2Favec%20espace'
      );

    expect(request.request.method)
      .toBe('GET');

    request.flush(response);
  });

  it('telecharge le fichier en tant que blob', () => {
    const token = 'download-token';

    service.downloadFile(token)
      .subscribe(result => {
        expect(result)
          .toBeInstanceOf(Blob);
      });

    const request =
      httpTesting.expectOne(
        '/api/download/download-token/file'
      );

    expect(request.request.method)
      .toBe('GET');

    expect(request.request.responseType)
      .toBe('blob');

    request.flush(
      new Blob(
        ['contenu'],
        { type: 'text/plain' }
      )
    );
  });
});
