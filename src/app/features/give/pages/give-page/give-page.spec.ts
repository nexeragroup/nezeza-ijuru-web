import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { GivePage } from './give-page';
import { SharedModule } from '../../../../shared/shared.module';

describe('GivePage', () => {
  let component: GivePage;
  let fixture: ComponentFixture<GivePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GivePage],
      imports: [SharedModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(GivePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
