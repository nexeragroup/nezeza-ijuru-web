import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  ...[
    '',
    'give',
    'about',
    'programs',
    'programs/:programSlug',
    'conferences',
    'conferences/:conferenceId/program/:conferenceProgramId',
    'conferences/:id',
    'media',
    'media/gallery/:albumSlug',
    'media/livestream',
    'contact',
  ].map((path) => ({ path, renderMode: RenderMode.Server as const })),
  {
    path: '**',
    renderMode: RenderMode.Server as const,
    status: 404,
  },
];
