import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ErrorRoutingModule } from './error-routing-module';
import { NotFoundPage } from './pages/not-found-page/not-found-page';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [NotFoundPage],
  imports: [CommonModule, ErrorRoutingModule, SharedModule],
})
export class ErrorModule {}
