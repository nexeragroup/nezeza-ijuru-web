import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ProgramDetails } from './program-details';
import { SeoService } from '../../../../core';
import { ProgramsService } from '../../services/programs.service';

describe('ProgramDetails', () => {
  let component: ProgramDetails;
  let fixture: ComponentFixture<ProgramDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProgramDetails],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => null }) },
        },
        { provide: SeoService, useValue: { updatePage: () => undefined } },
        { provide: ProgramsService, useValue: { getAll: () => of([]) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgramDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
