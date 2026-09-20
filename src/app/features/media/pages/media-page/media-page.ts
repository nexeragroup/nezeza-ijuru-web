import { Component } from '@angular/core';
import { OnDestroy, OnInit, computed, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { MediaPage as MediaResult } from '../../models/media.model';
import { MediaService, MediaType } from '../../services/media.service';

type MediaFilter = 'ALL' | 'IMAGE' | 'VIDEO' | 'RESOURCES';

@Component({
  selector: 'app-media-page',
  standalone: false,
  styleUrl: './media-page.css',
  templateUrl: './media-page.html',
})
export class MediaPage implements OnInit, OnDestroy {
  readonly result = signal<MediaResult | null>(null);
  readonly loading = signal(false);
  readonly error = signal(false);
  readonly activeFilter = signal<MediaFilter>('ALL');
  readonly filterOptions: readonly { id: MediaFilter; label: string }[] = [
    { id: 'ALL', label: 'All media' },
    { id: 'IMAGE', label: 'Images' },
    { id: 'VIDEO', label: 'Videos' },
    { id: 'RESOURCES', label: 'Audio & resources' },
  ];
  readonly skeletonCards = [1, 2, 3, 4, 5, 6];
  readonly filteredItems = computed(() => this.result()?.data ?? []);
  private request?: Subscription;
  private requestedPage = 1;

  constructor(private readonly media: MediaService) {}

  ngOnInit(): void {
    this.load(1);
  }

  ngOnDestroy(): void {
    this.request?.unsubscribe();
  }

  setFilter(filter: MediaFilter): void {
    this.activeFilter.set(filter);
    this.load(1);
  }

  load(page = this.requestedPage): void {
    if (page < 1) return;
    this.request?.unsubscribe();
    this.requestedPage = page;
    this.loading.set(true);
    this.error.set(false);
    this.request = this.media.getAll(page, 12, this.mediaTypesFor(this.activeFilter())).subscribe({
      next: (result) => {
        if (result.totalPages > 0 && result.page > result.totalPages) {
          this.load(result.totalPages);
          return;
        }
        this.result.set(result);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  private mediaTypesFor(filter: MediaFilter): readonly MediaType[] | undefined {
    if (filter === 'ALL') return undefined;
    if (filter === 'IMAGE') return ['IMAGE'];
    if (filter === 'VIDEO') return ['VIDEO'];
    return ['AUDIO', 'PODCAST', 'DOCUMENT', 'OTHER'];
  }
}
