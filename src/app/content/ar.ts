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

export interface SpecialtyChip {
  label: string;
}

export interface Practitioner {
  name: string;
  specialty: string;
  credential: string;
  experience: string;
  avatar: string;
  avatarWebp: string;
}

export interface SpecialistsContent {
  headingPrefix: string;
  headingHighlight: string;
  subhead: string;
  chipsIntro: string;
  chips: SpecialtyChip[];
  allSpecialistsLink: { label: string; href: string };
  /** DOM order = RTL reading order: most-active card first (renders rightmost) */
  practitioners: Practitioner[];
}

/**
 * S04 — Specialists (node 956:11313). Copy matches plan §7. The 4
 * practitioner cards in Figma have no per-card booking button (plan's §7
 * text mentions one) — built what the live node actually has, same as the
 * S00 header precedent (trust Figma over the plan's prose when they
 * differ). The right-side photo collage + partner/certification logos are
 * one flattened image (decorative, same reasoning as S02's clusters).
 */
export const SPECIALISTS: SpecialistsContent = {
  headingPrefix: 'خبراء يرافقون ',
  headingHighlight: 'رحلة طفلك',
  subhead: 'اختر المختص المناسب لعمر طفلك واحتياجه، واحجز في الوقت الذي يناسبك.',
  chipsIntro: 'تخصصات متعددة.. لأن لكل طفل احتياجه:',
  chips: [
    { label: 'علاج وظيفي' },
    { label: 'نطق وتخاطب' },
    { label: 'علاج طبيعي' },
    { label: 'طب الأطفال' },
    { label: 'علم النفس' },
    { label: 'تحليل السلوك التطبيقي' },
    { label: 'تخصصات طبية أخرى' },
  ],
  allSpecialistsLink: { label: 'تعرّف على جميع الأخصائيين', href: '#' },
  practitioners: [
    {
      name: 'د. عبدالله القحطاني',
      specialty: 'استشاري طب أطفال ونمو',
      credential: 'زمالة طب الأطفال · ترخيص مهني ساري',
      experience: '14 سنة خبرة',
      avatar: '/assets/img/specialists/avatar-4.png',
      avatarWebp: '/assets/img/specialists/avatar-4.webp',
    },
    {
      name: 'أ. فيصل الزهراني',
      specialty: 'أخصائي تحليل سلوك تطبيقي',
      credential: 'اعتماد مهني في تحليل السلوك التطبيقي',
      experience: '8 سنوات خبرة',
      avatar: '/assets/img/specialists/avatar-3.png',
      avatarWebp: '/assets/img/specialists/avatar-3.webp',
    },
    {
      name: 'أ. مريم العمري',
      specialty: 'أخصائية علاج وظيفي',
      credential: 'اعتماد في التكامل الحسي للأطفال',
      experience: '7 سنوات خبرة',
      avatar: '/assets/img/specialists/avatar-2.png',
      avatarWebp: '/assets/img/specialists/avatar-2.webp',
    },
    {
      name: 'د. سارة الحربي',
      specialty: 'أخصائية نطق وتخاطب',
      credential: 'مرخّصة من الهيئة السعودية للتخصصات الصحية',
      experience: '9 سنوات خبرة',
      avatar: '/assets/img/specialists/avatar-1.png',
      avatarWebp: '/assets/img/specialists/avatar-1.webp',
    },
  ],
};

export interface ScreeningTool {
  titleBefore: string;
  /** Latin acronym — wrapped in <bdi> in the template per plan §5 */
  acronym: string;
  titleAfter: string;
  ageRange: string;
  link: { label: string; href: string };
}

export interface ScreeningToolsContent {
  headingLine1: string;
  headingLine2: string;
  subhead: string;
  /** DOM order = RTL reading order (rightmost card first) */
  tools: ScreeningTool[];
}

/** S05 — Screening tools (node 956:11476). Copy matches plan §7 exactly. */
export const SCREENING_TOOLS: ScreeningToolsContent = {
  headingLine1: 'مقاييس محلية',
  headingLine2: 'وعالمية موثوقة!',
  subhead:
    'أداة كشف مبكر تساعد الأسرة على تحديد مؤشرات اضطراب طيف التوحد لدى الطفل في سن مبكرة، وتوجّه إلى التقييم المتخصص عند الحاجة.',
  tools: [
    {
      titleBefore: 'القائمة المعدّلة للكشف المبكر عن التوحد (',
      acronym: 'M-Chat',
      titleAfter: ')',
      ageRange: 'من 16 إلى 30 شهراً',
      link: { label: 'تفاصيل أكثر', href: '#' },
    },
    {
      titleBefore: 'قائمة جِش العربية لقياس التطور اللغوي (',
      acronym: 'JACDI',
      titleAfter: ')',
      ageRange: 'من 8 أشهر إلى 3 سنوات',
      link: { label: 'تفاصيل أكثر', href: '#' },
    },
    {
      titleBefore: 'استبيانات الأعمار والمراحل، الإصدار الثالث (',
      acronym: 'ASQ-3',
      titleAfter: ')',
      ageRange: 'من شهر إلى 5 سنوات ونصف',
      link: { label: 'تفاصيل أكثر', href: '#' },
    },
  ],
};

export interface ReasonTile {
  titleLine1: string;
  titleLine2: string;
  icon: string;
}

export interface WhyUsContent {
  headingLine1: string;
  headingLine2: string;
  cta: { label: string; href: string };
  tiles: ReasonTile[];
}

/** S06 — Why us (node 956:11515). Copy matches plan §7 exactly. */
export const WHY_US: WhyUsContent = {
  headingLine1: 'لماذا ينمو طفلي',
  headingLine2: 'هو الأفضل؟',
  cta: { label: 'احجز جلسة استشاريه', href: '#' },
  tiles: [
    { titleLine1: 'أخصائيين', titleLine2: 'مؤهلين', icon: '/assets/icons/why-us/tile-reader.svg' },
    { titleLine1: 'التركيز على', titleLine2: 'الراحة', icon: '/assets/icons/why-us/tile-family-love.svg' },
    { titleLine1: 'خصوصية', titleLine2: 'تامة', icon: '/assets/icons/why-us/tile-shield-check.svg' },
    { titleLine1: 'برامج تدخل', titleLine2: 'مبكر فعالة', icon: '/assets/icons/why-us/tile-favorite-chat.svg' },
    { titleLine1: 'مراقبة الطفل', titleLine2: 'في بيئته الطبيعية', icon: '/assets/icons/why-us/tile-house.png' },
  ],
};
