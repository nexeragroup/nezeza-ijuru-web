import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContactRoutingModule } from './contact-routing-module';
import { ContactPage } from './pages/contact-page/contact-page';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [ContactPage],
  imports: [CommonModule, ContactRoutingModule, SharedModule],
})
export class ContactModule {}
