import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { HomePage } from './home-page';
import { ConferencesService } from '../../../conferences/services/conferences.service';
import { ProgramsService } from '../../../programs/services/programs.service';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomePage],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ConferencesService, useValue: { getAll: () => of([]) } },
        { provide: ProgramsService, useValue: { getAll: () => of([]) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
