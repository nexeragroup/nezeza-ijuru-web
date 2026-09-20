import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GiveRoutingModule } from './give-routing-module';
import { GivePage } from './pages/give-page/give-page';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [GivePage],
  imports: [CommonModule, GiveRoutingModule, SharedModule],
})
export class GiveModule {}
