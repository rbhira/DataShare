import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthShell } from '../../../shared/auth-shell/auth-shell';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [
    RouterLink,
    AuthShell
  ],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css'
})
export class Welcome {}
