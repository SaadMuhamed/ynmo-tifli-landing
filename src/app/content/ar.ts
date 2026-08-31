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

export interface StatChip {
  value: string;
  label: string;
  icon: string;
  /** drives the chip's accent color and glow, resolved through tokens in hero.scss */
  accent: 'success' | 'brand';
}

export interface HeroContent {
  headlineLine1: string;
  headlinePrefix: string;
  headlineHighlight: string;
  subhead: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  photoAlt: string;
  statsLeft: StatChip[];
  statsRight: StatChip[];
}

/**
 * S01 — Hero (node 956:10749). Copy matches the plan's §7 draft exactly.
 * CTA hrefs are placeholders pending B-4 (real CTA destinations).
 */
export const HERO: HeroContent = {
  headlineLine1: 'رحلة كاملة لرعاية وتطوير طفلك..',
  headlinePrefix: 'تبدأ من ',
  headlineHighlight: 'خطوة واحدة',
  subhead:
    'نرافقك من الفحص والتقييم، مروراً بالاستشارات والتشخيص، وحتى اختيار البيئة التعليمية والعلاجية الأنسب لطفلك.',
  primaryCta: { label: 'احجز تقييم نمو الطفل', href: '#' },
  secondaryCta: { label: 'احجز جلسة استشاريه', href: '#' },
  photoAlt: 'أم تحمل طفلها الرضيع وتبتسم له',
  statsLeft: [
    { value: '5 / 4.9', label: 'رضا الأسر', icon: '/assets/icons/hero/stat-heart-check.svg', accent: 'success' },
    { value: '+ 146,000', label: 'دقيقة استشارية', icon: '/assets/icons/hero/stat-time-quarter.svg', accent: 'brand' },
  ],
  statsRight: [
    { value: '+ 200,000', label: 'طفل مستفيد', icon: '/assets/icons/hero/stat-baby.svg', accent: 'success' },
    { value: '+ 450', label: 'اخصائي', icon: '/assets/icons/hero/stat-doctor.svg', accent: 'brand' },
  ],
};
