export interface Conference {
  id: string;
  year: number;
  title: string;
  slug: string;
  theme: string;
  summary: string | null;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  publicationStatus: 'PUBLISHED';
  featuredMediaId: string | null;
  programs?: ConferenceProgram[];
  media?: ConferenceProgramMedia[];
}

export interface ConferenceProgram {
  id: string;
  conferenceId: string;
  programId: string;
  conferenceSummary: string | null;
  isFeatured: boolean;
  displayOrder: number;
  program: {
    id: string;
    slug: string;
    name: string;
    summary: string | null;
    description: string | null;
    featuredMediaId: string | null;
    publicationStatus: string;
  };
  events: ConferenceEvent[];
}

export interface ConferenceEvent {
  id: string;
  code?: string;
  slug: string;
  title: string;
  eventType: string;
  summary: string | null;
  description: string | null;
  locationMode: string;
  timezone: string;
  startAt: string;
  endAt: string;
  capacity: number | null;
  eventStatus: string;
  registrationRequired: boolean;
  registrationOpensAt?: string | null;
  registrationClosesAt?: string | null;
  publicationStatus: string;
  isFeatured?: boolean;
  defaultVenue: ConferenceVenue | null;
  sessions: ConferenceSession[];
}

export interface ConferenceSession {
  id: string;
  code: string;
  slug: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string;
  capacity: number | null;
  sessionStatus: string;
  registrationRequired: boolean;
  streamUrl?: string | null;
  publicationStatus: string;
  venue: ConferenceVenue | null;
  displayOrder?: number;
}

export interface ConferenceVenue {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  district: string | null;
  country: string;
  instructions?: string | null;
}

export interface ConferenceProgramMedia {
  id: string;
  targetType: 'CONFERENCE_PROGRAM' | 'EVENT' | 'SESSION';
  targetId: string;
  sourceType: 'UPLOAD' | 'EXTERNAL';
  mediaType: 'IMAGE' | 'VIDEO' | 'PODCAST' | 'AUDIO' | 'DOCUMENT' | 'OTHER';
  title: string;
  caption: string | null;
  altText: string | null;
  url: string;
  durationSeconds: number | null;
  isFeatured: boolean;
}

export interface ConferenceProgramDetails {
  conference: Conference;
  conferenceProgram: ConferenceProgram;
  media: ConferenceProgramMedia[];
}
