import {
  afterEveryRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { AlertService } from './alert.service';

@Component({
  selector: 'app-alert-container',
  standalone: false,
  templateUrl: './alert-container.html',
  styleUrl: './alert-container.css',
})
export class AlertContainer {
  readonly service = inject(AlertService);

  // ===========================================================================
  // Toast positions
  // ===========================================================================

  readonly positions = ['top-left', 'top-right', 'center'] as const;

  readonly toasts = computed(() =>
    this.positions.map((position) => ({
      position,

      items: this.service
        .alerts()
        .filter((item) => item.mode === 'toast' && item.position === position),
    })),
  );

  // ===========================================================================
  // Modal
  // ===========================================================================

  readonly modal = computed(() => this.service.alerts().find((item) => item.mode !== 'toast'));

  // ===========================================================================
  // Dialog
  // ===========================================================================

  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');

  private previousFocus: HTMLElement | null = null;

  private activeId: string | undefined;

  constructor() {
    afterEveryRender(() => {
      const dialog = this.dialog()?.nativeElement;

      const id = this.modal()?.id;

      /**
       * If the same modal is still active,
       * including while it is closing,
       * leave the native dialog open so the
       * exit animation can finish.
       */
      if (id === this.activeId) {
        return;
      }

      if (dialog?.open) {
        dialog.close();
      }

      this.restoreFocus();

      this.activeId = id;

      if (!dialog || !id) {
        return;
      }

      const activeElement = dialog.ownerDocument.activeElement;

      this.previousFocus = activeElement instanceof HTMLElement ? activeElement : null;

      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      }
    });

    inject(DestroyRef).onDestroy(() => {
      this.service.dismissAll();

      this.restoreFocus();
    });
  }

  // ===========================================================================
  // Close modal
  // ===========================================================================

  closeModal(confirmed = false): void {
    const item = this.modal();

    if (!item || item.closing) {
      return;
    }

    if (item.mode === 'confirmation') {
      if (confirmed) {
        this.service.confirmAction(item.id);
      } else {
        this.service.cancelConfirmation(item.id);
      }

      return;
    }

    this.service.dismiss(item.id);
  }

  // ===========================================================================
  // Modal action
  // ===========================================================================

  runModalAction(id: string): void {
    this.service.runAction(id);
  }

  // ===========================================================================
  // Native dialog cancel
  // ===========================================================================

  cancel(event: Event): void {
    event.preventDefault();

    const item = this.modal();

    if (!item) {
      return;
    }

    if (item.mode === 'confirmation' || item.dismissible) {
      this.closeModal();
    }
  }

  // ===========================================================================
  // Resume after keyboard focus leaves toast
  // ===========================================================================

  resume(event: FocusEvent, id: string): void {
    const target = event.currentTarget;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const relatedTarget = event.relatedTarget;

    const focusStillInside = relatedTarget instanceof Node && target.contains(relatedTarget);

    const pointerStillInside = target.matches(':hover');

    if (!focusStillInside && !pointerStillInside) {
      this.service.resume(id);
    }
  }

  // ===========================================================================
  // Resume after pointer leaves toast
  // ===========================================================================

  resumePointer(event: PointerEvent, id: string): void {
    const target = event.currentTarget;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const activeElement = target.ownerDocument.activeElement;

    const focusStillInside = activeElement instanceof Node && target.contains(activeElement);

    if (!focusStillInside) {
      this.service.resume(id);
    }
  }

  // ===========================================================================
  // Restore focus
  // ===========================================================================

  private restoreFocus(): void {
    if (this.previousFocus?.isConnected) {
      this.previousFocus.focus();
    }

    this.previousFocus = null;
  }
}
