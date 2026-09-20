import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core';
import { Program } from '../interfaces/program.interface';

@Injectable({ providedIn: 'root' })
export class ProgramsService {
  constructor(private readonly api: ApiService) {}

  getAll(): Observable<Program[]> {
    return this.api.get<Program[]>('/programs/published');
  }
}
