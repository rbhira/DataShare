import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../services/auth.service';
import {
  FileHistoryItem,
  FileHistoryService
} from '../../services/file-history.service';
import { MyFiles } from './my-files';

describe('MyFiles', () => {

  let authServiceMock: {
    getToken: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };

  let fileHistoryServiceMock: {
    getHistory: ReturnType<typeof vi.fn>;
    deleteFile: ReturnType<typeof vi.fn>;
  };

  let routerMock: {
    navigate: ReturnType<typeof vi.fn>;
  };

  let changeDetectorRefMock: {
    detectChanges: ReturnType<typeof vi.fn>;
  };

  const activeFile: FileHistoryItem = {
    id: 1,
    originalName: 'rapport.pdf',
    size: 2500,
    uploadedAt: '2026-09-22T10:00:00',
    expiresAt: '2026-09-24T10:00:00',
    downloadToken: 'token-active',
    expired: false
  };

  const expiredFile: FileHistoryItem = {
    id: 2,
    originalName: 'archive.zip',
    size: 5000,
    uploadedAt: '2026-09-10T10:00:00',
    expiresAt: '2026-09-17T10:00:00',
    downloadToken: 'token-expired',
    expired: true
  };

  beforeEach(() => {
    authServiceMock = {
      getToken: vi.fn(),
      logout: vi.fn()
    };

    fileHistoryServiceMock = {
      getHistory: vi.fn(),
      deleteFile: vi.fn()
    };

    routerMock = {
      navigate: vi.fn()
    };

    changeDetectorRefMock = {
      detectChanges: vi.fn()
    };
  });

  function createComponent(): MyFiles {
    return new MyFiles(
      authServiceMock as unknown as AuthService,
      fileHistoryServiceMock as unknown as FileHistoryService,
      routerMock as unknown as Router,
      changeDetectorRefMock as unknown as ChangeDetectorRef
    );
  }

  it('redirige vers login lorsqu aucun token n est disponible', () => {
    authServiceMock.getToken.mockReturnValue(null);

    createComponent();

    expect(fileHistoryServiceMock.getHistory)
      .not.toHaveBeenCalled();

    expect(routerMock.navigate)
      .toHaveBeenCalledWith(['/login']);
  });

  it('charge l historique de l utilisateur connecte', () => {
    authServiceMock.getToken.mockReturnValue('jwt-test');

    fileHistoryServiceMock.getHistory.mockReturnValue(
      of([activeFile, expiredFile])
    );

    const component = createComponent();

    expect(fileHistoryServiceMock.getHistory)
      .toHaveBeenCalledWith('jwt-test');

    expect(component.files)
      .toEqual([activeFile, expiredFile]);

    expect(component.loading)
      .toBe(false);

    expect(component.errorMessage)
      .toBe('');
  });

  it('deconnecte et redirige vers login lorsque le token est refuse', () => {
    authServiceMock.getToken.mockReturnValue('jwt-expired');

    fileHistoryServiceMock.getHistory.mockReturnValue(
      throwError(() => ({ status: 401 }))
    );

    createComponent();

    expect(authServiceMock.logout)
      .toHaveBeenCalledTimes(1);

    expect(routerMock.navigate)
      .toHaveBeenCalledWith(['/login']);
  });

  it('permet d acceder a un fichier actif', () => {
    authServiceMock.getToken.mockReturnValue('jwt-test');

    fileHistoryServiceMock.getHistory.mockReturnValue(
      of([])
    );

    const component = createComponent();

    component.accessFile(activeFile);

    expect(routerMock.navigate)
      .toHaveBeenCalledWith([
        '/download',
        'token-active'
      ]);
  });

  it('interdit l acces a un fichier expire', () => {
    authServiceMock.getToken.mockReturnValue('jwt-test');

    fileHistoryServiceMock.getHistory.mockReturnValue(
      of([])
    );

    const component = createComponent();

    component.accessFile(expiredFile);

    expect(routerMock.navigate)
      .not.toHaveBeenCalledWith([
        '/download',
        'token-expired'
    ]);
  });

  it('affiche les fichiers actifs par defaut', () => {
    authServiceMock.getToken.mockReturnValue('jwt-test');

    fileHistoryServiceMock.getHistory.mockReturnValue(
      of([activeFile, expiredFile])
    );

    const component = createComponent();

    expect(component.selectedFilter)
      .toBe('active');

    expect(component.filteredFiles)
      .toEqual([activeFile]);
  });

  it('annule la suppression lorsque l utilisateur refuse la confirmation', () => {
    authServiceMock.getToken.mockReturnValue('jwt-test');

    fileHistoryServiceMock.getHistory.mockReturnValue(
      of([activeFile])
    );

    const component = createComponent();

    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockReturnValue(false);

    component.deleteFile(activeFile);

    expect(confirmSpy)
      .toHaveBeenCalledWith(
        'Supprimer définitivement « rapport.pdf » ?'
      );

    expect(fileHistoryServiceMock.deleteFile)
      .not.toHaveBeenCalled();

    expect(component.files)
      .toEqual([activeFile]);

    confirmSpy.mockRestore();
  });

  it('supprime un fichier actif apres confirmation', () => {
    authServiceMock.getToken.mockReturnValue('jwt-test');

    fileHistoryServiceMock.getHistory.mockReturnValue(
      of([activeFile, expiredFile])
    );

    fileHistoryServiceMock.deleteFile.mockReturnValue(
      of(void 0)
    );

    const component = createComponent();

    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockReturnValue(true);

    component.deleteFile(activeFile);

    expect(confirmSpy)
      .toHaveBeenCalledWith(
        'Supprimer définitivement « rapport.pdf » ?'
      );

    expect(fileHistoryServiceMock.deleteFile)
      .toHaveBeenCalledTimes(1);

    expect(fileHistoryServiceMock.deleteFile)
      .toHaveBeenCalledWith(
        1,
        'jwt-test'
      );

    expect(component.files)
      .toEqual([expiredFile]);

    expect(component.isDeleting(1))
      .toBe(false);

    confirmSpy.mockRestore();
  });

  it('refuse la suppression d un fichier expire', () => {
    authServiceMock.getToken.mockReturnValue('jwt-test');

    fileHistoryServiceMock.getHistory.mockReturnValue(
      of([expiredFile])
    );

    const component = createComponent();

    const confirmSpy = vi.spyOn(window, 'confirm');

    component.deleteFile(expiredFile);

    expect(confirmSpy)
      .not.toHaveBeenCalled();

    expect(fileHistoryServiceMock.deleteFile)
      .not.toHaveBeenCalled();

    expect(component.files)
      .toEqual([expiredFile]);

    confirmSpy.mockRestore();
  });

  it('ignore un second clic pendant une suppression en cours', () => {
    authServiceMock.getToken.mockReturnValue('jwt-test');

    fileHistoryServiceMock.getHistory.mockReturnValue(
      of([activeFile])
    );

    let completeDelete!: () => void;

    fileHistoryServiceMock.deleteFile.mockReturnValue(
      new Observable<void>((subscriber) => {
        completeDelete = () => {
          subscriber.next();
          subscriber.complete();
        };
      })
    );

    const component = createComponent();

    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockReturnValue(true);

    component.deleteFile(activeFile);
    component.deleteFile(activeFile);

    expect(fileHistoryServiceMock.deleteFile)
      .toHaveBeenCalledTimes(1);

    expect(component.isDeleting(1))
      .toBe(true);

    completeDelete();

    expect(component.isDeleting(1))
      .toBe(false);

    confirmSpy.mockRestore();
  });

  it('deconnecte l utilisateur si la suppression renvoie 401', () => {
    authServiceMock.getToken.mockReturnValue('jwt-test');

    fileHistoryServiceMock.getHistory.mockReturnValue(
      of([activeFile])
    );

    fileHistoryServiceMock.deleteFile.mockReturnValue(
      throwError(() => ({
        status: 401
      }))
    );

    const component = createComponent();

    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockReturnValue(true);

    component.deleteFile(activeFile);

    expect(authServiceMock.logout)
      .toHaveBeenCalledTimes(1);

    expect(routerMock.navigate)
      .toHaveBeenCalledWith(['/login']);

    expect(component.isDeleting(1))
      .toBe(false);

    confirmSpy.mockRestore();
  });

  it('affiche une erreur reseau si la suppression echoue sans connexion', () => {
    authServiceMock.getToken.mockReturnValue('jwt-test');

    fileHistoryServiceMock.getHistory.mockReturnValue(
      of([activeFile])
    );

    fileHistoryServiceMock.deleteFile.mockReturnValue(
      throwError(() => ({
        status: 0
      }))
    );

    const component = createComponent();

    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockReturnValue(true);

    component.deleteFile(activeFile);

    expect(component.errorMessage)
      .toBe(
        'Connexion réseau indisponible. Vérifiez votre connexion puis réessayez.'
      );

    expect(component.files)
      .toEqual([activeFile]);

    expect(component.isDeleting(1))
      .toBe(false);

    confirmSpy.mockRestore();
  });

  it('affiche un message si le fichier n existe plus', () => {
    authServiceMock.getToken.mockReturnValue('jwt-test');

    fileHistoryServiceMock.getHistory.mockReturnValue(
      of([activeFile])
    );

    fileHistoryServiceMock.deleteFile.mockReturnValue(
      throwError(() => ({
        status: 404
      }))
    );

    const component = createComponent();

    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockReturnValue(true);

    component.deleteFile(activeFile);

    expect(component.errorMessage)
      .toBe(
        'Ce fichier n’existe plus ou a déjà été supprimé.'
      );

    expect(component.files)
      .toEqual([activeFile]);

    expect(component.isDeleting(1))
      .toBe(false);

    confirmSpy.mockRestore();
  });

  it('filtre les fichiers actifs et expires', () => {
    authServiceMock.getToken.mockReturnValue('jwt-test');

    fileHistoryServiceMock.getHistory.mockReturnValue(
      of([activeFile, expiredFile])
    );

    const component = createComponent();

    component.selectFilter('active');

    expect(component.filteredFiles)
      .toEqual([activeFile]);

    component.selectFilter('expired');

    expect(component.filteredFiles)
      .toEqual([expiredFile]);

    component.selectFilter('all');

    expect(component.filteredFiles)
      .toEqual([activeFile, expiredFile]);
  });
});
