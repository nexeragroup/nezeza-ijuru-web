import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { LivestreamPage } from './livestream-page';
import { MediaService } from '../../services/media.service';
import { MediaEmbedService } from '../../services/media-embed.service';

describe('LivestreamPage', () => {
  let component: LivestreamPage;
  let fixture: ComponentFixture<LivestreamPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LivestreamPage],
      providers: [
        { provide: MediaService, useValue: { getLivestreams: () => of([]) } },
        { provide: MediaEmbedService, useValue: { videoEmbedUrl: () => null } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LivestreamPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
