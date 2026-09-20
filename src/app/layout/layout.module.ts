import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { PublicLayoutComponent } from './public-layout/public-layout.component';

const LAYOUT_COMPONENTS = [PublicLayoutComponent, HeaderComponent, FooterComponent];

@NgModule({
  declarations: LAYOUT_COMPONENTS,
  imports: [CommonModule, RouterModule],
  exports: LAYOUT_COMPONENTS,
})
export class LayoutModule {}
