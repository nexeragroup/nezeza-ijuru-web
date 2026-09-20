export interface Give {
  id: string;
  title: string;
  slug?: string;
}

export interface GivingMethodDetail {
  label: string;
  value: string;
}

export interface GivingMethod {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  badge: string;
  description: string;
  details: GivingMethodDetail[];
  actionLabel: string;
  href: string;
  featured?: boolean;
  external?: boolean;
}
