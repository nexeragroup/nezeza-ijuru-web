import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { PublicLayoutComponent } from './public-layout.component';

describe('PublicLayoutComponent', () => {
  let fixture: ComponentFixture<PublicLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PublicLayoutComponent],
      imports: [RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(PublicLayoutComponent);
    fixture.detectChanges();
  });

  it('should create', () => expect(fixture.componentInstance).toBeTruthy());
});
