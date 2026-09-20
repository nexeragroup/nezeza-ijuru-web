export type AlertColor =
  'primary' | 'success' | 'warning' | 'danger' | 'error' | 'info' | 'confirmation';

export type AlertAppearance = 'solid' | 'soft' | 'outline';

export type AlertPosition = 'top-left' | 'top-right' | 'center';

export type AlertMode = 'toast' | 'popup' | 'confirmation';

export interface AlertAction {
  label: string;

  value?: unknown;

  handler?: () => void;
}

export interface AlertOptions {
  title?: string;

  message: string;

  color?: AlertColor;

  appearance?: AlertAppearance;

  position?: AlertPosition;

  mode?: AlertMode;

  /**
   * Duration in milliseconds.
   *
   * 0 means the alert stays visible until
   * manually dismissed.
   */
  duration?: number;

  dismissible?: boolean;

  action?: AlertAction;
}

export interface ConfirmationOptions {
  title?: string;

  message: string;

  confirmText?: string;

  cancelText?: string;

  color?: AlertColor;
}

export interface AlertItem {
  id: string;

  title?: string;

  message: string;

  color: AlertColor;

  appearance: AlertAppearance;

  position: AlertPosition;

  mode: AlertMode;

  duration: number;

  dismissible: boolean;

  action?: AlertAction;

  confirmText?: string;

  cancelText?: string;

  createdAt: number;

  /**
   * Keeps the alert in the DOM temporarily
   * while its exit animation runs.
   */
  closing: boolean;
}
