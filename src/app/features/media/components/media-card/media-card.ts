import { Component, Input, signal } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { MediaItem } from '../../models/media.model';
import { MediaEmbedService } from '../../services/media-embed.service';

@Component({
  selector: 'app-media-card',
  standalone: false,
  styleUrl: './media-card.css',
  templateUrl: './media-card.html',
})
export class MediaCard {
  media?: MediaItem;
  embed: SafeResourceUrl | null = null;
  readonly videoLoaded = signal(false);

  constructor(private readonly embeds: MediaEmbedService) {}

  @Input({ required: true })
  set item(value: MediaItem) {
    this.media = value;
    this.embed = value.mediaType === 'VIDEO' ? this.embeds.videoEmbedUrl(value.url) : null;
    this.videoLoaded.set(false);
  }

  loadVideo(): void {
    this.videoLoaded.set(true);
  }

  get directVideo(): boolean {
    return (
      this.media?.sourceType === 'UPLOAD' ||
      /\.(mp4|webm|ogg)(?:[?#]|$)/i.test(this.media?.url ?? '')
    );
  }

  get typeLabel(): string {
    if (this.media?.mediaType === 'PODCAST') return 'Podcast';
    if (this.media?.mediaType === 'DOCUMENT') return 'Document';
    return this.media?.mediaType
      ? `${this.media.mediaType[0]}${this.media.mediaType.slice(1).toLowerCase()}`
      : 'Media';
  }

  get typeIcon(): string {
    switch (this.media?.mediaType) {
      case 'IMAGE':
        return 'fa-image';
      case 'VIDEO':
        return 'fa-circle-play';
      case 'AUDIO':
      case 'PODCAST':
        return 'fa-headphones';
      case 'DOCUMENT':
        return 'fa-file-lines';
      default:
        return 'fa-photo-film';
    }
  }
}
