import { Component, computed, input, output } from '@angular/core';

import type { AlertItem } from './model/alert.model';

@Component({
  selector: 'app-alert',
  standalone: false,
  templateUrl: './alert.html',
  styleUrl: './alert.css',
})
export class Alert {
  readonly alert = input.required<AlertItem>();

  readonly dismiss = output<void>();

  readonly confirm = output<void>();

  readonly cancel = output<void>();

  readonly action = output<void>();

  readonly urgent = computed(
    () => this.alert().color === 'error' || this.alert().color === 'danger',
  );

  readonly iconClass = computed(() => {
    switch (this.alert().color) {
      case 'success':
        return 'fa-solid ' + 'fa-circle-check';

      case 'error':
      case 'danger':
        return 'fa-solid ' + 'fa-circle-xmark';

      case 'warning':
        return 'fa-solid ' + 'fa-triangle-exclamation';

      case 'confirmation':
        return 'fa-solid ' + 'fa-circle-question';

      case 'info':
      case 'primary':
      default:
        return 'fa-solid ' + 'fa-circle-info';
    }
  });
}
