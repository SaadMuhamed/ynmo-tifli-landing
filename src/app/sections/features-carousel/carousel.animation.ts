/**
 * Pure, framework-free motion model for the pinned features carousel.
 * See YNMO-TIFLI-FEATURES-CAROUSEL-BUILD.md §3 for the derivation.
 *
 * Every visual property is a continuous function of one scalar, T — the
 * global timeline in units of one-per-feature. Nothing here touches the DOM,
 * holds state, or branches on scroll direction: reverse scroll is just a
 * decreasing T, so it reverses exactly for free (§2 D2).
 */

export interface Pose {
  /** physical px along the stage's x axis — NOT direction-aware (§8 RTL) */
  x: number;
  scale: number;
  opacity: number;
  /** false → the component skips compositing this layer entirely */
  visible: boolean;
}

export interface HeadPose {
  opacity: number;
  y: number;
}

// ---------------------------------------------------------------------------
// §3.4 carousel constants — read off the Figma motion export, not estimated.
// ---------------------------------------------------------------------------

/** px at the STAGE_WIDTH-wide design stage (the mockup ZONE, not the whole
 * column — see STAGE_WIDTH), one slot step.
 *
 * Deliberately overridden from the literal Figma export (194.51385) per
 * explicit request: the side mockups must sit mostly BEHIND the centre one
 * — HIDDEN_FRACTION of each side mockup's own (scaled) width hidden under
 * it, rather than sitting apart at arm's length. For a hidden fraction f,
 * the visible sliver of the side mockup satisfies
 *   f·Ws = Wc/2 - step + Ws/2  ⇒  step = Wc/2 + Ws·(0.5 - f), Ws = SIDE_SCALE·Wc
 * at this file's own centre-mockup design width (features-carousel.scss'
 * $mockup-zone-fill · STAGE_WIDTH) — note step SHRINKS as f grows (more
 * hidden ⇒ less separation needed, not more); recompute whenever f, the
 * fill fraction, or STAGE_WIDTH changes.
 *
 * f was bumped from an initial 0.25 to 0.5 per explicit follow-up request
 * ("hide the half of them"). Because a bigger f pulls the mockups CLOSER
 * together, not further apart, this made room to also satisfy a second,
 * previously-conflicting request in the same round: zero spill of the
 * R-slot's slide into the head zone beside it (x is physical, §8 — doesn't
 * mirror under RTL). An earlier pass at f = 0.25 had let that slide reach
 * ~144px into the head zone, relying on .fcar__head's z-index to keep the
 * text readable underneath — which still read as crowded, so
 * $mockup-zone-fill was retuned alongside this constant to remove the
 * spill outright rather than just paint over it; see that variable's own
 * doc comment for the full budget. */
export const SLOT_STEP = 164.8581669296211;
/** side mockup ÷ centre mockup */
export const SIDE_SCALE = 0.7712195;
/** side → centre (1 / SIDE_SCALE) */
export const GROW_MULT = 1.2966477;
/** side → exit/birth extreme (0.60 × centre) */
export const SHRINK_MULT = 0.7779886;
export const OPACITY_SIDE = 0.35;
/** px — rail tile 48 + gap 16 */
export const TILE_PITCH = 64;
/** Design authoring width of the MOCKUP ZONE — not the whole column. Head
 * and mockup sit side by side (features-carousel.scss' .fcar__head /
 * .fcar__mockup), so `.fcar__stage` (what features-carousel.ts actually
 * measures into `stageWidth`) is sized to just the mockup zone: a 1068px
 * column minus that file's $fcar-head-zone-w (420) and $fcar-zone-gap (64)
 * leaves 584. SLOT_STEP scales by (actualStageWidth / STAGE_WIDTH). */
export const STAGE_WIDTH = 584;

export const DEFAULT_COUNT = 9;

// ---------------------------------------------------------------------------
// §3.2 beat map — all windows are in p, the within-feature progress.
// ---------------------------------------------------------------------------

