import { ChangeDetectorRef } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../services/auth.service';
import { FileUploadService } from '../../services/file-upload.service';
import { Upload } from './upload';

describe('Upload', () => {

  let component: Upload;

  beforeEach(() => {
    const fileUploadService = {
      upload: vi.fn()
    } as unknown as FileUploadService;

    const authService = {
      getToken: vi.fn()
    } as unknown as AuthService;

    const changeDetectorRef = {
      detectChanges: vi.fn()
    } as unknown as ChangeDetectorRef;

    component = new Upload(
      fileUploadService,
      authService,
      changeDetectorRef
    );
  });

  function selectFile(
    name: string,
    size: number
  ): { event: Event; input: { files: File[]; value: string } } {

    const file = {
      name,
      size
    } as File;

    const input = {
      files: [file],
      value: 'selected'
    };

    return {
      event: {
        target: input
      } as unknown as Event,
      input
    };
  }

  it('accepte un fichier de 1 Go exactement', () => {
    const { event } =
      selectFile('document.pdf', 1_000_000_000);

    component.onFileSelected(event);

    expect(component.selectedFile?.name)
      .toBe('document.pdf');

    expect(component.errorMessage)
      .toBe('');
  });

  it('refuse un fichier supérieur à 1 Go', () => {
    const { event, input } =
      selectFile('document.pdf', 1_000_000_001);

    component.onFileSelected(event);

    expect(component.selectedFile)
      .toBeNull();

    expect(component.errorMessage)
      .toBe('La taille des fichiers est limitée à 1 Go.');

    expect(input.value)
      .toBe('');
  });

  it('refuse une extension interdite sans tenir compte des majuscules', () => {
    const { event, input } =
      selectFile('virus.EXE', 100);

    component.onFileSelected(event);

    expect(component.selectedFile)
      .toBeNull();

    expect(component.errorMessage)
      .toBe('Ce type de fichier est interdit.');

    expect(input.value)
      .toBe('');
  });

  it('accepte une extension autorisée', () => {
    const { event } =
      selectFile('rapport.pdf', 100);

    component.onFileSelected(event);

    expect(component.selectedFile?.name)
      .toBe('rapport.pdf');

    expect(component.errorMessage)
      .toBe('');
  });
});
