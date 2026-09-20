import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from '../../../services/auth.service';
import { Register } from './register';

describe('Register', () => {
  const authServiceMock = {
    register: vi.fn()
  };

  beforeEach(async () => {
    authServiceMock.register.mockReset();

    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: authServiceMock
        }
      ]
    }).compileComponents();
  });

  it('refuse un mot de passe de moins de 8 caracteres', () => {
    const fixture = TestBed.createComponent(Register);
    const component = fixture.componentInstance;

    component.registerForm.setValue({
      email: 'user@datashare.test',
      password: 'court',
      confirmPassword: 'court'
    });

    component.submit();

    expect(component.registerForm.invalid).toBe(true);
    expect(authServiceMock.register).not.toHaveBeenCalled();
  });

  it('refuse deux mots de passe differents', () => {
    const fixture = TestBed.createComponent(Register);
    const component = fixture.componentInstance;

    component.registerForm.setValue({
      email: 'user@datashare.test',
      password: 'MotDePasse123',
      confirmPassword: 'MotDePasse456'
    });

    component.submit();

    expect(
      component.registerForm.hasError('passwordMismatch')
    ).toBe(true);
    expect(authServiceMock.register).not.toHaveBeenCalled();
  });

  it('cree un compte valide puis redirige vers login', () => {
    authServiceMock.register.mockReturnValue(
      of({
        id: 1,
        email: 'user@datashare.test',
        createdAt: '2026-09-19T20:00:00'
      })
    );

    const fixture = TestBed.createComponent(Register);
    const component = fixture.componentInstance;
    const router = TestBed.inject(Router);
    const navigateSpy = vi
      .spyOn(router, 'navigate')
      .mockResolvedValue(true);

    component.registerForm.setValue({
      email: 'user@datashare.test',
      password: 'MotDePasse123',
      confirmPassword: 'MotDePasse123'
    });

    component.submit();

    expect(authServiceMock.register).toHaveBeenCalledWith(
      'user@datashare.test',
      'MotDePasse123'
    );
    expect(navigateSpy).toHaveBeenCalledWith(
      ['/login'],
      {
        state: {
          accountCreated: true
        }
      }
    );
  });
});
