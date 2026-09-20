import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MediaRoutingModule } from './media-routing-module';
import { MediaPage } from './pages/media-page/media-page';
import { LivestreamPage } from './pages/livestream-page/livestream-page';
import { GalleryPage } from './pages/gallery-page/gallery-page';
import { SharedModule } from '../../shared/shared.module';
import { MediaCard } from './components/media-card/media-card';

@NgModule({
  declarations: [MediaPage, LivestreamPage, GalleryPage, MediaCard],
  imports: [CommonModule, MediaRoutingModule, SharedModule],
})
export class MediaModule {}