export const RING_FILL_START = 0.1;
export const RING_FILL_END = 0.8;
/** The 0.80 → 0.81 gap is deliberate: the carousel must never start moving
 * before the ring has closed. */
export const HANDOFF_START = 0.81;
export const HANDOFF_END = 0.97;

export const ICON_IN_OPACITY: readonly [number, number] = [0.0, 0.05];
export const ICON_IN_MOVE: readonly [number, number] = [0.0, 0.08];

/** Window (T offset from the arriving feature's own index) the mockup fades
 * from OPACITY_SIDE to full opacity while becoming the centre layer — same
 * offset the position/scale slide itself runs on (HANDOFF_START - 1), so
 * the two are one continuous motion rather than the mockup arriving fully
 * formed and then fading. */
export const MOCKUP_ENTER_START = HANDOFF_START - 1;

/** Explicit request: the head (icon + title + description) must fade in
 * WHILE the incoming mockup is still sliding into the centre, not sit
 * blank until the slide has already finished — it used to start only at
 * T = index (p = 0.06 for the text specifically), well after the slide
 * (which runs index-0.19 → index-0.03) had already completed, reading as a
 * dead gap with nothing on screen. Starting here — the same offset the
 * mockup's own fade-in and the slide both use — means the head, the slide,
 * and the mockup's fade-in all run as one continuous motion. */
export const TEXT_IN_OPACITY: readonly [number, number] = [MOCKUP_ENTER_START, 0.11];
export const TEXT_IN_MOVE: readonly [number, number] = [MOCKUP_ENTER_START, 0.14];

export const MOCKUP_ENTER_END = TEXT_IN_OPACITY[1];
export const HEAD_OUT_OPACITY: readonly [number, number] = [0.81, 0.91];
export const HEAD_OUT_MOVE: readonly [number, number] = [0.81, 0.93];

/** px the head travels on enter (from) and exit (to) */
export const HEAD_TRAVEL = 40;

// ---------------------------------------------------------------------------
// §3.3 easing — lifted from the Figma export so this section matches the site.
// ---------------------------------------------------------------------------

export const E_ENTER_OPACITY = [0.5, 0, 0.5, 1] as const;
export const E_ENTER_MOVE = [0.05, 0.4, 0.5, 1] as const;
export const E_EXIT_OPACITY = [0.6, 0, 0.5, 0.9] as const;
export const E_EXIT_MOVE = [0.5, 0, 0.7, 0.7] as const;
export const E_SHUFFLE = [0.65, 0, 0.35, 1] as const;

export const clamp = (v: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, v));

/** Linear 0→1 ramp across [a, b], clamped outside. b <= a snaps to 1 at/after a. */
export const ramp = (v: number, a: number, b: number): number =>
  b <= a ? (v >= a ? 1 : 0) : clamp((v - a) / (b - a), 0, 1);

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/**
 * Cubic-bezier sampler, CSS semantics: P0 = (0,0), P3 = (1,1), the two
 * control points are the arguments. Returns y for a given x by solving
 * x(t) = x with Newton-Raphson (8 iterations, §3.3) then evaluating y(t).
 *
 * Returned as a closure so callers hoist one sampler per curve instead of
 * re-deriving coefficients every frame.
 */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
  // Polynomial coefficients for B(t) with P0 = 0, P3 = 1.
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t: number): number => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number): number => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t: number): number => (3 * ax * t + 2 * bx) * t + cx;

  return (x: number): number => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const dx = sampleX(t) - x;
      if (Math.abs(dx) < 1e-6) break;
      const d = sampleDX(t);
      // Flat tangent — Newton would divide by ~0 and shoot off the curve.
      // Bisect instead of returning a wrong root.
      if (Math.abs(d) < 1e-6) {
        let lo = 0;
        let hi = 1;
        for (let j = 0; j < 20; j++) {
          t = (lo + hi) / 2;
          if (sampleX(t) < x) lo = t;
          else hi = t;
        }
        break;
      }
      t -= dx / d;
    }
    return sampleY(clamp(t, 0, 1));
  };
}

