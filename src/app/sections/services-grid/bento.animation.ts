/**
 * Pure, framework-free animation model for the bento assembly-scroll effect.
 * See YNMO-TIFLI-FEATURES-BENTO-ANIMATION.md §4.3–§4.4 for the measured values.
 */

export type BentoKey = 'c1' | 'c2' | 'c3' | 'c4' | 'c5' | 'c6' | 'c7' | 'c8' | 'c9' | 'logo';
export type BentoRow = 'r1' | 'r2' | 'r3';

export interface Keyframe {
  at: number;
  dx: number;
  dy: number;
  s: number;
}

export interface Pose {
  dx: number;
  dy: number;
  s: number;
}

export interface BentoCardConfig {
  key: BentoKey;
  row: BentoRow;
  delay: number;
  zBump: 0 | 1;
  track: Keyframe[];
  /** 'top' pivots the scale from the card's top edge — the card unfurls
   * downward as it grows into place instead of scaling from its centre.
   * Used for the cards that fly in from a row's sides (dropdown feel). */
  originY?: 'top';
}

export const DURATION = 0.55;

export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
export const easeOutQuad = (t: number): number => 1 - Math.pow(1 - t, 2);

export const clamp = (v: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, v));

const rest = (dx: number, dy: number, s: number): Keyframe[] => [
  { at: 0, dx, dy, s },
  { at: 1, dx: 0, dy: 0, s: 1 },
];

/** §4.3 — measured off the storyboard artboards, stage px at 1440 width.
 * dx is horizontal displacement as drawn in the (LTR-authored) storyboard.
 * The page is dir="rtl", which mirrors the grid's flex column/row order —
 * every side-pair here (c1/c3, c4/c7, c8/c9) has its card content swapped
 * left↔right in the template to compensate, so dx stays as-authored. */
export const BENTO_CONFIG: Record<BentoKey, BentoCardConfig> = {
  c1: {
    key: 'c1',
    row: 'r1',
    delay: 0,
    zBump: 0,
    originY: 'top',
    track: [
      { at: 0, dx: -194, dy: -229, s: 1.971 },
      { at: 0.5, dx: -45, dy: -0.2, s: 1.26 },
      { at: 1, dx: 0, dy: 0, s: 1 },
    ],
  },
  c3: {
    key: 'c3',
    row: 'r1',
    delay: 0.04,
    zBump: 0,
    originY: 'top',
    track: [
      { at: 0, dx: 98.5, dy: -129.9, s: 1.494 },
      { at: 0.5, dx: 0.5, dy: -0.4, s: 1.003 },
      { at: 1, dx: 0, dy: 0, s: 1 },
    ],
  },
  c2: { key: 'c2', row: 'r1', delay: 0.3, zBump: 1, track: rest(0, 336.75, 1.565) },
  c4: {
    key: 'c4',
    row: 'r2',
    delay: 0,
    zBump: 0,
    originY: 'top',
    track: rest(-178, -0.25, 1.59),
  },
  c7: {
    key: 'c7',
    row: 'r2',
    delay: 0.04,
    zBump: 0,
    originY: 'top',
    track: rest(204, -14.2, 1.74),
  },
  logo: { key: 'logo', row: 'r2', delay: 0.08, zBump: 0, track: rest(0, 0, 0.575) },
  c5: { key: 'c5', row: 'r2', delay: 0.3, zBump: 1, track: rest(2.6, -67.34, 1.657) },
  c6: { key: 'c6', row: 'r2', delay: 0.36, zBump: 1, track: rest(0.5, 64.75, 1.648) },
  c8: {
    key: 'c8',
    row: 'r3',
    delay: 0,
    zBump: 0,
    originY: 'top',
    track: rest(-293.5, 158.5, 1.385),
  },
  c9: {
    key: 'c9',
    row: 'r3',
    delay: 0.05,
    zBump: 0,
    originY: 'top',
    track: rest(294.6, 228.0, 1.562),
  },
};

/** Simplified sub-1024 fallback (build plan §8, ≤767 rule reused for the whole
 * below-1024 range here — see handoff note): fade + rise, no scale, no dx. */
export const BENTO_CONFIG_REDUCED: Record<BentoKey, BentoCardConfig> = Object.fromEntries(
  Object.entries(BENTO_CONFIG).map(([key, cfg]) => [
    key,
    { ...cfg, delay: cfg.delay / 2, track: rest(0, 24, 1) },
  ]),
) as Record<BentoKey, BentoCardConfig>;

export const DURATION_REDUCED = 0.45;

/** Samples a (possibly multi-segment) track at progress p ∈ [0, 1], easing
 * each segment independently with easeOutCubic. */
export function sampleTrack(track: Keyframe[], p: number): Pose {
  const clamped = clamp(p, 0, 1);
  let k0 = track[0];
  let k1 = track[track.length - 1];
  for (let i = 0; i < track.length - 1; i++) {
    if (clamped >= track[i].at && clamped <= track[i + 1].at) {
      k0 = track[i];
      k1 = track[i + 1];
      break;
    }
  }
  const span = k1.at - k0.at;
  const t = span > 0 ? easeOutCubic((clamped - k0.at) / span) : 1;
  return {
    dx: k0.dx + (k1.dx - k0.dx) * t,
    dy: k0.dy + (k1.dy - k0.dy) * t,
    s: k0.s + (k1.s - k0.s) * t,
  };
}
