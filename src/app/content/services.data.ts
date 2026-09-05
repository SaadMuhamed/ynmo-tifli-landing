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
  /** 'banner' shows a description strip instead of the small circular badge (card 1 only) */
  badge: 'icon' | 'banner';
  bannerText?: string;
  phones: ServicePhone[];
}

const SCREEN = '/assets/img/services-grid/screen.png';
const SCREEN_WEBP = '/assets/img/services-grid/screen.webp';
const SCREEN_ALT = '/assets/img/services-grid/frame-mask.png';
const SCREEN_ALT_WEBP = '/assets/img/services-grid/frame-mask.webp';

/** Two-phone fan, used by the taller cards (growth eval / doctor consult). */
const phonesTall = (): ServicePhone[] => [
  {
    x: -34,
    y: 8,
    rotate: -8,
    width: 132,
    height: 272,
    screen: SCREEN,
    screenWebp: SCREEN_WEBP,
    z: 1,
  },
  {
    x: 30,
    y: 22,
    rotate: 6,
    width: 118,
    height: 244,
    screen: SCREEN_ALT,
    screenWebp: SCREEN_ALT_WEBP,
    z: 2,
  },
];

/** Three-phone fan, used by the standard 200px-tall cards. */
const phonesShort = (mirror = false): ServicePhone[] => {
  const s = mirror ? -1 : 1;
  return [
    {
      x: -78 * s,
      y: 30,
      rotate: -18 * s,
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
      x: 82 * s,
      y: 34,
      rotate: 20 * s,
      width: 82,
      height: 168,
      screen: SCREEN,
      screenWebp: SCREEN_WEBP,
      z: 1,
    },
  ];
};

export const SERVICES: ServiceCard[] = [
  {
    id: 'growth-assessment',
    title: 'تقييم مراحل النمو',
    icon: '/assets/icons/services-grid/icon-analytics-up.svg',
    iconAlt: '',
    badge: 'banner',
    bannerText: 'للتعرف على مراحل نمو طفلك والاطمئنان على تطوره النمائي خطوة بخطوة.',
    phones: phonesTall(),
  },
  {
    id: 'hearing-test',
    title: 'فحص السمع',
    icon: '/assets/icons/services-grid/icon-ear.svg',
    iconAlt: '',
    badge: 'icon',
    phones: phonesShort(),
  },
  {
    id: 'remote-specialist',
    title: 'جلسة استشارية مع أخصائي (عن بُعد)',
    icon: '/assets/icons/services-grid/icon-live-streaming.svg',
    iconAlt: '',
    badge: 'icon',
    phones: phonesShort(true),
  },
  {
    id: 'comprehensive-diagnosis',
    title: 'خدمة التشخيص الشامل',
    icon: '/assets/icons/services-grid/icon-task.svg',
    iconAlt: '',
    badge: 'icon',
    phones: phonesShort(),
  },
  {
    id: 'therapy-programs',
    title: 'البرامج العلاجية',
    icon: '/assets/icons/services-grid/icon-healthcare.svg',
    iconAlt: '',
    badge: 'icon',
    phones: phonesShort(true),
  },
  {
    id: 'doctor-consultation',
    title: 'استشارة طبيب (حضوري / عن بُعد)',
    icon: '/assets/icons/services-grid/icon-doctor.svg',
    iconAlt: '',
    badge: 'icon',
    phones: phonesTall(),
  },
  {
    id: 'shadow-teacher',
    title: 'خدمة معلم الظل',
    icon: '/assets/icons/services-grid/icon-user-star.svg',
    iconAlt: '',
    badge: 'icon',
    phones: phonesShort(),
  },
  {
    id: 'nursery-picker',
    title: 'اختيار الحضانة الأنسب',
    icon: '/assets/icons/services-grid/icon-rocking-horse.svg',
    iconAlt: '',
    badge: 'icon',
    phones: phonesShort(),
  },
  {
    id: 'daycare-centers',
    title: 'مراكز الرعاية النهارية',
    icon: '/assets/icons/services-grid/icon-university.svg',
    iconAlt: '',
    badge: 'icon',
    phones: phonesShort(true),
  },
];

export const SERVICES_HEADLINE = {
  before: 'كل ما يحتاجه طفلك في مكان واحد، من ',
  highlight1: 'أول تقييم',
  middle: ' حتى ',
  highlight2: 'الدمج الكامل',
};
