import { HttpErrorResponse } from '@angular/common/http';
import { Component, RESPONSE_INIT, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OnDestroy, OnInit, signal } from '@angular/core';
import { Subject, Subscription, finalize, takeUntil } from 'rxjs';
import { ConferenceProgramDetails as ConferenceProgramDetailsModel } from '../../interfaces/conference.interface';
import { ConferencesService } from '../../services/conferences.service';
import { SeoService } from '../../../../core';

@Component({
  selector: 'app-conference-program-details',
  standalone: false,
  styleUrl: './conference-program-details.css',
  templateUrl: './conference-program-details.html',
})
export class ConferenceProgramDetails implements OnInit, OnDestroy {
  readonly details = signal<ConferenceProgramDetailsModel | null>(null);
  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly errorKind = signal<'not-found' | 'unavailable'>('unavailable');
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
      const conferenceId = params.get('conferenceId');
      const programId = params.get('conferenceProgramId');
      if (conferenceId && programId) this.loadProgram(conferenceId, programId);
      else this.setError(404);
    });
  }

  ngOnDestroy(): void {
    this.request?.unsubscribe();
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  retry(): void {
    const conferenceId = this.route.snapshot.paramMap.get('conferenceId');
    const programId = this.route.snapshot.paramMap.get('conferenceProgramId');
    if (conferenceId && programId) this.loadProgram(conferenceId, programId);
  }

  schedule(value: string, timezone: string): string {
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

  readableStatus(status: string): string {
    return status.toLowerCase().replaceAll('_', ' ');
  }

  private loadProgram(conferenceId: string, programId: string): void {
    this.request?.unsubscribe();
    this.loading.set(true);
    this.loadError.set(false);
    this.request = this.conferencesApi
      .getConferenceProgram(conferenceId, programId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.details.set(data);
          this.seo.updatePage({
            title: `${data.conferenceProgram.program.name} | ${data.conference.title}`,
            description:
              data.conferenceProgram.conferenceSummary ||
              data.conferenceProgram.program.summary ||
              data.conferenceProgram.program.description ||
              data.conference.theme,
            canonicalPath: `/conferences/${data.conference.id}/program/${data.conferenceProgram.id}`,
            type: 'article',
          });
        },
        error: (error: HttpErrorResponse) => this.setError(error.status === 404 ? 404 : 503),
      });
  }

  private setError(status: 404 | 503): void {
    this.details.set(null);
    this.loading.set(false);
    this.loadError.set(true);
    this.errorKind.set(status === 404 ? 'not-found' : 'unavailable');
    const notFound = status === 404;
    this.seo.updatePage({
      title: notFound ? 'Program not found | Nezeza Ijuru' : 'Program unavailable | Nezeza Ijuru',
      description: notFound
        ? 'The conference program you requested could not be found.'
        : 'This conference program is temporarily unavailable. Please try again shortly.',
      robots: 'noindex,nofollow,noarchive',
    });
    if (this.responseInit) this.responseInit.status = status;
  }
}
