import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type BadgeColor =
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
export type BadgeAppearance = 'solid' | 'soft' | 'outline';
export type BadgeSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-badge',
  standalone: false,
  styleUrl: './badge.css',
  templateUrl: './badge.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Badge {
  @Input()
  color: BadgeColor = 'neutral';

  @Input()
  appearance: BadgeAppearance = 'soft';

  @Input()
  size: BadgeSize = 'medium';

  @Input()
  pill = true;

  @Input()
  dot = false;

  @Input()
  ariaLabel?: string;
}
