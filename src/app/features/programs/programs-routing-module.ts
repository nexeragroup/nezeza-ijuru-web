import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProgramsList } from './pages/programs-list/programs-list';
import { ProgramDetails } from './pages/program-details/program-details';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: ProgramsList },
  { path: ':programSlug', component: ProgramDetails },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProgramsRoutingModule {}
