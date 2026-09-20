import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService, StorageService } from '../../../core';
import {
  Conference,
  ConferenceProgram,
  ConferenceProgramDetails,
} from '../interfaces/conference.interface';

@Injectable({ providedIn: 'root' })
export class ConferencesService {
  private readonly selectedConferenceIdKey = 'selectedConferenceId';

  constructor(
    private readonly api: ApiService,
    private readonly storage: StorageService,
  ) {}

  getAll(): Observable<Conference[]> {
    return this.api
      .get<Conference[]>('/conferences/all')
      .pipe(map((conferences) => conferences.map((conference) => this.normalizeConference(conference))));
  }

  getBySlug(slug: string): Observable<Conference> {
    return this.api
      .get<Conference>(`/conferences/published/${encodeURIComponent(slug)}`)
      .pipe(map((conference) => this.normalizeConference(conference)));
  }

  getByIdentifier(identifier: string): Observable<Conference> {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      identifier,
    )
      ? this.getById(identifier)
      : this.getBySlug(identifier);
  }

  getById(id: string): Observable<Conference> {
    return this.api
      .get<Conference>(`/conferences/published/id/${encodeURIComponent(id)}`)
      .pipe(map((conference) => this.normalizeConference(conference)));
  }

  getConferenceProgram(
    conferenceId: string,
    conferenceProgramId: string,
  ): Observable<ConferenceProgramDetails> {
    return this.api
      .get<ConferenceProgramDetails>(
        `/conferences/published/${encodeURIComponent(conferenceId)}/program/${encodeURIComponent(conferenceProgramId)}`,
      )
      .pipe(
        map((details) => ({
          ...details,
          conference: this.normalizeConference(details.conference),
          conferenceProgram: this.normalizeProgram(details.conferenceProgram),
          media: details.media ?? [],
        })),
      );
  }

  selectConference(id: string): void {
    this.storage.set(this.selectedConferenceIdKey, id);
  }

  selectedConferenceId(): string | null {
    return this.storage.get<string>(this.selectedConferenceIdKey);
  }

  private normalizeConference(conference: Conference): Conference {
    return {
      ...conference,
      programs: (conference.programs ?? []).map((program) => this.normalizeProgram(program)),
      media: conference.media ?? [],
    };
  }

  private normalizeProgram(program: ConferenceProgram): ConferenceProgram {
    return {
      ...program,
      events: (program.events ?? []).map((event) => ({
        ...event,
        sessions: event.sessions ?? [],
      })),
    };
  }
}
