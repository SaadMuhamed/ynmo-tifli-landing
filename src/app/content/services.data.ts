/** A single decorative phone mockup inside a service card's artwork area. */
export interface ServicePhone {
  /** physical offset from the mockup area's center, in px (design authored at 1192px container) */
  x: number;
  y: number;
  rotate: number;
  width: number;
  height: number;
  screen: string;
  screenWebp: string;
  z: number;
}

export interface ServiceCard {
  id: string;
  /** bento grid key, c1–c9 per YNMO-TIFLI-FEATURES-BENTO-ANIMATION.md §3.3 — drives the scroll-entry animation */
  bentoKey: string;
  title: string;
  icon: string;
  iconAlt: string;
  /** shown in the description tooltip that reveals on badge hover/focus */
  bannerText: string;
  /** features-carousel head copy (§5 of the carousel build spec). Distinct
   * from `bannerText` — only growth-assessment's two strings coincide; the
   * other eight are different copy, so this is a second field rather than a
   * reuse of the first. */
  description: string;
  /** per-feature phone screen for the features carousel */
  carouselMockup: string;
  carouselMockupWebp: string;
  /** 'blue' recolors the title to the new brand blue (secondary-pressed); default stays purple */
  titleAccent?: 'blue';
  /** true removes the top fade on the mockup — for cards with a single hard-clipped phone (matches Figma's crisp edge, no gradient) */
  mockupFlat?: boolean;
  /** pre-composed mockup graphic (phone + content baked in, transparent bg) — overrides `phones` when set */
  heroImage?: string;
  phones: ServicePhone[];
}

const SCREEN = '/assets/img/services-grid/screen.png';
const SCREEN_WEBP = '/assets/img/services-grid/screen.webp';
const SCREEN_ALT = '/assets/img/services-grid/frame-mask.png';
const SCREEN_ALT_WEBP = '/assets/img/services-grid/frame-mask.webp';

/**
 * Per-feature carousel mockups, exported from Figma section 1390:9880 and
 * delivered as `<title>.png` per feature. Most are 913×1474 (a phone with a
 * soft glow ring baked into the canvas); nursery-picker and daycare-centers
 * are wider (1214×1474 / 1379×1474) because their source frames carry
 * floating ListRow cards that overhang the phone body — the component
 * centres each on its own natural width rather than forcing a common one.
 */
const MOCKUP_DIR = '/assets/img/features-carousel';

/** node 1110:26097 — single large upright phone, centered, no tilt (updated Figma design). */
const phonesGrowthAssessment = (): ServicePhone[] => [
  {
    x: 0,
    y: 88,
    rotate: 0,
    width: 188,
    height: 390,
    screen: SCREEN,
    screenWebp: SCREEN_WEBP,
    z: 1,
  },
];

/** node 1110:26122 — mirror of the growth-assessment pair (also upright, no tilt). */
const phonesDoctorConsultation = (): ServicePhone[] => [
  {
    x: -50,
    y: 58,
    rotate: 0,
    width: 130,
    height: 265,
    screen: SCREEN,
    screenWebp: SCREEN_WEBP,
    z: 1,
  },
  {
    x: 48,
    y: 15,
    rotate: 0,
    width: 148,
    height: 305,
    screen: SCREEN_ALT,
    screenWebp: SCREEN_ALT_WEBP,
    z: 2,
  },
];

/** node 1110:26114 — three phones, all tilted the same direction (-30deg).
    y-shifted +106.5 to recenter for the card's 200px -> 413px height fix. */
const phonesShadowTeacher = (): ServicePhone[] => [
  {
    x: -105,
    y: 162,
    rotate: -30,
    width: 80,
    height: 165,
    screen: SCREEN,
    screenWebp: SCREEN_WEBP,
    z: 1,
  },
  {
    x: -8,
    y: 117,
    rotate: -30,
    width: 92,
    height: 190,
    screen: SCREEN_ALT,
    screenWebp: SCREEN_ALT_WEBP,
    z: 2,
  },
  {
    x: 90,
    y: 167,
    rotate: -30,
    width: 80,
    height: 165,
    screen: SCREEN,
    screenWebp: SCREEN_WEBP,
    z: 1,
  },
];

