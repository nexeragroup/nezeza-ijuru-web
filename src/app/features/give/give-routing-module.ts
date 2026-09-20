import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GivePage } from './pages/give-page/give-page';

const routes: Routes = [{ path: '', component: GivePage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GiveRoutingModule {}
