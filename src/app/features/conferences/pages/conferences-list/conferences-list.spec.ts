import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ConferencesList } from './conferences-list';
import { ConferencesService } from '../../services/conferences.service';

describe('ConferencesList', () => {
  let component: ConferencesList;
  let fixture: ComponentFixture<ConferencesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConferencesList],
      providers: [{ provide: ConferencesService, useValue: { getAll: () => of([]) } }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ConferencesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