/** node 1110:26124 — three phones, all tilted the other direction (+30deg).
    y-shifted +106.5 to recenter for the card's 200px -> 413px height fix. */
const phonesRemoteSpecialist = (): ServicePhone[] => [
  {
    x: -90,
    y: 167,
    rotate: 30,
    width: 80,
    height: 165,
    screen: SCREEN,
    screenWebp: SCREEN_WEBP,
    z: 1,
  },
  {
    x: 8,
    y: 117,
    rotate: 30,
    width: 92,
    height: 190,
    screen: SCREEN_ALT,
    screenWebp: SCREEN_ALT_WEBP,
    z: 2,
  },
  {
    x: 105,
    y: 162,
    rotate: 30,
    width: 80,
    height: 165,
    screen: SCREEN,
    screenWebp: SCREEN_WEBP,
    z: 1,
  },
];

/** nodes 1110:26165 / 1110:26173 — wide bottom-row cards, three upright phones spread out.
    y-shifted +106.5 to recenter for the card's 200px -> 413px height fix. */
const phonesWideRow = (): ServicePhone[] => [
  {
    x: -190,
    y: 157,
    rotate: 0,
    width: 90,
    height: 185,
    screen: SCREEN,
    screenWebp: SCREEN_WEBP,
    z: 1,
  },
  {
    x: 0,
    y: 112,
    rotate: 0,
    width: 100,
    height: 205,
    screen: SCREEN_ALT,
    screenWebp: SCREEN_ALT_WEBP,
    z: 2,
  },
  {
    x: 190,
    y: 157,
    rotate: 0,
    width: 90,
    height: 185,
    screen: SCREEN,
    screenWebp: SCREEN_WEBP,
    z: 1,
  },
];

/** node 1110:26143 — single large upright phone, centered, no tilt (updated Figma design). */
const phonesHearingTest = (): ServicePhone[] => [
  {
    x: 0,
    y: 67,
    rotate: 0,
    width: 188,
    height: 390,
    screen: SCREEN,
    screenWebp: SCREEN_WEBP,
    z: 1,
  },
];

/** Two flanking phones per hub panel (node 1110:24728), one left one right of the notch. */
const phonesHub = (): ServicePhone[] => [
  {
    x: -169,
    y: 0,
    rotate: 0,
    width: 106,
    height: 220,
    screen: SCREEN,
    screenWebp: SCREEN_WEBP,
    z: 1,
  },
  {
    x: 169,
    y: 0,
    rotate: 0,
    width: 106,
    height: 220,
    screen: SCREEN,
    screenWebp: SCREEN_WEBP,
    z: 1,
  },
];

