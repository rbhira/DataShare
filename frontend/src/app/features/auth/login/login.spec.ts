import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';

import { AuthService } from '../../../services/auth.service';
import { Login } from './login';

describe('Login', () => {
  const authServiceMock = {
    login: vi.fn()
  };

  beforeEach(async () => {
    authServiceMock.login.mockReset();

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: authServiceMock
        }
      ]
    }).compileComponents();
  });

  it('refuse un email invalide avant appel de l API', () => {
    const fixture = TestBed.createComponent(Login);
    const component = fixture.componentInstance;

    component.loginForm.setValue({
      email: 'email-invalide',
      password: 'MotDePasse123'
    });

    component.submit();

    expect(component.loginForm.invalid).toBe(true);
    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it('envoie les identifiants valides et redirige vers upload', () => {
    authServiceMock.login.mockReturnValue(
      of({ token: 'jwt-test' })
    );

    const fixture = TestBed.createComponent(Login);
    const component = fixture.componentInstance;
    const router = TestBed.inject(Router);
    const navigateSpy = vi
      .spyOn(router, 'navigate')
      .mockResolvedValue(true);

    component.loginForm.setValue({
      email: 'user@datashare.test',
      password: 'MotDePasse123'
    });

    component.submit();

    expect(authServiceMock.login).toHaveBeenCalledWith(
      'user@datashare.test',
      'MotDePasse123'
    );
    expect(navigateSpy).toHaveBeenCalledWith(['/upload']);
  });

  it('ignore une seconde soumission pendant une connexion en cours', () => {
    const pendingLogin = new Subject<{ token: string }>();

    authServiceMock.login.mockReturnValue(pendingLogin);

    const fixture = TestBed.createComponent(Login);
    const component = fixture.componentInstance;

    component.loginForm.setValue({
      email: 'user@datashare.test',
      password: 'MotDePasse123'
    });

    component.submit();
    component.submit();

    expect(authServiceMock.login).toHaveBeenCalledTimes(1);
    expect(component.loading).toBe(true);
  });

  it('affiche un message explicite en cas de perte reseau', () => {
    authServiceMock.login.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 0,
            statusText: 'Unknown Error'
          })
      )
    );

    const fixture = TestBed.createComponent(Login);
    const component = fixture.componentInstance;

    component.loginForm.setValue({
      email: 'user@datashare.test',
      password: 'MotDePasse123'
    });

    component.submit();

    expect(component.errorMessage).toBe(
      'Connexion réseau indisponible. Vérifiez votre connexion puis réessayez.'
    );
    expect(component.loading).toBe(false);
  });
});
