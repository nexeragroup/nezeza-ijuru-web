import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputType, InputValue } from './input';
import { SharedModule } from '../../shared.module';

@Component({
  imports: [SharedModule, ReactiveFormsModule],
  template: `<app-input inputId="test-field" label="Test field" [type]="type" [formControl]="control"
    [required]="required()" [min]="min()" [options]="options" />`,
})
class TestHost {
  readonly control = new FormControl<InputValue>('');
  type: InputType = 'text';
  required = signal(false);
  min = signal<number | null>(null);
  options = [{ label: 'First', value: 'first' }, { label: 'Second', value: 'second' }];
}

@Component({
  imports: [SharedModule, FormsModule],
  template: `<app-input inputId="model-field" label="Email" type="email" [(ngModel)]="value" required
    prefixIcon="test-prefix" suffixIcon="test-suffix"><span inputPrefix aria-hidden="true">@</span></app-input>`,
})
class ModelHost { value = signal(''); }

describe('Input', () => {
  it('supports ngModel, projected icons, and email validation', async () => {
    TestBed.configureTestingModule({ imports: [ModelHost] });
    const fixture = TestBed.createComponent(ModelHost);
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = 'bad'; input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('bad');
    expect(fixture.nativeElement.querySelector('.field__error').textContent).toContain('email');
    expect(fixture.nativeElement.querySelector('[inputPrefix]').textContent).toBe('@');
    expect(fixture.nativeElement.querySelector('.test-prefix').getAttribute('aria-hidden')).toBe('true');
    fixture.componentInstance.value.set('person@example.com'); await fixture.whenStable();
    expect(input.value).toBe('person@example.com');
    expect(fixture.nativeElement.querySelector('.field__error')).toBeNull();
  });
  const setup = async (type: InputType = 'text') => {
    TestBed.configureTestingModule({ imports: [TestHost] });
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.type = type;
    await fixture.whenStable();
    return fixture;
  };

  it('propagates user edits, external writes, blur and disabled state', async () => {
    const fixture = await setup();
    const control = fixture.componentInstance.control;
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = 'Changed'; input.dispatchEvent(new Event('input'));
    expect(control.value).toBe('Changed');
    control.setValue('External'); await fixture.whenStable();
    expect(input.value).toBe('External');
    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    expect(control.touched).toBe(true);
    control.disable(); await fixture.whenStable();
    expect(input.disabled).toBe(true);
    control.enable(); control.reset(); await fixture.whenStable();
    expect(input.value).toBe('');
  });

  it('returns numbers and null for a cleared number field', async () => {
    const fixture = await setup('number');
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = '12.5'; input.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.control.value).toBe(12.5);
    input.value = ''; input.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.control.value).toBeNull();
  });

  it('preserves leading zeros and validates pasted numeric strings', async () => {
    const fixture = await setup('numeric');
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = '00123'; input.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.control.value).toBe('00123');
    input.value = '12a'; input.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.control.hasError('numeric')).toBe(true);
  });

  it('toggles password visibility without changing the value', async () => {
    const fixture = await setup('password');
    fixture.componentInstance.control.setValue('secret'); await fixture.whenStable();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.click(); await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('input').type).toBe('text');
    expect(button.getAttribute('aria-label')).toBe('Hide password');
    expect(fixture.componentInstance.control.value).toBe('secret');
    button.click(); await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('input').type).toBe('password');
  });

  it('merges email and caller validators and associates the error with the control', async () => {
    const fixture = await setup('email');
    const control = fixture.componentInstance.control;
    control.addValidators(Validators.required); control.updateValueAndValidity(); control.markAsTouched();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.field__error').textContent).toContain('required');
    control.setValue('bad-email'); await fixture.whenStable();
    expect(control.hasError('email')).toBe(true);
    expect(fixture.nativeElement.querySelector('input').getAttribute('aria-describedby')).toContain('test-field-error');
    control.setValue('user@example.com'); await fixture.whenStable();
    expect(control.valid).toBe(true);
    expect(fixture.nativeElement.querySelector('.field__error')).toBeNull();
  });

  it('revalidates when constraints change', async () => {
    const fixture = await setup('number');
    fixture.componentInstance.control.setValue(2);
    fixture.componentInstance.min.set(5); await fixture.whenStable();
    expect(fixture.componentInstance.control.hasError('min')).toBe(true);
    fixture.componentInstance.min.set(1); await fixture.whenStable();
    expect(fixture.componentInstance.control.valid).toBe(true);
  });

  it('uses boolean values and requiredTrue validation for checkbox', async () => {
    const fixture = await setup('checkbox');
    fixture.componentInstance.required.set(true); await fixture.whenStable();
    expect(fixture.componentInstance.control.invalid).toBe(true);
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.checked = true; input.dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.control.value).toBe(true);
    expect(fixture.componentInstance.control.valid).toBe(true);
  });

  it('treats radio options as one form control and synchronizes external selection', async () => {
    const fixture = await setup('radio');
    const inputs: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll('input');
    inputs[0].checked = true; inputs[0].dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.control.value).toBe('first');
    fixture.componentInstance.control.setValue('second'); await fixture.whenStable();
    expect(inputs[0].checked).toBe(false); expect(inputs[1].checked).toBe(true);
    expect(inputs[0].name).toBe(inputs[1].name);
  });

  it('supports select changes and resetting its selection', async () => {
    const fixture = await setup('select');
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');
    fixture.componentInstance.control.setValue('second'); await fixture.whenStable();
    expect(select.value).toBe('second');
    select.value = 'first'; select.dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.control.value).toBe('first');
    fixture.componentInstance.control.reset(); await fixture.whenStable();
    expect(select.value).toBe('');
  });

  it('supports multiline textarea values and external validation', async () => {
    const fixture = await setup('textarea');
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    fixture.componentInstance.control.addValidators(Validators.maxLength(5));
    textarea.value = 'First\nSecond'; textarea.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fixture.componentInstance.control.value).toBe('First\nSecond');
    expect(fixture.componentInstance.control.hasError('maxlength')).toBe(true);
    expect(fixture.nativeElement.querySelector('.field__error').textContent).toContain('5');
  });

  it('does not mark the control touched when focus moves to the password toggle', async () => {
    const fixture = await setup('password');
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const toggle: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: toggle }));
    expect(fixture.componentInstance.control.touched).toBe(false);
    toggle.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    expect(fixture.componentInstance.control.touched).toBe(true);
  });
});