const easeEnterOpacity = cubicBezier(...E_ENTER_OPACITY);
const easeEnterMove = cubicBezier(...E_ENTER_MOVE);
const easeExitOpacity = cubicBezier(...E_EXIT_OPACITY);
const easeExitMove = cubicBezier(...E_EXIT_MOVE);
const easeShuffle = cubicBezier(...E_SHUFFLE);

// ---------------------------------------------------------------------------
// §3.1 timeline decomposition
// ---------------------------------------------------------------------------

/**
 * The last feature has nothing to hand off to: freezing the timeline at the
 * instant its handoff would have begun leaves it centred, full-size, full
 * opacity, ring closed, and holds there until the pin releases. That is
 * §6 defect 6 ("the last mockup slides away") and §3.6's "hold translateY"
 * handled once, for every function below, instead of four `isLast` branches.
 */
export function effectiveT(T: number, count = DEFAULT_COUNT): number {
  // Upper bound only. Clamping the low end too would collapse T < 0 onto the
  // rest state, which breaks poseFor(i, i - 1) for i = 0 — that must still
  // report the R pose (§9.2), and the function has to stay well-defined
  // across the whole real line, not just the pinned range.
  return Math.min(T, count - 1 + HANDOFF_START);
}

/** Current feature index — floor(T) clamped to the last feature. */
export function activeIndex(T: number, count = DEFAULT_COUNT): number {
  return clamp(Math.floor(effectiveT(T, count)), 0, count - 1);
}

/** Progress within the active feature, 0 → 1. */
export function featureProgress(T: number, count = DEFAULT_COUNT): number {
  const t = effectiveT(T, count);
  return clamp(t - activeIndex(T, count), 0, 1);
}

/** Shuffle progress: 0 before the handoff, 1 after, eased between (§3.5). */
function shuffle(p: number): number {
  return easeShuffle(ramp(p, HANDOFF_START, HANDOFF_END));
}

// ---------------------------------------------------------------------------
// §3.5 mockup poses
// ---------------------------------------------------------------------------

/** Reference pose for a layer sitting `k` slots ahead of the active feature. */
function slotPose(k: number, step: number): { x: number; scale: number; opacity: number } {
  // The two out-of-range directions are NOT the same pose, and collapsing
  // them into one `default` is a live bug: a layer that has already exited
  // left would interpolate back toward the stage centre. It happens at
  // opacity 0 so nothing shows, but it makes x discontinuous and feeds
  // garbage positions to anything reading the pose.
  if (k <= -2) return { x: -2 * step, scale: SIDE_SCALE * SHRINK_MULT, opacity: 0 };
  // Birth (k = 2) and beyond: parked at the stage centre, shrunk, invisible.
  // Birth travels *right* to the R slot while every other layer travels
  // left — that crossing is the intended "emerging from behind" read (§3.5).
  // It sits behind everything in z.
  if (k >= 2) return { x: 0, scale: SIDE_SCALE * SHRINK_MULT, opacity: 0 };

  switch (k) {
    case -1:
      return { x: -step, scale: SIDE_SCALE, opacity: OPACITY_SIDE };
    case 0:
      return { x: 0, scale: 1, opacity: 1 };
    default:
      return { x: step, scale: SIDE_SCALE, opacity: OPACITY_SIDE };
  }
}

/**
 * Pose for mockup `index` at timeline position `T`, on a stage `stageWidth`
 * px wide (SLOT_STEP scales proportionally off STAGE_WIDTH).
 *
 * One continuous function of the offset d = index − T, rather than per-slot
 * bookkeeping — which is what makes reverse scroll free and the handoff
 * continuous (acceptance 3).
 *
 * A layer that sits `k` slots ahead at p = 0 holds that pose through the
 * dwell and moves to slot `k − 1` across the handoff, so with d = k − p:
 *   k = ceil(d), p = k − d, pose = lerp(slot k, slot k−1, shuffle(p))
 */
