import {
  booleanAttribute,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  forwardRef,
  inject,
  Injector,
  input,
  OnChanges,
  OnInit,
  output,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  NgControl,
  ValidationErrors,
  Validator,
  Validators,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'numeric'
  | 'tel'
  | 'url'
  | 'search'
  | 'date'
  | 'datetime-local'
  | 'time'
  | 'month'
  | 'week'
  | 'checkbox'
  | 'radio'
  | 'textarea'
  | 'select';
export type InputValue = string | number | boolean | null;
export interface InputOption {
  label: string;
  value: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-input',
  standalone: false,
  templateUrl: './input.html',
  styleUrl: './input.css',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Input), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => Input), multi: true },
  ],
})
export class Input implements ControlValueAccessor, Validator, OnInit, OnChanges {
  /** Supply a unique, stable ID; also keeps label associations stable during SSR. */
  readonly inputId = input.required<string>();
  readonly type = input<InputType>('text');
  readonly label = input('');
  readonly ariaLabel = input('');
  readonly name = input('');
  readonly placeholder = input('');
  readonly hint = input('');
  readonly error = input('');
  readonly errorMessages = input<Readonly<Record<string, string>>>({});
  readonly showErrors = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly min = input<number | null>(null);
  readonly max = input<number | null>(null);
  readonly minLength = input<number | null>(null);
  readonly maxLength = input<number | null>(null);
  readonly pattern = input<string | RegExp | null>(null);
  readonly step = input<number | 'any'>('any');
  readonly autocomplete = input('off');
  readonly rows = input(4);
  readonly options = input<readonly InputOption[]>([]);
  /** Font icon classes, or project custom markup with inputPrefix / inputSuffix. */
  readonly prefixIcon = input('');
  readonly suffixIcon = input('');
  readonly valueChange = output<InputValue>();
  readonly focused = output<FocusEvent>();
  readonly blurred = output<FocusEvent>();
  readonly currentValue = signal<InputValue>(null);
  readonly passwordVisible = signal(false);
  readonly touched = signal(false);
  private readonly formDisabled = signal(false);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private ngControl: NgControl | null = null;
  private onChange: (value: InputValue) => void = () => {};
  private onTouched: () => void = () => {};
  private validatorChanged: () => void = () => {};

  ngOnChanges(): void {
    this.validatorChanged();
  }

  ngOnInit(): void {
    this.ngControl = this.injector.get(NgControl, null, { self: true });
    this.ngControl?.control?.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.cdr.markForCheck());
  }

  get isDisabled(): boolean {
    return this.disabled() || this.formDisabled();
  }
  get nativeType(): string {
    if (this.type() === 'numeric') return 'text';
    return this.type() === 'password' && this.passwordVisible() ? 'text' : this.type();
  }
  get displayedValue(): string {
    return this.currentValue() === null ? '' : String(this.currentValue());
  }
  get controlName(): string {
    return this.name() || this.inputId();
  }
  get message(): string {
    if (this.isDisabled) return '';
    if (this.error()) return this.error();
    const control = this.ngControl?.control;
    if (!(this.showErrors() || control?.touched || control?.dirty || (!control && this.touched())))
      return '';
    const errors = control?.errors;
    if (!errors) return '';
    const key = Object.keys(errors)[0];
    if (this.errorMessages()[key]) return this.errorMessages()[key];
    switch (key) {
      case 'required':
        return this.type() === 'checkbox' ? 'This must be checked.' : 'This field is required.';
      case 'email':
        return 'Enter a valid email address.';
      case 'min':
        return `Enter a value of at least ${errors[key].min}.`;
      case 'max':
        return `Enter a value no greater than ${errors[key].max}.`;
      case 'minlength':
        return `Enter at least ${errors[key].requiredLength} characters.`;
      case 'maxlength':
        return `Enter no more than ${errors[key].requiredLength} characters.`;
      case 'numeric':
        return 'Use digits only.';
      case 'pattern':
        return 'Enter a value in the requested format.';
      default:
        return 'Please check this value.';
    }
  }
  get describedBy(): string | null {
    return (
      [this.hint() ? `${this.inputId()}-hint` : '', this.message ? `${this.inputId()}-error` : '']
        .filter(Boolean)
        .join(' ') || null
    );
  }

  writeValue(value: InputValue | undefined): void {
    this.currentValue.set(value ?? null);
  }
  registerOnChange(fn: (value: InputValue) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(value: boolean): void {
    this.formDisabled.set(value);
  }
  registerOnValidatorChange(fn: () => void): void {
    this.validatorChanged = fn;
  }

  validate(control: AbstractControl): ValidationErrors | null {
    const validators = [];
    if (this.required())
      validators.push(this.type() === 'checkbox' ? Validators.requiredTrue : Validators.required);
    if (this.type() === 'email') validators.push(Validators.email);
    if (this.type() === 'numeric')
      validators.push((c: AbstractControl) =>
        c.value === null || c.value === '' || /^\d+$/.test(String(c.value))
          ? null
          : { numeric: true },
      );
    if (this.min() !== null) validators.push(Validators.min(this.min()!));
    if (this.max() !== null) validators.push(Validators.max(this.max()!));
    if (this.minLength() !== null) validators.push(Validators.minLength(this.minLength()!));
    if (this.maxLength() !== null) validators.push(Validators.maxLength(this.maxLength()!));
    if (this.pattern() !== null) {
      const pattern = this.pattern()!;
      validators.push(
        Validators.pattern(
          pattern instanceof RegExp
            ? new RegExp(pattern.source, pattern.flags.replace(/[gy]/g, ''))
            : pattern,
        ),
      );
    }
    return Validators.compose(validators)?.(control) ?? null;
  }

  update(event: Event): void {
    const element = event.target as HTMLInputElement;
    const value =
      this.type() === 'checkbox'
        ? element.checked
        : this.type() === 'number'
          ? Number.isNaN(element.valueAsNumber)
            ? null
            : element.valueAsNumber
          : element.value;
    this.commit(value);
  }
  commit(value: InputValue): void {
    if (this.isDisabled || this.readonly()) return;
    this.currentValue.set(value);
    this.onChange(value);
    this.valueChange.emit(value);
  }
  onBlur(event: FocusEvent): void {
    const host = event.currentTarget as HTMLElement;
    if (event.relatedTarget instanceof Node && host.contains(event.relatedTarget)) return;
    this.touched.set(true);
    this.onTouched();
    this.blurred.emit(event);
  }
}
