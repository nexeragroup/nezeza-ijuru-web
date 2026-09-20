import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { MediaPage } from '../models/media.model';

export type MediaType = MediaPage['data'][number]['mediaType'];

export interface Livestream {
  sessionId: string;
  title: string;
  videoId: string;
  url: string;
  startAt: string;
  state: 'LIVE' | 'UPCOMING' | 'ENDED' | 'VIDEO' | 'UNAVAILABLE' | 'UNKNOWN';
  embeddable: boolean | null;
  scheduledStartAt?: string;
  checkedAt: string;
}

@Injectable({ providedIn: 'root' })
export class MediaService {
  constructor(private readonly api: ApiService) {}

  getAll(page = 1, limit = 12, mediaTypes?: readonly MediaType[]): Observable<MediaPage> {
    return this.api.get<MediaPage>('/media/published', {
      params: {
        page,
        limit,
        ...(mediaTypes?.length ? { mediaTypes: mediaTypes.join(',') } : {}),
      },
    });
  }

  getLivestreams(): Observable<Livestream[]> {
    return this.api.get<Livestream[]>('/media/livestreams');
  }
}
