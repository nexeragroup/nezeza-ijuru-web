import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export type ButtonColor =
  | 'primary'
  | 'neutral'
  | 'blue'
  | 'green'
  | 'red'
  | 'yellow'
  | 'orange'
  | 'purple'
  | 'teal'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export type ButtonAppearance = 'solid' | 'soft' | 'outline' | 'ghost' | 'link';

export type ButtonSize = 'small' | 'medium' | 'large';

export type ButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'app-button',
  standalone: false,
  styleUrl: './button.css',
  templateUrl: './button.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Button {
  @Input()
  variant: 'primary' | 'secondary' | 'light' | 'dark' | 'outline' = 'primary';

  @Input()
  prefixIcon?: string;

  @Input()
  suffixIcon?: string;

  @Input()
  href?: string;

  @Input()
  color: ButtonColor = 'primary';

  @Input()
  appearance: ButtonAppearance = 'solid';

  @Input()
  size: ButtonSize = 'medium';

  @Input()
  type: ButtonType = 'button';

  @Input()
  disabled = false;

  @Input()
  loading = false;

  @Input()
  fullWidth = false;

  @Input()
  iconOnly = false;

  @Input()
  ariaLabel?: string;

  @Input()
  name?: string;

  @Input()
  value?: string;

  @Input()
  loadingLabel = 'Loading';

  @Output()
  readonly buttonClick = new EventEmitter<MouseEvent>();

  get interactionDisabled(): boolean {
    return this.disabled || this.loading;
  }

  handleClick(event: MouseEvent): void {
    if (this.interactionDisabled) {
      event.preventDefault();
      event.stopPropagation();

      return;
    }

    if (this.href && typeof window !== 'undefined') {
      window.location.assign(this.href);
    }

    this.buttonClick.emit(event);
  }
}
