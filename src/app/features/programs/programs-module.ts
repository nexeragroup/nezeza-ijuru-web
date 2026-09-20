import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProgramsRoutingModule } from './programs-routing-module';
import { ProgramsList } from './pages/programs-list/programs-list';
import { ProgramDetails } from './pages/program-details/program-details';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [ProgramsList, ProgramDetails],
  imports: [CommonModule, ProgramsRoutingModule, SharedModule],
})
export class ProgramsModule {}
