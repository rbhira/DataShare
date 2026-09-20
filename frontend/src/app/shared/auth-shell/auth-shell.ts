import { Component, Input } from '@angular/core';
import { SiteHeader } from '../site-header/site-header';

@Component({
  selector: 'app-auth-shell',
  standalone: true,
  imports: [SiteHeader],
  templateUrl: './auth-shell.html',
  styleUrl: './auth-shell.css'
})
export class AuthShell {
  @Input() actionLabel = 'Se connecter';
  @Input() actionLink = '/login';
}
