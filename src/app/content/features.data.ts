export interface FeatureScene {
  /** 1-based, matches the rail order top → bottom */
  index: number;
  /** Arabic title, right of the app icon */
  titleAr: string;
  /** 96px app-icon tile glyph, 64px, brand colour */
  appIcon: string;
  /** rail chip glyph — two exports: outline (inactive) + solid (active) */
  chipIconOff: string;
  chipIconOn: string;
  /** pre-composed phone-cluster artwork, transparent PNG */
  scene: string;
  sceneWebp: string;
  /** alt text for the scene, Arabic */
  sceneAlt: string;
}

/**
 * S03 — Feature scroll (node 956:11265). Blocker B-1: only scene 1 is
 * locked/designed (title + artwork). Scenes 2–9 use the plan's §8.2
 * proposed titles and scene 1's artwork/rail-container styling as a
 * stand-in — swapping in the real per-scene art is a one-line change per
 * row here once B-1 is resolved. Rail icon glyphs for scenes 2–9 are real
 * (cropped from Figma's own rendered chips, since their vector export
 * collapsed to a shared placeholder), but only in their muted/outline
 * form — no distinct "active" colour variant exists yet, so chipIconOn
 * reuses the same file and the active/inactive contrast comes from the
 * chip container's own background/border per §8.3, not the glyph.
 */
export const FEATURES: FeatureScene[] = [
  {
    index: 1,
    titleAr: 'تقييم مراحل النمو',
    appIcon: '/assets/icons/feature-scroll/app-icon-1.svg',
    chipIconOff: '/assets/icons/feature-scroll/chip-icon-1-off.svg',
    chipIconOn: '/assets/icons/feature-scroll/chip-icon-1-on.svg',
    scene: '/assets/img/features/scene-01.png',
    sceneWebp: '/assets/img/features/scene-01.webp',
    sceneAlt: 'شاشات تطبيق ينمو طفلي تعرض تقييم مراحل النمو',
  },
  {
    index: 2,
    titleAr: 'فحص السمع',
    appIcon: '/assets/icons/feature-scroll/app-icon-1.svg',
    chipIconOff: '/assets/icons/feature-scroll/chip-icon-2.png',
    chipIconOn: '/assets/icons/feature-scroll/chip-icon-2.png',
    scene: '/assets/img/features/scene-01.png',
    sceneWebp: '/assets/img/features/scene-01.webp',
    sceneAlt: 'شاشات تطبيق ينمو طفلي تعرض فحص السمع',
  },
  {
    index: 3,
    titleAr: 'جلسة مع أخصائي (عن بُعد)',
    appIcon: '/assets/icons/feature-scroll/app-icon-1.svg',
    chipIconOff: '/assets/icons/feature-scroll/chip-icon-3.png',
    chipIconOn: '/assets/icons/feature-scroll/chip-icon-3.png',
    scene: '/assets/img/features/scene-01.png',
    sceneWebp: '/assets/img/features/scene-01.webp',
    sceneAlt: 'شاشات تطبيق ينمو طفلي تعرض جلسة مع أخصائي عن بُعد',
  },
  {
    index: 4,
    titleAr: 'استشارة مع طبيب',
    appIcon: '/assets/icons/feature-scroll/app-icon-1.svg',
    chipIconOff: '/assets/icons/feature-scroll/chip-icon-4.png',
    chipIconOn: '/assets/icons/feature-scroll/chip-icon-4.png',
    scene: '/assets/img/features/scene-01.png',
    sceneWebp: '/assets/img/features/scene-01.webp',
    sceneAlt: 'شاشات تطبيق ينمو طفلي تعرض استشارة مع طبيب',
  },
  {
    index: 5,
    titleAr: 'التشخيص وخطة التدخل',
    appIcon: '/assets/icons/feature-scroll/app-icon-1.svg',
    chipIconOff: '/assets/icons/feature-scroll/chip-icon-5.png',
    chipIconOn: '/assets/icons/feature-scroll/chip-icon-5.png',
    scene: '/assets/img/features/scene-01.png',
    sceneWebp: '/assets/img/features/scene-01.webp',
    sceneAlt: 'شاشات تطبيق ينمو طفلي تعرض التشخيص وخطة التدخل',
  },
  {
    index: 6,
    titleAr: 'البرامج العلاجية',
    appIcon: '/assets/icons/feature-scroll/app-icon-1.svg',
    chipIconOff: '/assets/icons/feature-scroll/chip-icon-6.png',
    chipIconOn: '/assets/icons/feature-scroll/chip-icon-6.png',
    scene: '/assets/img/features/scene-01.png',
    sceneWebp: '/assets/img/features/scene-01.webp',
    sceneAlt: 'شاشات تطبيق ينمو طفلي تعرض البرامج العلاجية',
  },
  {
    index: 7,
    titleAr: 'معلم ظل',
    appIcon: '/assets/icons/feature-scroll/app-icon-1.svg',
    chipIconOff: '/assets/icons/feature-scroll/chip-icon-7.png',
    chipIconOn: '/assets/icons/feature-scroll/chip-icon-7.png',
    scene: '/assets/img/features/scene-01.png',
    sceneWebp: '/assets/img/features/scene-01.webp',
    sceneAlt: 'شاشات تطبيق ينمو طفلي تعرض خدمة معلم الظل',
  },
  {
    index: 8,
    titleAr: 'الحضانات',
    appIcon: '/assets/icons/feature-scroll/app-icon-1.svg',
    chipIconOff: '/assets/icons/feature-scroll/chip-icon-8.png',
    chipIconOn: '/assets/icons/feature-scroll/chip-icon-8.png',
    scene: '/assets/img/features/scene-01.png',
    sceneWebp: '/assets/img/features/scene-01.webp',
    sceneAlt: 'شاشات تطبيق ينمو طفلي تعرض الحضانات',
  },
  {
    index: 9,
    titleAr: 'البيئة والدمج المساند',
    appIcon: '/assets/icons/feature-scroll/app-icon-1.svg',
    chipIconOff: '/assets/icons/feature-scroll/chip-icon-9.png',
    chipIconOn: '/assets/icons/feature-scroll/chip-icon-9.png',
    scene: '/assets/img/features/scene-01.png',
    sceneWebp: '/assets/img/features/scene-01.webp',
    sceneAlt: 'شاشات تطبيق ينمو طفلي تعرض البيئة والدمج المساند',
  },
];

export const FEATURES_HEADLINE = {
  before: 'كل ما يحتاجه طفلك في مكان واحد، من ',
  highlight1: 'أول تقييم',
  middle: ' حتى ',
  highlight2: 'الدمج الكامل',
};

export const FEATURES_UI = {
  planeAriaLabel: 'شاشات تطبيق ينمو طفلي',
};
