import { Component, DestroyRef, OnInit, RESPONSE_INIT, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Program } from '../../interfaces/program.interface';
import { programPresentation } from '../../programs-content';
import { ProgramsService } from '../../services/programs.service';
import { SeoService } from '../../../../core';

interface ProgramView extends Program {
  headline: string;
  image: string;
  steps: readonly string[];
}

@Component({
  selector: 'app-program-details',
  standalone: false,
  styleUrl: './program-details.css',
  templateUrl: './program-details.html',
})
export class ProgramDetails implements OnInit {
  readonly program = signal<ProgramView | null>(null);
  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly errorKind = signal<'not-found' | 'unavailable'>('unavailable');
  private readonly responseInit = inject(RESPONSE_INIT, { optional: true });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly programsApi: ProgramsService,
    private readonly seo: SeoService,
    private readonly destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const slug = params.get('programSlug');
      if (slug) this.loadProgram(slug);
      else this.setError(404);
    });
  }

  loadProgram(slug: string): void {
    this.loading.set(true);
    this.loadError.set(false);
    this.programsApi.getAll().subscribe({
      next: (programs) => {
        const program = programs.find(
          (item) => item.slug === slug && item.publicationStatus === 'PUBLISHED',
        );
        if (!program) {
          this.setError(404);
          return;
        }
        const presentation = programPresentation(program.slug);
        const view = {
          ...program,
          headline: presentation.headline,
          image: presentation.image,
          steps: presentation.steps,
        } satisfies ProgramView;
        this.program.set(view);
        this.loading.set(false);
        this.seo.updatePage({
          title: `${view.name} | Nezeza Ijuru`,
          description: view.summary || view.description || view.name,
          canonicalPath: `/programs/${view.slug}`,
          imagePath: view.image,
          type: 'article',
        });
      },
      error: () => this.setError(503),
    });
  }

  retry(): void {
    const slug = this.route.snapshot.paramMap.get('programSlug');
    if (slug) this.loadProgram(slug);
  }

  private setError(status: 404 | 503): void {
    this.program.set(null);
    this.loading.set(false);
    this.loadError.set(true);
    this.errorKind.set(status === 404 ? 'not-found' : 'unavailable');
    const notFound = status === 404;
    this.seo.updatePage({
      title: notFound ? 'Program not found | Nezeza Ijuru' : 'Program unavailable | Nezeza Ijuru',
      description: notFound
        ? 'The program you requested could not be found.'
        : 'This program is temporarily unavailable. Please try again shortly.',
      robots: 'noindex,nofollow,noarchive',
    });
    if (this.responseInit) this.responseInit.status = status;
  }
}
