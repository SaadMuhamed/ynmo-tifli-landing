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
    titleAccent: 'blue',
    phones: phonesWideRow(),
  },
];

export const SERVICES_HEADLINE = {
  before: 'كل ما يحتاجه طفلك في مكان واحد، من ',
  highlight1: 'أول تقييم',
  middle: ' حتى ',
  highlight2: 'الدمج الكامل',
};
