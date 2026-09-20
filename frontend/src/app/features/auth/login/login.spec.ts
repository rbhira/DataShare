import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';

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
});
