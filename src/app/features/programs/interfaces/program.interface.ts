export interface Program {
  id: string;
  slug: string;
  name: string;
  summary: string | null;
  description: string | null;
  featuredMediaId: string | null;
  publicationStatus: string;
  conferences?: ProgramConference[];
}

export interface ProgramConference {
  id: string;
  conferenceId: string;
  programId: string;
  conferenceSummary: string | null;
  isFeatured: boolean;
  conference?: {
    id: string;
    year: number;
    slug: string;
    title: string;
    theme: string;
    isCurrent: boolean;
    publicationStatus: string;
  };
}
