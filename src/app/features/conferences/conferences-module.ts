import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConferencesRoutingModule } from './conferences-routing-module';
import { ConferencesList } from './pages/conferences-list/conferences-list';
import { ConferenceDetails } from './pages/conference-details/conference-details';
import { ConferenceProgramDetails } from './pages/conference-program-details/conference-program-details';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [ConferencesList, ConferenceDetails, ConferenceProgramDetails],
  imports: [CommonModule, ConferencesRoutingModule, SharedModule],
})
export class ConferencesModule {}
