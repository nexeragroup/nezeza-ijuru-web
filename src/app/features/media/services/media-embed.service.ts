import { Injectable } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class MediaEmbedService {
  constructor(private readonly sanitizer: DomSanitizer) {}

  videoEmbedUrl(value: string): SafeResourceUrl | null {
    const embedUrl = this.toVideoEmbedUrl(value);
    return embedUrl ? this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl) : null;
  }

  private toVideoEmbedUrl(value: string): string | null {
    try {
      const url = new URL(value);
      const host = url.hostname.replace(/^www\./, '').toLowerCase();
      if (host === 'youtu.be') {
        const id = url.pathname.split('/').filter(Boolean)[0];
        return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
      }
      if (host === 'youtube.com' || host === 'm.youtube.com') {
        const id = url.searchParams.get('v') ?? url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1];
        return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
      }
      if (host === 'vimeo.com' || host === 'player.vimeo.com') {
        const id = url.pathname.match(/(?:video\/)?(\d+)/)?.[1];
        return id ? `https://player.vimeo.com/video/${id}` : null;
      }
      return null;
    } catch {
      return null;
    }
  }
}
