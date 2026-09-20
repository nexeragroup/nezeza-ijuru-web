import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MediaPage } from './pages/media-page/media-page';
import { GalleryPage } from './pages/gallery-page/gallery-page';
import { LivestreamPage } from './pages/livestream-page/livestream-page';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: MediaPage },
  { path: 'gallery/:albumSlug', component: GalleryPage },
  { path: 'livestream', component: LivestreamPage },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MediaRoutingModule {}
