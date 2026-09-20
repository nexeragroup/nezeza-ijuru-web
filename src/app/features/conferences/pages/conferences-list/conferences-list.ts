import { Component } from '@angular/core';
import { OnInit, signal, computed } from '@angular/core';
import { finalize } from 'rxjs';
import { Conference } from '../../interfaces/conference.interface';
import { ConferencesService } from '../../services/conferences.service';

@Component({
  selector: 'app-conferences-list',
  standalone: false,
  styleUrl: './conferences-list.css',
  templateUrl: './conferences-list.html',
})
export class ConferencesList implements OnInit {
  readonly conferences = signal<Conference[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly currentConference = computed(
    () => this.conferences().find((conference) => conference.isCurrent) ?? null,
  );
  readonly archivedConferences = computed(() =>
    this.conferences().filter((conference) => !conference.isCurrent),
  );

  private readonly fallbackImages = [
    '/images/programs/worship.jpg',
    '/images/programs/discipleship.jpg',
    '/images/programs/evangelism.jpg',
    '/images/programs/community-care.jpg',
    '/images/programs/ylc.jpg',
    '/images/programs/family.jpg',
  ];

  constructor(private readonly conferencesApi: ConferencesService) {}

  ngOnInit(): void {
    this.loadConferences();
  }

  loadConferences(): void {
    this.loading.set(true);
    this.loadError.set(false);
    this.conferencesApi
      .getAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.conferences.set(data);
        },
        error: (error) => {
          this.loadError.set(true);
        },
      });
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
    return `${number}${suffix} conference`;
  }

  conferenceImage(index: number): string {
    return this.fallbackImages[index % this.fallbackImages.length];
  }

  selectConference(conference: Conference): void {
    this.conferencesApi.selectConference(conference.id);
  }
}
