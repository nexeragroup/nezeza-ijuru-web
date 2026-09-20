import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { STORAGE_CONFIG } from '../../config/storage.config';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      imports: [RouterTestingModule],
      providers: [{ provide: STORAGE_CONFIG, useValue: { namespace: 'test', version: 1, defaultArea: 'local' } }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
  });

  it('should create', () => expect(fixture.componentInstance).toBeTruthy());
});
