import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type LoaderSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-loader',
  standalone: false,
  styleUrl: './loader.css',
  templateUrl: './loader.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Loader {
  @Input()
  size: LoaderSize = 'medium';

  /**
   * Accessible text announced by screen readers.
   */
  @Input()
  label = 'Loading';

  /**
   * Allows the loader to inherit text color from
   * the parent, or use the theme primary color.
   */
  @Input()
  primary = false;
}
