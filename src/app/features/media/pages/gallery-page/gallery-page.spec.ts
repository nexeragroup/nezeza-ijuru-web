import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { GalleryPage } from './gallery-page';
import { MediaService } from '../../services/media.service';

describe('GalleryPage', () => {
  let component: GalleryPage;
  let fixture: ComponentFixture<GalleryPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GalleryPage],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: MediaService, useValue: { getAll: () => of({ data: [] }) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GalleryPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
