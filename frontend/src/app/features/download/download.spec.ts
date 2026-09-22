import { ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Download } from './download';
import {
  FileDownloadInfo,
  FileDownloadService
} from '../../services/file-download.service';

describe('Download', () => {

  let getFileInfo: ReturnType<typeof vi.fn>;
  let downloadFile: ReturnType<typeof vi.fn>;
  let component: Download;

  function createComponent(token = 'valid-token'): Download {
    const route = {
      snapshot: {
        paramMap: convertToParamMap({
          token
        })
      }
    } as ActivatedRoute;

    const fileDownloadService = {
      getFileInfo,
      downloadFile
    } as unknown as FileDownloadService;

    const changeDetectorRef = {
      detectChanges: vi.fn()
    } as unknown as ChangeDetectorRef;

    return new Download(
      route,
      fileDownloadService,
      changeDetectorRef
    );
  }

  beforeEach(() => {
    getFileInfo = vi.fn();
    downloadFile = vi.fn();
    component = createComponent();
  });

  it('charge les métadonnées avec un token valide', () => {
    const fileInfo: FileDownloadInfo = {
      originalName: 'rapport.pdf',
      mimeType: 'application/pdf',
      size: 1500,
      expiresAt: '2026-09-25T12:00:00'
    };

    getFileInfo.mockReturnValue(
      of(fileInfo)
    );

    component.ngOnInit();

    expect(getFileInfo)
      .toHaveBeenCalledWith('valid-token');

    expect(component.fileInfo)
      .toEqual(fileInfo);

    expect(component.loading)
      .toBe(false);

    expect(component.errorMessage)
      .toBe('');
  });

  it('affiche une erreur pour un lien expiré', () => {
    getFileInfo.mockReturnValue(
      throwError(() => ({
        status: 410
      }))
    );

    component.ngOnInit();

    expect(component.fileInfo)
      .toBeNull();

    expect(component.loading)
      .toBe(false);

    expect(component.errorMessage)
      .toBe('Ce lien de téléchargement a expiré.');
  });

  it('affiche une erreur pour un lien introuvable', () => {
    getFileInfo.mockReturnValue(
      throwError(() => ({
        status: 404
      }))
    );

    component.ngOnInit();

    expect(component.loading)
      .toBe(false);

    expect(component.errorMessage)
      .toBe('Ce lien de téléchargement est introuvable.');
  });

  it('refuse une URL sans token', () => {
    component = createComponent('');

    component.ngOnInit();

    expect(getFileInfo)
      .not.toHaveBeenCalled();

    expect(component.loading)
      .toBe(false);

    expect(component.errorMessage)
      .toBe('Lien de téléchargement invalide.');
  });
});
