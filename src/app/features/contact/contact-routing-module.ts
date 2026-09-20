import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactPage } from './pages/contact-page/contact-page';

const routes: Routes = [{ path: '', component: ContactPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContactRoutingModule {}
