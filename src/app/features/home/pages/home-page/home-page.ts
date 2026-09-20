import { Component, DestroyRef, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HeroSlide } from '../../interfaces/hero-slides.interface';
import { isPlatformBrowser } from '@angular/common';
import { ConferencesService } from '../../../conferences/services/conferences.service';
import { Conference } from '../../../conferences/interfaces/conference.interface';
import { Program } from '../../../programs/interfaces/program.interface';
import { programImage } from '../../../programs/programs-content';
import { ProgramsService } from '../../../programs/services/programs.service';

@Component({
  selector: 'app-home-page',
  standalone: false,
  styleUrl: './home-page.css',
  templateUrl: './home-page.html',
})
export class HomePage implements OnInit {
  readonly currentConference = signal<Conference | null>(null);
  readonly conferences = signal<Conference[]>([]);
  readonly programs = signal<Program[]>([]);
  readonly carouselPaused = signal(false);

  ngOnInit(): void {
    this.conferencesApi
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          const published = data
            .filter((conference) => conference.publicationStatus === 'PUBLISHED')
            .sort((left, right) => right.year - left.year);
          const current = published.find((conference) => conference.isCurrent) ?? null;
          this.currentConference.set(current);
          this.conferences.set(
            published.filter((conference) => conference.id !== current?.id).slice(0, 3),
          );
        },
        error: () => this.currentConference.set(null),
      });

    this.programsApi
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (programs) =>
          this.programs.set(
            programs.filter((program) => program.publicationStatus === 'PUBLISHED'),
          ),
        error: () => this.programs.set([]),
      });
  }

  readonly heroSlides: readonly HeroSlide[] = [
    {
      image: '/images/programs/evangelism.jpg',
      eyebrow: 'Evangelism and missions',
      title: 'Carry the Gospel to every person.',
      text: 'Sharing Jesus through personal relationships, neighbourhoods, schools, streets, communities, and every opportunity God gives us to reach people with the Gospel.',
      primaryAction: {
        label: 'Explore evangelism',
        href: '/programs/evangelism-and-missions',
      },
      secondaryAction: {
        label: 'Discover our mission',
        href: '/about',
      },
    },

    {
      image: '/images/programs/community-care.jpg',
      eyebrow: 'Charity and community care',
      title: 'Let the love of God become visible.',
      text: 'Serving people in practical ways through care for patients, prisoners, refugees, vulnerable families, and communities facing hardship.',
      primaryAction: {
        label: 'Explore community care',
        href: '/programs/charity-and-community-care',
      },
      secondaryAction: {
        label: 'Support the mission',
        href: '/give',
      },
    },

    {
      image: '/images/programs/ylc.jpg',
      eyebrow: 'Young generation',
      title: 'Plant truth in the next generation.',
      text: 'Reaching and mentoring young people in schools, universities, rehabilitation centres, and our communities so they can discover their identity, purpose, and hope in Christ.',
      primaryAction: {
        label: 'Explore youth ministry',
        href: '/programs/youth-empowerment',
      },
      secondaryAction: {
        label: 'Get involved',
        href: '/contact',
      },
    },

    {
      image: '/images/programs/family.jpg',
      eyebrow: 'Raising godly families',
      title: 'Build homes rooted in Christ.',
      text: 'Equipping marriages, parents, and families to make God’s Word part of everyday life and raise homes marked by faith, love, truth, discipleship, and godly character.',
      primaryAction: {
        label: 'Explore family ministry',
        href: '/programs/raising-godly-families',
      },
      secondaryAction: {
        label: 'Explore the media',
        href: '/media',
      },
    },

  ];

  readonly activeSlideIndex = signal(0);

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private readonly destroyRef: DestroyRef,
    private readonly conferencesApi: ConferencesService,
    private readonly programsApi: ProgramsService,
  ) {
    if (isPlatformBrowser(platformId)) {
      const reducedMotion =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const timer = reducedMotion
        ? undefined
        : window.setInterval(() => {
            if (!this.carouselPaused()) this.nextSlide();
          }, 7000);
      destroyRef.onDestroy(() => {
        if (timer !== undefined) window.clearInterval(timer);
      });
    }
  }

  nextSlide(): void {
    this.activeSlideIndex.update((index) => (index + 1) % this.heroSlides.length);
  }

  previousSlide(): void {
    this.activeSlideIndex.update(
      (index) => (index - 1 + this.heroSlides.length) % this.heroSlides.length,
    );
  }

  selectSlide(index: number): void {
    this.activeSlideIndex.set(index);
  }

  toggleCarousel(): void {
    this.carouselPaused.update((paused) => !paused);
  }

  programImage(program: Program): string {
    return programImage(program);
  }

  conferenceNumber(conference: Conference): string {
    const number = conference.year - 2016;
    const suffix =
      number % 100 >= 11 && number % 100 <= 13
        ? 'th'
        : number % 10 === 1
          ? 'st'
          : number % 10 === 2
            ? 'nd'
            : number % 10 === 3
              ? 'rd'
              : 'th';
    return `${number}${suffix} edition`;
  }

  readonly milestones = [
    {
      year: '2017',
      title: 'A local call to make heaven rejoice',
      description:
        'Zion Temple Kimironko began Nezeza Ijuru as an evangelistic campaign: find the lost, lead them to Christ, and start close to home.',
    },
    {
      year: '2017–2025',
      title: 'Nine documented conferences',
      description:
        'Each annual theme has called people back to Christ, from effective Christian living to the cross, discipleship, and a healthy church.',
    },
    {
      year: 'Today',
      title: 'A Gospel-shaped life together',
      description:
        'The campaign continues through evangelism, care for neighbours, godly families, youth formation, worship, and revival.',
    },
  ] as const;

  readonly impact = [
    {
      value: '1,000+',
      label: 'People who gave their lives to Jesus',
      note: 'Reported across Nezeza Ijuru activities since the mission began in 2017.',
    },

    {
      value: '10th',
      label: 'Edition in 2026',
      note: 'A decade of annual evangelism and discipleship through different expressions of Nezeza Ijuru.',
    },

    {
      value: 'Care',
      label: 'Compassion made visible',
      note: 'Patients, prisoners, refugees, disadvantaged people, and families in need have received practical support.',
    },

    {
      value: 'Families',
      label: 'Homes restored and strengthened',
      note: 'Families have received support, encouragement, and opportunities for restoration.',
    },
  ] as const;

  readonly involvement = [
    {
      title: 'Attend',
      description: 'Follow the next conference and pray for the people God will draw to Himself.',
      href: '/conferences',
    },
    {
      title: 'Volunteer',
      description: 'Offer your time, skills, and care as we serve people in Jesus’ name.',
      href: '/contact',
    },
    {
      title: 'Give to the mission',
      description: 'Stand with the mission through prayer, collaboration, and practical support.',
      href: '/give',
    },
    {
      title: 'Support the mission',
      description: 'Help make evangelism, discipleship, and compassionate service possible.',
      href: '/give',
    },
  ] as const;
}
