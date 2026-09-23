import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { AuthService } from '../../services/auth.service';
import { FileUploadService } from '../../services/file-upload.service';
import { Upload } from './upload';

describe('Upload template', () => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Upload],
      providers: [
        provideRouter([]),
        {
          provide: FileUploadService,
          useValue: {
            upload: vi.fn()
          }
        },
        {
          provide: AuthService,
          useValue: {
            getToken: vi.fn()
          }
        }
      ]
    }).compileComponents();
  });

  it('affiche les controles principaux de televersement', () => {
    const fixture =
      TestBed.createComponent(Upload);

    fixture.detectChanges();

    const element =
      fixture.nativeElement as HTMLElement;

    expect(
      element.querySelector('input[type="file"]')
    ).not.toBeNull();

    expect(
      element.querySelector('select')
    ).not.toBeNull();
  });
});
