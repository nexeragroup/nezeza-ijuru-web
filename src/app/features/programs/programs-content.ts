import { Program } from './interfaces/program.interface';

export interface ProgramPresentation {
  image: string;
  headline: string;
  steps: readonly string[];
}

const PRESENTATIONS: Record<string, ProgramPresentation> = {
  'evangelism-and-missions': {
    image: '/images/programs/evangelism.jpg',
    headline: 'Go with the Good News.',
    steps: ['Invite someone', 'Pray for open hearts', 'Help carry the message'],
  },
  'charity-and-community-care': {
    image: '/images/programs/community-care.jpg',
    headline: 'Love made visible.',
    steps: ['Listen with compassion', 'Meet practical needs', 'Restore dignity'],
  },
  'youth-empowerment': {
    image: '/images/programs/ylc.jpg',
    headline: 'Raise servant leaders.',
    steps: ['Build confidence', 'Develop gifts', 'Serve community'],
  },
  'raising-godly-families': {
    image: '/images/programs/family.jpg',
    headline: 'Build homes on Christ.',
    steps: ['Strengthen relationships', 'Practice faith at home', 'Walk together'],
  },
  'praise-and-worship': {
    image: '/images/programs/worship.jpg',
    headline: 'Turn every heart to God.',
    steps: ['Worship faithfully', 'Grow in skill', 'Serve with humility'],
  },
  'discipleship-masterclass': {
    image: '/images/programs/discipleship.jpg',
    headline: 'Rooted for a lifetime.',
    steps: ['Know Scripture', 'Grow in character', 'Disciple others'],
  },
};

const DEFAULT_PRESENTATION: ProgramPresentation = {
  image: '/images/programs/evangelism.jpg',
  headline: 'Make Christ visible in everyday life.',
  steps: ['Learn together', 'Serve faithfully', 'Carry the mission forward'],
};

export function programPresentation(slug: string): ProgramPresentation {
  return PRESENTATIONS[slug] ?? DEFAULT_PRESENTATION;
}

export function programImage(program: Pick<Program, 'slug'>): string {
  return programPresentation(program.slug).image;
}