export const SERVICES: ServiceCard[] = [
  {
    id: 'growth-assessment',
    bentoKey: 'c1',
    title: 'تقييم مراحل النمو',
    icon: '/assets/icons/services-grid/icon-analytics-up.svg',
    iconAlt: '',
    bannerText: 'للتعرف على مراحل نمو طفلك والاطمئنان على تطوره النمائي خطوة بخطوة.',
    description: 'للتعرف على مراحل نمو طفلك والاطمئنان على تطوره النمائي خطوة بخطوة.',
    carouselMockup: `${MOCKUP_DIR}/growth-assessment.png`,
    carouselMockupWebp: `${MOCKUP_DIR}/growth-assessment.webp`,
    titleAccent: 'blue',
    mockupFlat: true,
    phones: phonesGrowthAssessment(),
  },
  {
    id: 'hearing-test',
    bentoKey: 'c2',
    title: 'فحص السمع',
    icon: '/assets/icons/services-grid/icon-ear.svg',
    iconAlt: '',
    bannerText: 'لتقييم قدرة طفلك على السمع مبكراً واكتشاف أي تأخر يؤثر على النطق والتواصل.',
    description:
      'للاطمئنان على حاسة السمع واكتشاف أي مشكلات محتملة مبكراً لضمان النمو اللغوي والاجتماعي السليم.',
    carouselMockup: `${MOCKUP_DIR}/hearing-test.png`,
    carouselMockupWebp: `${MOCKUP_DIR}/hearing-test.webp`,
    titleAccent: 'blue',
    mockupFlat: true,
    phones: phonesHearingTest(),
  },
  {
    id: 'remote-specialist',
    bentoKey: 'c3',
    title: 'جلسة استشارية مع أخصائي (عن بُعد)',
    icon: '/assets/icons/services-grid/icon-live-streaming.svg',
    iconAlt: '',
    bannerText: 'للتواصل مباشرة مع أخصائي مؤهل من أي مكان، والحصول على التوجيه المناسب لحالة طفلك.',
    description: 'فهم احتياجات طفلك الدقيقة ودعم تطوره اليومي من المنزل.',
    carouselMockup: `${MOCKUP_DIR}/remote-specialist.png`,
    carouselMockupWebp: `${MOCKUP_DIR}/remote-specialist.webp`,
    titleAccent: 'blue',
    heroImage: '/assets/img/services-grid/remote-specialist-visual.png',
    mockupFlat: true,
    phones: phonesRemoteSpecialist(),
  },
  {
    id: 'comprehensive-diagnosis',
    bentoKey: 'c5',
    title: 'خدمة التشخيص الشامل',
    icon: '/assets/icons/services-grid/icon-task.svg',
    iconAlt: '',
    bannerText: 'لتحديد احتياجات طفلك بدقة من خلال تقييم شامل يجمع بين عدة تخصصات.',
    description: 'تقييم متكامل ودقيق لحالة الطفل وتشخيص احتياجاته النمائية والسلوكية.',
    carouselMockup: `${MOCKUP_DIR}/comprehensive-diagnosis.png`,
    carouselMockupWebp: `${MOCKUP_DIR}/comprehensive-diagnosis.webp`,
    titleAccent: 'blue',
    phones: phonesHub(),
  },
  {
    id: 'therapy-programs',
    bentoKey: 'c6',
    title: 'البرامج العلاجية',
    icon: '/assets/icons/services-grid/icon-healthcare.svg',
    iconAlt: '',
    bannerText: 'لوضع خطة علاجية مخصصة تناسب احتياجات طفلك وتدعم تطوره خطوة بخطوة.',
    description: 'جلسات وبرامج متخصصة تُقدّم عن بُعد حضوري بالمنزل لتناسب أسلوب حياة أسرتك.',
    carouselMockup: `${MOCKUP_DIR}/therapy-programs.png`,
    carouselMockupWebp: `${MOCKUP_DIR}/therapy-programs.webp`,
    titleAccent: 'blue',
    phones: phonesHub(),
  },
  {
    id: 'doctor-consultation',
    bentoKey: 'c7',
    title: 'استشارة طبيب (حضوري / عن بُعد)',
    icon: '/assets/icons/services-grid/icon-doctor.svg',
    iconAlt: '',
    bannerText: 'لحجز استشارة طبية مع أفضل الأطباء، حضورياً أو عن بُعد، بما يناسبك.',
    description: 'استشارات متخصصة في تخصصات متعددة للاطمئنان الشامل على نمو وصحة الطفل.',
    carouselMockup: `${MOCKUP_DIR}/doctor-consultation.png`,
    carouselMockupWebp: `${MOCKUP_DIR}/doctor-consultation.webp`,
    titleAccent: 'blue',
    phones: phonesDoctorConsultation(),
  },
  {
    id: 'shadow-teacher',
    bentoKey: 'c4',
    title: 'خدمة معلم الظل',
    icon: '/assets/icons/services-grid/icon-user-star.svg',
    iconAlt: '',
    bannerText: 'لتوفير مرافق تعليمي متخصص يدعم طفلك داخل الصف ويعزز اندماجه.',
    description:
      'مرافقة مؤهلة للطفل من ذوي الإعاقة لمساعدته على التأقلم والاندماج داخل البيئة المدرسية.',
    carouselMockup: `${MOCKUP_DIR}/shadow-teacher.png`,
    carouselMockupWebp: `${MOCKUP_DIR}/shadow-teacher.webp`,
    titleAccent: 'blue',
    phones: phonesShadowTeacher(),
  },
  {
    id: 'nursery-picker',
    bentoKey: 'c8',
    title: 'اختيار الحضانة الأنسب',
    icon: '/assets/icons/services-grid/icon-rocking-horse.svg',
    iconAlt: '',
    bannerText: 'لمساعدتك على اختيار الحضانة الأنسب لاحتياجات طفلك من بين خيارات موثوقة.',
    description: 'نساعدك في اختيار الحضانة الأفضل والأقرب لطفلك لضمان بداية آمنة ومحفزة.',
    carouselMockup: `${MOCKUP_DIR}/nursery-picker.png`,
    carouselMockupWebp: `${MOCKUP_DIR}/nursery-picker.webp`,
    titleAccent: 'blue',
    phones: phonesWideRow(),
  },
  {
    id: 'daycare-centers',
    bentoKey: 'c9',
    title: 'مراكز الرعاية النهارية',
    icon: '/assets/icons/services-grid/icon-university.svg',
    iconAlt: '',
    bannerText: 'للتعرف على مراكز الرعاية النهارية المعتمدة القريبة منك ومقارنة خدماتها.',
    description: 'ترشيح واختيار أفضل وأقرب مراكز الرعاية النهارية المعتمدة لحالة طفلك.',
    carouselMockup: `${MOCKUP_DIR}/daycare-centers.png`,
    carouselMockupWebp: `${MOCKUP_DIR}/daycare-centers.webp`,
    titleAccent: 'blue',
    phones: phonesWideRow(),
  },
];

