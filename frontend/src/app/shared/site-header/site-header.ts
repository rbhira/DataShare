import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './site-header.html',
  styleUrl: './site-header.css'
})
export class SiteHeader {
  @Input() actionLabel = 'Se connecter';
  @Input() actionLink = '/login';
}
