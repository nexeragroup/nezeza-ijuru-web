import { Injectable } from '@angular/core';
import { ApiResponse } from '../../../core/models/api-response.model';
import { ApiService } from '../../../core';
export interface FeedUpdate {
  id: string;
  source: 'MANUAL' | 'AUTOMATIC';
  category: string;
  label: string;
  title: string;
  message: string;
  actionLabel: string | null;
  actionUrl: string | null;
  live: boolean;
}
@Injectable({ providedIn: 'root' })
export class UpdatesService {
  constructor(private readonly api: ApiService) {}
  feed() {
    return this.api.get<ApiResponse<FeedUpdate[]>>('/updates/feed');
  }
}
