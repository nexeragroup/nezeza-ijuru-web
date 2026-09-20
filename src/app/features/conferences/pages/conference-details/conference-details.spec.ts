import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ConferenceDetails } from './conference-details';
import { ConferencesService } from '../../services/conferences.service';
import { SeoService } from '../../../../core';

describe('ConferenceDetails', () => {
  let component: ConferenceDetails;
  let fixture: ComponentFixture<ConferenceDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConferenceDetails],
      providers: [
        {
          provide: ConferencesService,
          useValue: { getById: () => of(null), selectConference: () => undefined },
        },
        { provide: ActivatedRoute, useValue: { paramMap: of({ get: () => null }), snapshot: { paramMap: { get: () => null } } } },
        { provide: SeoService, useValue: { updatePage: () => undefined } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ConferenceDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