export function poseFor(index: number, T: number, stageWidth = STAGE_WIDTH, count = DEFAULT_COUNT): Pose {
  const step = SLOT_STEP * (stageWidth / STAGE_WIDTH);
  const effT = effectiveT(T, count);
  const d = index - effT;

  const k = Math.ceil(d);
  const t = shuffle(k - d);
  const a = slotPose(k, step);
  const b = slotPose(k - 1, step);

  let opacity = lerp(a.opacity, b.opacity, t);

  // Retime opacity — ONLY opacity, x/scale keep the line above untouched —
  // for this index's approach into and arrival at the centre slot. offset is
  // continuous through the k boundary (it is the same `effT - index` on both
  // sides), so this replacement lines up exactly with the flat OPACITY_SIDE
  // before it and the flat 1 after it: no seam. k === 1 is the entire
  // previous feature's dwell (this index sitting in R, offset ranging -1…0);
  // k === 0 is this index's own dwell (offset 0…1) — gated to
  // offset < MOCKUP_ENTER_END there so the OWN exit transition later in that
  // same dwell (offset > HANDOFF_START) is left to the line above.
  if (k === 1 || (k === 0 && -d < MOCKUP_ENTER_END)) {
    const offset = -d; // = effT - index
    opacity = lerp(OPACITY_SIDE, 1, easeEnterOpacity(ramp(offset, MOCKUP_ENTER_START, MOCKUP_ENTER_END)));
  }

  return {
    x: lerp(a.x, b.x, t),
    scale: lerp(a.scale, b.scale, t),
    opacity,
    // Tighter than §3.5's stated |d| > 2.2 cutoff, deliberately: an open
    // interval of width 4.4 contains five integers at some T, which would
    // composite five layers and fail acceptance 7. Everything this
    // additionally hides is already at opacity 0, so nothing is lost.
    visible: opacity > 0,
  };
}

/**
 * Which slot mockup `index` currently occupies, as a z-index — "static,
 * never animated" (§3.5's own phrasing for the bottom→top Birth·L·R·C
 * order) means never INTERPOLATED between layers, not fixed to one index
 * forever: this still has to be recomputed as k crosses each integer
 * boundary, or every feature past the first two would tie at the same
 * value and fall back to DOM order for who paints on top — which one of
 * those wins is arbitrary there, so "the wrong one happened to be
 * later in the DOM" is a real bug, not a fluke of one specific feature
 * (explicit report: peeking side mockups painting OVER the centre one).
 * features-carousel.scss' own [data-feature='0']/[data-feature='1'] rest-
 * state rules only ever covered k landing on exactly those two DOM
 * indices — coincidentally correct only for T's very first dwell.
 */
export function mockupZIndex(index: number, T: number, count = DEFAULT_COUNT): number {
  const k = Math.ceil(index - effectiveT(T, count));
  if (k === 0) return 4; // C — centre/front
  if (k === 1) return 3; // R — next, peeking
  if (k === -1) return 2; // L — previous, exiting
  return 1; // birth/exit extremes, already opacity 0 regardless
}

// ---------------------------------------------------------------------------
// §3.7 head (title + description + app icon)
// ---------------------------------------------------------------------------

/** Shared enter/exit envelope; `inOpacity`/`inMove` select the stagger. */
function headEnvelope(
  index: number,
  T: number,
  count: number,
  inOpacity: readonly [number, number],
  inMove: readonly [number, number],
): HeadPose {
  const p = effectiveT(T, count) - index;
  // Outside its own unit the head is fully gone. The exit finishes at 0.93,
  // so p >= 1 is safely past it; below MOCKUP_ENTER_START the mockup's own
  // slide hasn't started yet either, so there is nothing to sync with —
  // widened from a flat 0 specifically so TEXT_IN_OPACITY's start there
  // (see that constant's own doc comment) actually takes effect instead of
  // being masked by this guard.
  if (p < MOCKUP_ENTER_START || p >= 1) {
    return { opacity: 0, y: p < MOCKUP_ENTER_START ? -HEAD_TRAVEL : HEAD_TRAVEL };
  }

  const enterO = easeEnterOpacity(ramp(p, inOpacity[0], inOpacity[1]));
  const enterM = easeEnterMove(ramp(p, inMove[0], inMove[1]));
  const exitO = easeExitOpacity(ramp(p, HEAD_OUT_OPACITY[0], HEAD_OUT_OPACITY[1]));
  const exitM = easeExitMove(ramp(p, HEAD_OUT_MOVE[0], HEAD_OUT_MOVE[1]));

  return {
    opacity: enterO * (1 - exitO),
    y: lerp(-HEAD_TRAVEL, 0, enterM) + lerp(0, HEAD_TRAVEL, exitM),
  };
}

