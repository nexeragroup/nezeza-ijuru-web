import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConferencesList } from './pages/conferences-list/conferences-list';
import { ConferenceDetails } from './pages/conference-details/conference-details';
import { ConferenceProgramDetails } from './pages/conference-program-details/conference-program-details';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: ConferencesList },
  {
    path: ':conferenceId/program/:conferenceProgramId',
    component: ConferenceProgramDetails,
  },
  { path: ':id', component: ConferenceDetails },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConferencesRoutingModule {}
