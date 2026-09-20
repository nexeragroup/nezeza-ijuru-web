export interface HeroSlide {
  readonly image: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly text: string;
  readonly primaryAction: { readonly label: string; readonly href: string };
  readonly secondaryAction: { readonly label: string; readonly href: string };
}
