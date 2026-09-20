import { Component, signal } from '@angular/core';
import { SeoService } from './core';

@Component({
  selector: 'app-root',
  standalone: false,
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('Nezeza Ijuru');

  constructor(private readonly seo: SeoService) {}
}
