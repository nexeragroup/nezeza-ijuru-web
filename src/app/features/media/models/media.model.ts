export interface MediaItem {
  id: string;
  title: string;
  slug?: string;
  caption?: string | null;
  altText?: string | null;
  url: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'PODCAST' | 'DOCUMENT' | 'OTHER';
  sourceType: 'UPLOAD' | 'EXTERNAL';
}

export interface MediaPage {
  data: MediaItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
