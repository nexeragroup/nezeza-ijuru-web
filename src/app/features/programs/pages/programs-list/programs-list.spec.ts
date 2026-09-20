import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProgramsList } from './programs-list';
import { ProgramsService } from '../../services/programs.service';

describe('ProgramsList', () => {
  let component: ProgramsList;
  let fixture: ComponentFixture<ProgramsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProgramsList],
      providers: [{ provide: ProgramsService, useValue: { getAll: () => of([]) } }],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgramsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
