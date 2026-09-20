import { Component } from '@angular/core';
import { ThemeService } from '../../core/services/theme.service';

interface NavigationItem {
  label: string;
  href: string;
}

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  readonly navigation: readonly NavigationItem[] = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Conferences', href: '/conferences' },
    { label: 'Programs', href: '/programs' },
    { label: 'Media', href: '/media' },
    { label: 'Contact', href: '/contact' },
  ];
  isOpen = false;

  constructor(readonly theme: ThemeService) {}

  toggleNavigation(): void {
    this.isOpen = !this.isOpen;
  }

  closeNavigation(): void {
    this.isOpen = false;
  }
}
