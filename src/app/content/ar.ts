/**
 * All Arabic copy for the Ynmo Tifli landing page, byte-for-byte from Figma.
 * Never edited, translated, or diacritized here — see build plan §2.3.
 */

export interface NavLink {
  label: string;
  href: string;
}

export interface HeaderContent {
  ctaLabel: string;
  ctaHref: string;
  navLinks: NavLink[];
  /** index into navLinks that carries the active/brand-accent treatment */
  activeNavIndex: number;
}

/**
 * S00 — Floating Header (node 956:11865).
 * Content pulled verbatim from the live Figma node — it differs from the
 * plan's §7 written description (no "تسجيل دخول", no literal "Get Started
 * Now" / "العربية" pill). Confirmed with Saad to trust the Figma node.
 * CTA href is a placeholder pending B-4 (real CTA destinations).
 */
export const HEADER: HeaderContent = {
  ctaLabel: 'احجز الآن',
  ctaHref: '#',
  navLinks: [
    { label: 'المناهج', href: '#' },
    { label: 'تواصل معنا', href: '#' },
    { label: 'مدونة ينمو', href: '#' },
    { label: 'منتجاتنا', href: '#' },
    { label: 'من نحن', href: '#' },
  ],
  activeNavIndex: 3,
};
