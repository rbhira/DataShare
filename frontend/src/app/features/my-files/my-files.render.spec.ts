import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { AuthService } from '../../services/auth.service';
import {
  FileHistoryItem,
  FileHistoryService
} from '../../services/file-history.service';
import { MyFiles } from './my-files';

describe('MyFiles template', () => {

  let history$: Subject<FileHistoryItem[]>;

  beforeEach(async () => {
    history$ =
      new Subject<FileHistoryItem[]>();

    await TestBed.configureTestingModule({
      imports: [MyFiles],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            getToken: vi.fn(
              () => 'jwt-test'
            ),
            logout: vi.fn()
          }
        },
        {
          provide: FileHistoryService,
          useValue: {
            getHistory: vi.fn(
              () => history$.asObservable()
            ),
            deleteFile: vi.fn(
              () => of(void 0)
            )
          }
        }
      ]
    }).compileComponents();
  });

  it('rend le fichier actif par defaut dans le template', () => {
    const fixture =
      TestBed.createComponent(MyFiles);

    fixture.detectChanges();

    history$.next([
      {
        id: 1,
        originalName: 'rapport.pdf',
        size: 2500,
        uploadedAt: '2026-09-23T10:00:00',
        expiresAt: '2026-09-25T10:00:00',
        downloadToken: 'token-active',
        expired: false
      },
      {
        id: 2,
        originalName: 'archive.zip',
        size: 5000,
        uploadedAt: '2026-09-10T10:00:00',
        expiresAt: '2026-09-17T10:00:00',
        downloadToken: 'token-expired',
        expired: true
      }
    ]);

    fixture.detectChanges();

    const text =
      fixture.nativeElement.textContent;

    expect(text)
      .toContain('rapport.pdf');

    expect(text)
      .not.toContain('archive.zip');
  });
});
