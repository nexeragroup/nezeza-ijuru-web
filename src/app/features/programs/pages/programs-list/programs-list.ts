import { Component, OnInit, signal } from '@angular/core';
import { Program } from '../../interfaces/program.interface';
import { programImage } from '../../programs-content';
import { ProgramsService } from '../../services/programs.service';

@Component({
  selector: 'app-programs-list',
  standalone: false,
  styleUrl: './programs-list.css',
  templateUrl: './programs-list.html',
})
export class ProgramsList implements OnInit {
  readonly programs = signal<Program[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal(false);

  constructor(private readonly programsApi: ProgramsService) {}

  ngOnInit(): void {
    this.loadPrograms();
  }

  loadPrograms(): void {
    this.loading.set(true);
    this.loadError.set(false);
    this.programsApi.getAll().subscribe({
      next: (programs) => {
        this.programs.set(programs.filter((program) => program.publicationStatus === 'PUBLISHED'));
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }

  image(program: Program): string {
    return programImage(program);
  }
}
