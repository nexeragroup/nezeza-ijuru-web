import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AboutRoutingModule } from './about-routing-module';
import { AboutPage } from './pages/about-page/about-page';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [AboutPage],
  imports: [CommonModule, AboutRoutingModule, SharedModule],
})
export class AboutModule {}
