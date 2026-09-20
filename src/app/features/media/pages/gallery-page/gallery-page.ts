import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MediaItem } from '../../models/media.model';
import { MediaService } from '../../services/media.service';

@Component({
  selector: 'app-gallery-page',
  standalone: false,
  styleUrl: './gallery-page.css',
  templateUrl: './gallery-page.html',
})
export class GalleryPage implements OnInit {
  readonly items = signal<MediaItem[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly album = signal('Gallery');

  constructor(
    private readonly route: ActivatedRoute,
    private readonly media: MediaService,
  ) {}

  ngOnInit(): void {
    this.album.set(this.route.snapshot.paramMap.get('albumSlug')?.replaceAll('-', ' ') || 'Gallery');
    this.media.getAll(1, 100, ['IMAGE']).subscribe({
      next: (result) => {
        this.items.set(result.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
