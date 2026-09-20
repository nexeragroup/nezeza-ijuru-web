import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { filter } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SeoMetadata {
  title: string;
  description: string;
  canonicalPath: string;
  robots: string;
  imagePath: string;
  type: 'website' | 'article';
  keywords?: readonly string[];
}

type SeoMetadataInput = Partial<SeoMetadata>;

const DEFAULT_METADATA: SeoMetadata = {
  title: 'Nezeza Ijuru | Make heaven rejoice',
  description:
    'Nezeza Ijuru is an annual evangelistic campaign centred on the Gospel, discipleship, worship, godly families, youth empowerment, and compassionate service.',
  canonicalPath: '',
  robots: environment.indexable ? 'index,follow' : 'noindex,nofollow,noarchive',
  imagePath: environment.socialImagePath,
  type: 'website',
};

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly router = inject(Router);
  private metadata = DEFAULT_METADATA;

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.updateFromRoute(event.urlAfterRedirects));

    this.updateFromRoute(this.router.url);
  }

  updatePage(input: SeoMetadataInput): void {
    this.metadata = { ...this.metadata, ...input };
    this.apply(this.metadata, this.router.url);
  }

  private updateFromRoute(url: string): void {
    this.metadata = {
      ...DEFAULT_METADATA,
      ...this.readRouteMetadata(this.router.routerState.snapshot.root),
    };
    this.apply(this.metadata, url);
  }

  private readRouteMetadata(route: ActivatedRouteSnapshot): SeoMetadataInput {
    let metadata = this.asMetadata(route.data['seo']);
    for (const child of route.children) {
      if (child.outlet === 'primary') {
        metadata = { ...metadata, ...this.readRouteMetadata(child) };
      }
    }
    return metadata;
  }

  private asMetadata(value: unknown): SeoMetadataInput {
    if (!value || typeof value !== 'object') return {};
    const candidate = value as Record<string, unknown>;
    return {
      ...(typeof candidate['title'] === 'string' ? { title: candidate['title'] } : {}),
      ...(typeof candidate['description'] === 'string'
        ? { description: candidate['description'] }
        : {}),
      ...(typeof candidate['canonicalPath'] === 'string'
        ? { canonicalPath: candidate['canonicalPath'] }
        : {}),
      ...(typeof candidate['robots'] === 'string' ? { robots: candidate['robots'] } : {}),
      ...(Array.isArray(candidate['keywords'])
        ? {
            keywords: candidate['keywords'].filter(
              (item): item is string => typeof item === 'string',
            ),
          }
        : {}),
    };
  }

  private apply(metadata: SeoMetadata, url: string): void {
    const canonicalPath = this.path(metadata.canonicalPath || url);
    const canonicalUrl = `${environment.siteUrl}${canonicalPath}`;
    const imageUrl = this.absoluteUrl(metadata.imagePath);

    this.title.setTitle(metadata.title);
    this.meta.updateTag(
      { name: 'description', content: metadata.description },
      "name='description'",
    );
    this.meta.updateTag({ name: 'robots', content: metadata.robots }, "name='robots'");
    this.meta.updateTag({ property: 'og:title', content: metadata.title }, "property='og:title'");
    this.meta.updateTag(
      { property: 'og:description', content: metadata.description },
      "property='og:description'",
    );
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl }, "property='og:url'");
    this.meta.updateTag({ property: 'og:type', content: metadata.type }, "property='og:type'");
    this.meta.updateTag({ property: 'og:image', content: imageUrl }, "property='og:image'");
    this.meta.updateTag(
      { name: 'twitter:card', content: 'summary_large_image' },
      "name='twitter:card'",
    );
    this.meta.updateTag({ name: 'twitter:title', content: metadata.title }, "name='twitter:title'");
    this.meta.updateTag(
      { name: 'twitter:description', content: metadata.description },
      "name='twitter:description'",
    );
    this.meta.updateTag({ name: 'twitter:image', content: imageUrl }, "name='twitter:image'");
    this.meta.updateTag(
      {
        name: 'keywords',
        content: metadata.keywords?.join(', ') ?? 'Nezeza Ijuru, Rwanda, Gospel',
      },
      "name='keywords'",
    );

    this.updateCanonical(canonicalUrl);
    this.updateStructuredData(metadata, canonicalUrl, imageUrl);
  }

  private updateCanonical(url: string): void {
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }
    link.href = url;
  }

  private updateStructuredData(
    metadata: SeoMetadata,
    canonicalUrl: string,
    imageUrl: string,
  ): void {
    let script = this.document.head.querySelector<HTMLScriptElement>('#seo-json-ld');
    if (!script) {
      script = this.document.createElement('script');
      script.id = 'seo-json-ld';
      script.type = 'application/ld+json';
      this.document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: metadata.title,
      description: metadata.description,
      url: canonicalUrl,
      image: imageUrl,
      isPartOf: {
        '@type': 'WebSite',
        name: 'Nezeza Ijuru',
        url: environment.siteUrl,
      },
    });
  }

  private path(value: string): string {
    const path = value.split(/[?#]/, 1)[0] || '/';
    return path.startsWith('/') ? path : `/${path}`;
  }

  private absoluteUrl(value: string): string {
    return /^https?:\/\//i.test(value) ? value : `${environment.siteUrl}${this.path(value)}`;
  }
}
