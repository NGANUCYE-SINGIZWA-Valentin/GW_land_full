export interface NavLink {
  labelKey: string;
  sectionId?: string;
  route?: string;
  children?: NavLink[];
}

export const navLinks: NavLink[] = [
  { labelKey: 'nav.home', route: '/' },
  { labelKey: 'nav.properties', route: '/properties' },
  {
    labelKey: 'nav.pages',
    children: [
      { labelKey: 'nav.about', route: '/about' },
      { labelKey: 'nav.privacy', route: '/privacy-policy' },
      { labelKey: 'nav.terms', route: '/terms-conditions' },
    ],
  },
  { labelKey: 'nav.blog', route: '/blog' },
  { labelKey: 'nav.contact', route: '/contact' },
];

/** Routes whose hero sits full-bleed behind a transparent navbar. Empty so all pages start cleanly below header. */
export const TRANSPARENT_HERO_ROUTES: string[] = [];
