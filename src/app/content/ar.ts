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

export interface JourneyStep {
  number: number;
  title: string;
  description: string;
  illustration: string;
  illustrationWebp: string;
  link?: { label: string; href: string };
}

export interface AppPromo {
  headingPrefix: string;
  headingBrand: string;
  /** CSS class suffix (app-promo__brand--tawakkalna | --ynmo) — colors resolve through tokens in journey.scss */
  accent: 'tawakkalna' | 'ynmo';
  icon: string;
  iconWebp?: string;
  isYnmoLogo?: boolean;
  appStoreHref: string;
  googlePlayHref: string;
}

export interface JourneyContent {
  heading: string;
  /** DOM order = RTL reading order, i.e. step 1 first (renders rightmost) */
  steps: JourneyStep[];
  promos: AppPromo[];
}

/**
 * S02 — Journey (node 956:10779). Step titles/descriptions match plan §7.
 * Floating phone-mockup clusters are flattened exported images per the
 * plan's explicit S02 note (rebuilding them in DOM is out of MVP scope).
 * The step-to-step "«" connector chevron is a minor decorative detail
 * omitted from the flattened exports — skipped for MVP.
 */
export const JOURNEY: JourneyContent = {
  heading: 'رحلتك مع ينمو طفلي',
  steps: [
    {
      number: 1,
      title: 'التقييم والاطمئنان',
      description: 'تقييم مراحل النمو للتعرف على تطور طفلك والاطمئنان عليه خطوة بخطوة.',
      illustration: '/assets/img/journey/step-1-illustration.png',
      illustrationWebp: '/assets/img/journey/step-1-illustration.webp',
    },
    {
      number: 2,
      title: 'الاستشارة والمشاركة',
      description: 'جلسة مع أخصائي عن بُعد لفهم احتياجات طفلك بناءً على نتائج التقييم.',
      illustration: '/assets/img/journey/step-2-illustration.png',
      illustrationWebp: '/assets/img/journey/step-2-illustration.webp',
    },
    {
      number: 3,
      title: 'تحديد الخدمة الأنسب',
      description: 'بناءً على توصية المختص، نوجّهك إلى الخدمة التي يحتاجها طفلك فعلاً.',
      illustration: '/assets/img/journey/step-3-illustration.png',
      illustrationWebp: '/assets/img/journey/step-3-illustration.webp',
      link: { label: 'تعرّف على خدماتنا', href: '#' },
    },
    {
      number: 4,
      title: 'البيئة والدمج المساند',
      description: 'دعم ممتد داخل المدرسة والحضانة ليجد طفلك بيئة آمنة ومحفّزة.',
      illustration: '/assets/img/journey/step-4-illustration.png',
      illustrationWebp: '/assets/img/journey/step-4-illustration.webp',
    },
  ],
  /**
   * DOM order is the mirror of Figma's left-to-right visual order (ynmo
   * block first, tawakkalna second) so plain flex-row + dir=rtl reproduces
   * the original screenshot (tawakkalna left, ynmo right) — same technique
   * as S00/S01.
   */
  promos: [
    {
      headingPrefix: 'ابدأ الآن و حمّل تطبيق ',
      headingBrand: 'ينمو طفلي',
      accent: 'ynmo',
      icon: '',
      isYnmoLogo: true,
      appStoreHref: '#',
      googlePlayHref: '#',
    },
    {
      headingPrefix: 'او احصل علي الخدمة عبر تطبيق ',
      headingBrand: 'توكلنا',
      accent: 'tawakkalna',
      icon: '/assets/icons/journey/tawakkalna-icon.png',
      iconWebp: '/assets/icons/journey/tawakkalna-icon.webp',
      appStoreHref: '#',
      googlePlayHref: '#',
    },
  ],
};
