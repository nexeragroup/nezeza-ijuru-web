import { HttpErrorResponse } from '@angular/common/http';
import { Component, RESPONSE_INIT, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OnDestroy, OnInit, signal } from '@angular/core';
import { Subject, Subscription, finalize, takeUntil } from 'rxjs';
import { Conference, ConferenceProgram } from '../../interfaces/conference.interface';
import { ConferencesService } from '../../services/conferences.service';
import { SeoService } from '../../../../core';

@Component({
  selector: 'app-conference-details',
  standalone: false,
  styleUrl: './conference-details.css',
  templateUrl: './conference-details.html',
})
export class ConferenceDetails implements OnInit, OnDestroy {
  readonly conference = signal<Conference | null>(null);
  readonly loading = signal(true);
  readonly loadError = signal(false);
  private readonly responseInit = inject(RESPONSE_INIT, { optional: true });
  private request?: Subscription;
  private readonly destroyed$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly conferencesApi: ConferencesService,
    private readonly seo: SeoService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroyed$)).subscribe((params) => {
      const identifier = params.get('id');
      if (identifier) this.loadConference(identifier);
      else this.setError(404);
    });
  }

  ngOnDestroy(): void {
    this.request?.unsubscribe();
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  loadConference(identifier = this.route.snapshot.paramMap.get('id')): void {
    if (!identifier) return;
    this.request?.unsubscribe();
    this.loading.set(true);
    this.loadError.set(false);
    this.request = this.conferencesApi
      .getByIdentifier(identifier)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.conference.set(data);
          this.conferencesApi.selectConference(data.id);
          this.seo.updatePage({
            title: `${data.title} | Nezeza Ijuru`,
            description: data.description || data.summary || data.theme,
            canonicalPath: `/conferences/${data.slug}`,
            type: 'article',
          });
        },
        error: (error: HttpErrorResponse) => this.setError(error.status === 404 ? 404 : 503),
      });
  }

  private setError(status: 404 | 503): void {
    this.conference.set(null);
    this.loading.set(false);
    this.loadError.set(true);
    const notFound = status === 404;
    this.seo.updatePage({
      title: notFound ? 'Conference not found | Nezeza Ijuru' : 'Conference unavailable | Nezeza Ijuru',
      description: notFound
        ? 'The conference you requested could not be found.'
        : 'This conference is temporarily unavailable. Please try again shortly.',
      robots: 'noindex,nofollow,noarchive',
    });
    if (this.responseInit) this.responseInit.status = status;
  }

  eventStatus(status: string): string {
    return status.toLowerCase().replaceAll('_', ' ');
  }

  formatDate(value: string | null, timezone = 'Africa/Kigali'): string {
    if (!value) return 'To be announced';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Date unavailable';
    try {
      return new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: timezone || 'Africa/Kigali',
      }).format(date);
    } catch {
      return new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'UTC',
      }).format(date);
    }
  }

  sessionCount(program: ConferenceProgram): number {
    return (program.events ?? []).reduce(
      (total, event) => total + (event.sessions ?? []).length,
      0,
    );
  }
}
