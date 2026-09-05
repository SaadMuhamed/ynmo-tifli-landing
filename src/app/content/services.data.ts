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
  title: string;
  icon: string;
  iconAlt: string;
  /** shown in the description tooltip that reveals on badge hover/focus */
  bannerText: string;
  phones: ServicePhone[];
}

const SCREEN = '/assets/img/services-grid/screen.png';
const SCREEN_WEBP = '/assets/img/services-grid/screen.webp';
const SCREEN_ALT = '/assets/img/services-grid/frame-mask.png';
const SCREEN_ALT_WEBP = '/assets/img/services-grid/frame-mask.webp';

/** node 1110:26097 — two large upright overlapping phones. */
const phonesGrowthAssessment = (): ServicePhone[] => [
  {
    x: -48,
    y: 15,
    rotate: 0,
    width: 148,
    height: 305,
    screen: SCREEN,
    screenWebp: SCREEN_WEBP,
    z: 1,
  },
  {
    x: 50,
    y: 58,
    rotate: 0,
    width: 130,
    height: 265,
    screen: SCREEN_ALT,
    screenWebp: SCREEN_ALT_WEBP,
    z: 2,
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

/** node 1110:26114 — three phones, all tilted the same direction (-30deg). */
const phonesShadowTeacher = (): ServicePhone[] => [
  {
    x: -105,
    y: 55,
    rotate: -30,
    width: 80,
    height: 165,
    screen: SCREEN,
    screenWebp: SCREEN_WEBP,
    z: 1,
  },
  {
    x: -8,
    y: 10,
    rotate: -30,
    width: 92,
    height: 190,
    screen: SCREEN_ALT,
    screenWebp: SCREEN_ALT_WEBP,
    z: 2,
  },
  {
    x: 90,
    y: 60,
    rotate: -30,
    width: 80,
    height: 165,
    screen: SCREEN,
    screenWebp: SCREEN_WEBP,
    z: 1,
  },
];

/** node 1110:26124 — three phones, all tilted the other direction (+30deg). */
const phonesRemoteSpecialist = (): ServicePhone[] => [
  {
    x: -90,
    y: 60,
    rotate: 30,
    width: 80,
    height: 165,
    screen: SCREEN,
    screenWebp: SCREEN_WEBP,
    z: 1,
  },
  {
    x: 8,
    y: 10,
    rotate: 30,
    width: 92,
    height: 190,
    screen: SCREEN_ALT,
    screenWebp: SCREEN_ALT_WEBP,
    z: 2,
  },
  {
    x: 105,
    y: 55,
    rotate: 30,
    width: 80,
    height: 165,
    screen: SCREEN,
    screenWebp: SCREEN_WEBP,
    z: 1,
  },
];

/** nodes 1110:26165 / 1110:26173 — wide bottom-row cards, three upright phones spread out. */
const phonesWideRow = (): ServicePhone[] => [
  {
    x: -190,
    y: 50,
    rotate: 0,
    width: 90,
    height: 185,
    screen: SCREEN,
    screenWebp: SCREEN_WEBP,
    z: 1,
  },
  {
    x: 0,
    y: 5,
    rotate: 0,
    width: 100,
    height: 205,
    screen: SCREEN_ALT,
    screenWebp: SCREEN_ALT_WEBP,
    z: 2,
  },
  {
    x: 190,
    y: 50,
    rotate: 0,
    width: 90,
    height: 185,
    screen: SCREEN,
    screenWebp: SCREEN_WEBP,
    z: 1,
  },
];

/** node 1110:26143 — hearing test's own three-phone fan. */
const phonesHearingTest = (): ServicePhone[] => [
  {
    x: -78,
    y: 30,
    rotate: -18,
    width: 82,
    height: 168,
    screen: SCREEN,
    screenWebp: SCREEN_WEBP,
    z: 1,
  },
  {
    x: 0,
    y: 6,
    rotate: 0,
    width: 96,
    height: 196,
    screen: SCREEN_ALT,
    screenWebp: SCREEN_ALT_WEBP,
    z: 3,
  },
  {
    x: 82,
    y: 34,
    rotate: 20,
    width: 82,
    height: 168,
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
    title: 'تقييم مراحل النمو',
    icon: '/assets/icons/services-grid/icon-analytics-up.svg',
    iconAlt: '',
    bannerText: 'للتعرف على مراحل نمو طفلك والاطمئنان على تطوره النمائي خطوة بخطوة.',
    phones: phonesGrowthAssessment(),
  },
  {
    id: 'hearing-test',
    title: 'فحص السمع',
    icon: '/assets/icons/services-grid/icon-ear.svg',
    iconAlt: '',
    bannerText: 'لتقييم قدرة طفلك على السمع مبكراً واكتشاف أي تأخر يؤثر على النطق والتواصل.',
    phones: phonesHearingTest(),
  },
  {
    id: 'remote-specialist',
    title: 'جلسة استشارية مع أخصائي (عن بُعد)',
    icon: '/assets/icons/services-grid/icon-live-streaming.svg',
    iconAlt: '',
    bannerText: 'للتواصل مباشرة مع أخصائي مؤهل من أي مكان، والحصول على التوجيه المناسب لحالة طفلك.',
    phones: phonesRemoteSpecialist(),
  },
  {
    id: 'comprehensive-diagnosis',
    title: 'خدمة التشخيص الشامل',
    icon: '/assets/icons/services-grid/icon-task.svg',
    iconAlt: '',
    bannerText: 'لتحديد احتياجات طفلك بدقة من خلال تقييم شامل يجمع بين عدة تخصصات.',
    phones: phonesHub(),
  },
  {
    id: 'therapy-programs',
    title: 'البرامج العلاجية',
    icon: '/assets/icons/services-grid/icon-healthcare.svg',
    iconAlt: '',
    bannerText: 'لوضع خطة علاجية مخصصة تناسب احتياجات طفلك وتدعم تطوره خطوة بخطوة.',
    phones: phonesHub(),
  },
  {
    id: 'doctor-consultation',
    title: 'استشارة طبيب (حضوري / عن بُعد)',
    icon: '/assets/icons/services-grid/icon-doctor.svg',
    iconAlt: '',
    bannerText: 'لحجز استشارة طبية مع أفضل الأطباء، حضورياً أو عن بُعد، بما يناسبك.',
    phones: phonesDoctorConsultation(),
  },
  {
    id: 'shadow-teacher',
    title: 'خدمة معلم الظل',
    icon: '/assets/icons/services-grid/icon-user-star.svg',
    iconAlt: '',
    bannerText: 'لتوفير مرافق تعليمي متخصص يدعم طفلك داخل الصف ويعزز اندماجه.',
    phones: phonesShadowTeacher(),
  },
  {
    id: 'nursery-picker',
    title: 'اختيار الحضانة الأنسب',
    icon: '/assets/icons/services-grid/icon-rocking-horse.svg',
    iconAlt: '',
    bannerText: 'لمساعدتك على اختيار الحضانة الأنسب لاحتياجات طفلك من بين خيارات موثوقة.',
    phones: phonesWideRow(),
  },
  {
    id: 'daycare-centers',
    title: 'مراكز الرعاية النهارية',
    icon: '/assets/icons/services-grid/icon-university.svg',
    iconAlt: '',
    bannerText: 'للتعرف على مراكز الرعاية النهارية المعتمدة القريبة منك ومقارنة خدماتها.',
    phones: phonesWideRow(),
  },
];

export const SERVICES_HEADLINE = {
  before: 'كل ما يحتاجه طفلك في مكان واحد، من ',
  highlight1: 'أول تقييم',
  middle: ' حتى ',
  highlight2: 'الدمج الكامل',
};