/**
 * Rail order for the features carousel — explicitly listed, not derived from
 * SERVICES' own order (§2 D3). The array above is sequenced for bento grid
 * placement (bentoKey c1–c9) and puts comprehensive-diagnosis and
 * therapy-programs ahead of doctor-consultation; indexing the rail by array
 * position would silently mis-order it.
 */
export const CAROUSEL_ORDER = [
  'growth-assessment', // 1 · تقييم مراحل النمو
  'hearing-test', // 2 · فحص السمع
  'remote-specialist', // 3 · جلسة استشارية مع أخصائي (عن بُعد)
  'doctor-consultation', // 4 · استشارة طبيب (حضوري / عن بُعد)
  'comprehensive-diagnosis', // 5 · خدمة التشخيص الشامل
  'therapy-programs', // 6 · البرامج العلاجية
  'shadow-teacher', // 7 · خدمة معلم الظل
  'nursery-picker', // 8 · اختيار الحضانة الأنسب
  'daycare-centers', // 9 · مراكز الرعاية النهارية
] as const;

/** SERVICES resolved into CAROUSEL_ORDER. Throws on an unknown id rather than
 * rendering a hole, so a typo fails at startup instead of at read time. */
export const CAROUSEL_FEATURES: ServiceCard[] = CAROUSEL_ORDER.map((id) => {
  const card = SERVICES.find((s) => s.id === id);
  if (!card) throw new Error(`CAROUSEL_ORDER references unknown service id: ${id}`);
  return card;
});

export const SERVICES_HEADLINE = {
  before: 'كل ما يحتاجه طفلك في مكان واحد، من ',
  highlight1: 'أول تقييم',
  middle: ' حتى ',
  highlight2: 'الدمج الكامل',
};
