import { TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter
} from '@angular/router';
import { Subject } from 'rxjs';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import {
  FileDownloadInfo,
  FileDownloadService
} from '../../services/file-download.service';
import { Download } from './download';

describe('Download template', () => {

  let fileInfo$: Subject<FileDownloadInfo>;

  beforeEach(async () => {
    fileInfo$ = new Subject<FileDownloadInfo>();

    await TestBed.configureTestingModule({
      imports: [Download],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({
                token: 'token-test'
              })
            }
          }
        },
        {
          provide: FileDownloadService,
          useValue: {
            getFileInfo: vi.fn(
              () => fileInfo$.asObservable()
            ),
            downloadFile: vi.fn()
          }
        }
      ]
    }).compileComponents();
  });

  it('affiche les informations du fichier dans le template', () => {
    const fixture =
      TestBed.createComponent(Download);

    fixture.detectChanges();

    fileInfo$.next({
      originalName: 'rapport.pdf',
      mimeType: 'application/pdf',
      size: 1500,
      expiresAt: '2026-09-30T18:00:00'
    });

    fixture.detectChanges();

    const text =
      fixture.nativeElement.textContent;

    expect(text)
      .toContain('rapport.pdf');
  });
});
