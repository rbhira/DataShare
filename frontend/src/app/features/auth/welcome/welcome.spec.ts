import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Welcome } from './welcome';

describe('Welcome', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Welcome],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('affiche la question de partage', () => {
    const fixture = TestBed.createComponent(Welcome);
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('h1');

    expect(title?.textContent).toContain(
      'Tu veux partager un fichier ?'
    );
  });

  it('propose de se connecter pour partager un fichier', () => {
    const fixture = TestBed.createComponent(Welcome);
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('.upload-cta');

    expect(link?.getAttribute('href')).toBe('/login');
  });
});
