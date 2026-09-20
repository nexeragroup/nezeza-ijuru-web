import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { MediaPage } from './media-page';
import { MediaService } from '../../services/media.service';

describe('MediaPage', () => {
  let component: MediaPage;
  let fixture: ComponentFixture<MediaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MediaPage],
      providers: [
        {
          provide: MediaService,
          useValue: { getAll: () => of({ data: [], total: 0, page: 1, limit: 12, totalPages: 0 }) },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(MediaPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
