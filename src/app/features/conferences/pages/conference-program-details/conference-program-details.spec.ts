import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ConferenceProgramDetails } from './conference-program-details';
import { ConferencesService } from '../../services/conferences.service';
import { SeoService } from '../../../../core';

describe('ConferenceProgramDetails', () => {
  let component: ConferenceProgramDetails;
  let fixture: ComponentFixture<ConferenceProgramDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConferenceProgramDetails],
      providers: [
        { provide: ConferencesService, useValue: { getConferenceProgram: () => of(null) } },
        { provide: ActivatedRoute, useValue: { paramMap: of({ get: () => null }), snapshot: { paramMap: { get: () => null } } } },
        { provide: SeoService, useValue: { updatePage: () => undefined } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ConferenceProgramDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