/**
 * Text-block pose for feature `index` at `T`. All nine heads render stacked
 * and each is driven from its own offset — never swap textContent, which
 * breaks reverse scroll and loses the outgoing head's exit (§3.7).
 */
export function headPose(index: number, T: number, count = DEFAULT_COUNT): HeadPose {
  return headEnvelope(index, T, count, TEXT_IN_OPACITY, TEXT_IN_MOVE);
}

/** App-icon layer — same exit, entrance ~0.3s earlier than the text (§3.7). */
export function headIconPose(index: number, T: number, count = DEFAULT_COUNT): HeadPose {
  return headEnvelope(index, T, count, ICON_IN_OPACITY, ICON_IN_MOVE);
}

// ---------------------------------------------------------------------------
// §3.6 the ring
// ---------------------------------------------------------------------------

/**
 * Fill (0 → 1) for tile `index`'s OWN ring, fixed in place at that tile —
 * per explicit direction superseding §3.6/§9.4-5's original single sliding
 * ring: seeing it built, a shared ring translating between tiles read as
 * the ring dragging a curved trail across the gap on every handoff, not as
 * "progress moving to the next feature". Every tile now carries its own
 * ring that never moves; only fill changes.
 *
 * One line, no branching: `ramp` already clamps both ends, so it is 0 for
 * every T before tile `index` is reached, rises linearly across that tile's
 * own 0.10 → 0.80 dwell window, and — since there is no unwind anymore —
 * simply holds at 1 forever afterward, which *is* "completed" for a tile
 * that's been passed. Independent per tile by construction: tile i's value
 * depends only on T − i.
 */
export function tileRingFill(index: number, T: number): number {
  return ramp(T - index, RING_FILL_START, RING_FILL_END);
}

/**
 * Rail tile `index`'s ACTIVE (brand-purple filled) glyph opacity — 1 for
 * exactly the active tile, 0 for every other, switching at the same instant
 * `activeIndex` itself does.
 *
 * This used to cross-fade smoothly across p 0.81 → 0.90, matching the old
 * single-glyph dimming's own handover window — harmless there, since a
 * dimmed copy of the same icon reads fine at any intermediate brightness.
 * Now that inactive tiles show a wholly DIFFERENT asset (node 1521:34733's
 * grey outline glyph vs 1521:34740's filled one, two separate <img>s — see
 * tileInactiveIconOpacity) with its own differently-styled frame (bordered
 * white/15% vs solid --tag-primary-bg, no border, see .fcar__tile.is-active
 * in features-carousel.scss), that early window meant the icon swapped
 * ~19% of a dwell BEFORE the frame did — an active-purple icon briefly
 * sitting in a still-inactive-white frame, and vice versa. Snapping both on
 * the same activeIndex boundary keeps the icon and its frame switching as
 * one visual unit. */
export function tileActiveIconOpacity(index: number, T: number, count = DEFAULT_COUNT): number {
  return index === activeIndex(T, count) ? 1 : 0;
}

/** The complementary grey-outline glyph (node 1521:34733) — always the
 * exact inverse of tileActiveIconOpacity, so exactly one of the two shows
 * at a time, never both nor neither. */
export function tileInactiveIconOpacity(index: number, T: number, count = DEFAULT_COUNT): number {
  return 1 - tileActiveIconOpacity(index, T, count);
}
