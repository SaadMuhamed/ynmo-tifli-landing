import {
  DEFAULT_COUNT,
  HANDOFF_END,
  HANDOFF_START,
  MOCKUP_ENTER_END,
  MOCKUP_ENTER_START,
  OPACITY_SIDE,
  RING_FILL_END,
  RING_FILL_START,
  SHRINK_MULT,
  SIDE_SCALE,
  SLOT_STEP,
  STAGE_WIDTH,
  activeIndex,
  clamp,
  cubicBezier,
  featureProgress,
  headIconPose,
  headPose,
  poseFor,
  ramp,
  tileGlyphOpacity,
  tileRingFill,
} from './carousel.animation';

/** Acceptance §9 of YNMO-TIFLI-FEATURES-CAROUSEL-BUILD.md. */
describe('carousel.animation', () => {
  const W = STAGE_WIDTH;
  const indices = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  // §9.1 (position/scale only — opacity is covered by the mockup-enter tests
  // below: it is no longer full at T = i exactly, by explicit request).
  it('poseFor(i, i) is exactly the centre x/scale for every feature', () => {
    for (const i of indices) {
      const pose = poseFor(i, i, W);
      expect(pose.x).toBeCloseTo(0, 10);
      expect(pose.scale).toBeCloseTo(1, 10);
      expect(pose.opacity).toBeGreaterThan(0);
      expect(pose.visible).toBe(true);
    }
  });

  // Explicit request: the mockup must not already be at full opacity before
  // the incoming head text has finished its own TEXT_IN_OPACITY fade — it
  // used to be, because the old opacity blend finished during the OUTGOING
  // feature's tail, well before T = i. MOCKUP_ENTER_END is TEXT_IN_OPACITY's
  // own end, so both finish together.
  it('the centre mockup fades in across MOCKUP_ENTER_START..END, finishing with the head text', () => {
    for (const i of indices) {
      // Well before the window: still resting at the R-slot's OPACITY_SIDE.
      expect(poseFor(i, i + MOCKUP_ENTER_START - 0.05, W).opacity).toBeCloseTo(OPACITY_SIDE, 6);
      // At T = i exactly, partway through the fade — neither endpoint.
      const atArrival = poseFor(i, i, W).opacity;
      expect(atArrival).toBeGreaterThan(OPACITY_SIDE);
      expect(atArrival).toBeLessThan(1);
      // By the window's end, fully opaque — same moment the head text lands.
      expect(poseFor(i, i + MOCKUP_ENTER_END, W).opacity).toBeCloseTo(1, 6);
      expect(headPose(i, i + MOCKUP_ENTER_END).opacity).toBeCloseTo(1, 2);
    }
  });

  // §9.2
  it('poseFor(i, i + 1) is the L rest pose and poseFor(i, i - 1) the R rest pose', () => {
    for (const i of indices) {
      // i = 8 is deliberately excluded from the L check: T = 9 is past the
      // end of the timeline, where §6 defect 6 and §3.6 require feature 9 to
      // hold centred rather than step to L. The two clauses of the spec
      // conflict there and the hold wins — asserted directly below.
      if (i < DEFAULT_COUNT - 1) {
        const left = poseFor(i, i + 1, W);
        expect(left.x).toBeCloseTo(-SLOT_STEP, 10);
        expect(left.scale).toBeCloseTo(SIDE_SCALE, 10);
        expect(left.opacity).toBeCloseTo(OPACITY_SIDE, 10);
      }

      const right = poseFor(i, i - 1, W);
      expect(right.x).toBeCloseTo(SLOT_STEP, 10);
      expect(right.scale).toBeCloseTo(SIDE_SCALE, 10);
      expect(right.opacity).toBeCloseTo(OPACITY_SIDE, 10);
    }
  });

  it('a layer that has exited left stays parked, it does not drift back', () => {
    // Regression: collapsing both out-of-range directions into one pose made
    // exited layers interpolate toward the stage centre at opacity 0.
    const parked = -2 * SLOT_STEP;
    for (const T of [2.5, 2.89, 3.2, 4]) {
      expect(poseFor(0, T, W).x).toBeCloseTo(parked, 9);
      expect(poseFor(0, T, W).opacity).toBeCloseTo(0, 12);
    }
  });

  it('the Birth layer rests at the stage centre, shrunk and invisible', () => {
    // d = +2 — parked at x 0, behind, fully transparent (§3.5).
    const birth = poseFor(3, 1, W);
    expect(birth.x).toBeCloseTo(0, 10);
    expect(birth.scale).toBeCloseTo(SIDE_SCALE * SHRINK_MULT, 10);
    expect(birth.opacity).toBeCloseTo(0, 10);
  });

  it('the Birth layer travels right, opposite every other layer', () => {
    // Across feature 1's handoff, layer 3 (Birth → R) must move to +x while
    // layer 1 (C → L) moves to -x. That crossing is the intended read.
    const birthStart = poseFor(3, 1 + HANDOFF_START, W).x;
    const birthEnd = poseFor(3, 1 + HANDOFF_END, W).x;
    const centreStart = poseFor(1, 1 + HANDOFF_START, W).x;
    const centreEnd = poseFor(1, 1 + HANDOFF_END, W).x;

    expect(birthEnd).toBeGreaterThan(birthStart);
    expect(centreEnd).toBeLessThan(centreStart);
  });

  it('nothing moves during the dwell beat — the ring closes first', () => {
    // §3.2: the 0.80 → 0.81 gap exists so the carousel never starts stepping
    // before the ring is closed. Position/scale hold from p = 0; opacity only
    // holds at full once its own MOCKUP_ENTER_END fade-in has landed (p = 0
    // is mid-fade by explicit design — see the mockup-enter test above).
    for (const p of [0, 0.2, 0.4, 0.6, 0.8, HANDOFF_START]) {
      const pose = poseFor(2, 2 + p, W);
      expect(pose.x).toBeCloseTo(0, 9);
      expect(pose.scale).toBeCloseTo(1, 9);
      if (p >= MOCKUP_ENTER_END) expect(pose.opacity).toBeCloseTo(1, 9);
    }
  });

  /**
   * §9.3 asks for no step greater than 3px when sampling at 0.001. That
   * budget is unreachable given the other two locked decisions: E_SHUFFLE
   * (cubic-bezier .65,0,.35,1) has a peak slope of 2.855x its mean, and
   * SLOT_STEP crossing the 0.16-wide handoff window in 0.001 steps means a
   * mean step of SLOT_STEP x 0.001 / 0.16 — so the steepest sample is that
   * mean x 2.855 by construction. SLOT_STEP was deliberately retuned from
   * its original 194.51px (see that constant's own doc comment: the
   * 25%-hidden side-mockup overlap, solved against the centre mockup's own
   * design width, itself bounded by not sliding into the head zone beside
   * it) — recompute (SLOT_STEP x 0.001 / 0.16) x 2.855 whenever SLOT_STEP
   * changes; at 187.33px that's ~3.34px. §9.3,
   * §3.3 and §3.4 are jointly over-constrained; the intent (no
   * discontinuity) is what is asserted here, at the true geometric bound. A
   * real discontinuity — the floor/ceil slot-indexing bug this suite caught
   * during the build — shows up as tens/hundreds of px, not single digits.
   */
  const MAX_STEP_PX = 4;

  // §9.3
  it('poseFor is continuous across the handoff', () => {
    for (const i of indices) {
      for (const index of indices) {
        let prev = poseFor(index, i + HANDOFF_START, W);
        for (let p = HANDOFF_START; p <= HANDOFF_END + 1e-9; p += 0.001) {
          const next = poseFor(index, i + p, W);
          expect(Math.abs(next.x - prev.x)).toBeLessThan(MAX_STEP_PX);
          expect(Math.abs(next.scale - prev.scale)).toBeLessThan(0.02);
          expect(Math.abs(next.opacity - prev.opacity)).toBeLessThan(0.05);
          prev = next;
        }
      }
    }
  });

  it('poseFor is continuous across whole-feature boundaries too', () => {
    for (const index of indices) {
      let prev = poseFor(index, 0, W);
      for (let T = 0; T <= DEFAULT_COUNT; T += 0.001) {
        const next = poseFor(index, T, W);
        expect(Math.abs(next.x - prev.x)).toBeLessThan(MAX_STEP_PX);
        expect(Math.abs(next.scale - prev.scale)).toBeLessThan(0.02);
        expect(Math.abs(next.opacity - prev.opacity)).toBeLessThan(0.05);
        prev = next;
      }
    }
  });

  it('has no step spike — the scale-free discontinuity check', () => {
    // Independent of px budgets: a genuine jump is orders of magnitude above
    // the mean step, so bound the ratio rather than an absolute distance.
    for (const index of indices) {
      const steps: number[] = [];
      let prev = poseFor(index, 0, W);
      for (let T = 0.001; T <= DEFAULT_COUNT; T += 0.001) {
        const next = poseFor(index, T, W);
        steps.push(Math.abs(next.x - prev.x));
        prev = next;
      }
      const moving = steps.filter((s) => s > 0);
      const mean = moving.reduce((a, b) => a + b, 0) / moving.length;
      expect(Math.max(...steps) / mean).toBeLessThan(4);
    }
  });

  // §9.4, adapted: each tile's ring is now independent and fixed in place
  // (see tileRingFill's own doc comment) — the fill curve itself is
  // unchanged, just evaluated per tile instead of only for the active one.
  it('tileRingFill is 0 through p <= 0.10, exactly 1 at p = 0.80, monotonic between', () => {
    for (const i of indices) {
      expect(tileRingFill(i, i)).toBeCloseTo(0, 10);
      expect(tileRingFill(i, i + RING_FILL_START)).toBeCloseTo(0, 10);
      expect(tileRingFill(i, i + 0.05)).toBeCloseTo(0, 10);
      expect(tileRingFill(i, i + RING_FILL_END)).toBeCloseTo(1, 10);

      let prev = -1;
      for (let p = RING_FILL_START; p <= RING_FILL_END + 1e-9; p += 0.005) {
        const fill = tileRingFill(i, i + p);
        expect(fill).toBeGreaterThanOrEqual(prev - 1e-12);
        prev = fill;
      }
    }
  });

  it('tileRingFill is linear across the dwell — a dwell timer must not ease', () => {
    const i = 2;
    const mid = tileRingFill(i, i + (RING_FILL_START + RING_FILL_END) / 2);
    expect(mid).toBeCloseTo(0.5, 10);
    const quarter = tileRingFill(i, i + RING_FILL_START + (RING_FILL_END - RING_FILL_START) * 0.25);
    expect(quarter).toBeCloseTo(0.25, 10);
  });

  // Supersedes former §9.5 (ring translateY i×TILE_PITCH, sliding one pitch
  // per handoff): per explicit direction, rings no longer move at all — each
  // stays at its own tile and only its fill changes. These replace that
  // intent: a completed tile holds fully filled indefinitely, an unreached
  // tile stays empty no matter how far off, and no tile's fill leaks into
  // another's.
  it('a completed tile holds fully filled indefinitely, not just at its own handoff', () => {
    for (const T of [0.81, 1, 4, 8.9, 9]) {
      expect(tileRingFill(0, T)).toBeCloseTo(1, 10);
    }
  });

  it('an unreached tile stays at 0 no matter how far off', () => {
    for (const T of [0, 3, 5.5]) {
      expect(tileRingFill(8, T)).toBeCloseTo(0, 10);
    }
  });

  it('tiles fill independently — advancing one leaves the others exactly as they were', () => {
    const before = indices.map((i) => tileRingFill(i, 2.45));
    void tileRingFill(2, 2.45 + HANDOFF_START); // reading another tile's fill
    const after = indices.map((i) => tileRingFill(i, 2.45));
    expect(after).toEqual(before);
  });

  // §9.6
  it('every function is symmetric — ascending and descending sampling agree', () => {
    // One fixed ladder of T values, walked both ways. Accumulating T with
    // += / -= instead would compare *different* T values (0.01 does not sum
    // exactly in binary), which tests float accumulation, not the model.
    const ladder: number[] = [];
    for (let i = 0; i <= DEFAULT_COUNT * 100; i++) ladder.push(i / 100);

    const up = ladder.map(snapshot);
    const down = [...ladder].reverse().map(snapshot).reverse();

    expect(up.length).toBe(down.length);
    for (let i = 0; i < up.length; i++) expect(up[i]).toBe(down[i]);
  });

  // §9.7
  it('at most four mockups are visible at any T', () => {
    for (let T = -0.5; T <= DEFAULT_COUNT + 0.5; T += 0.003) {
      const count = indices.filter((i) => poseFor(i, T, W).visible).length;
      expect(count).toBeLessThanOrEqual(4);
    }
  });

  it('an invisible mockup is always fully transparent', () => {
    for (let T = 0; T <= DEFAULT_COUNT; T += 0.01) {
      for (const i of indices) {
        const pose = poseFor(i, T, W);
        if (!pose.visible) expect(pose.opacity).toBeCloseTo(0, 12);
      }
    }
  });

  it('scales SLOT_STEP proportionally to the measured stage width', () => {
    const half = poseFor(0, 1, W / 2).x;
    expect(half).toBeCloseTo(-SLOT_STEP / 2, 10);
  });

  // §6 defect 6 — the last feature must not slide away
  it('feature 9 rests centred and full opacity until the pin releases', () => {
    // T = 8 is this feature's own arrival instant — same MOCKUP_ENTER_START..
    // END fade-in as every other feature, so opacity is partial there, not
    // full yet (see the mockup-enter test above); position/scale still hold
    // from the first instant, and opacity is full for the rest of the hold.
    for (const T of [8, 8.5, 8.81, 8.95, 9]) {
      const pose = poseFor(8, T, W);
      expect(pose.x).toBeCloseTo(0, 9);
      expect(pose.scale).toBeCloseTo(1, 9);
      if (T > 8 + MOCKUP_ENTER_END) expect(pose.opacity).toBeCloseTo(1, 9);
    }
  });

  it('feature 9 keeps its head on screen and its ring closed', () => {
    for (const T of [8.85, 9]) {
      expect(headPose(8, T).opacity).toBeCloseTo(1, 9);
      expect(headPose(8, T).y).toBeCloseTo(0, 9);
      expect(tileRingFill(8, T)).toBeCloseTo(1, 9);
    }
  });

  // §6 defect 1 — feature 1's ring fills like every other
  it('feature 1 fills its ring like every other feature', () => {
    expect(tileRingFill(0, 0.45)).toBeCloseTo(tileRingFill(4, 4.45), 10);
  });

  // §3.7 head
  it('headPose is 0 outside its own feature and 1 at rest inside it', () => {
    expect(headPose(3, 2.5).opacity).toBeCloseTo(0, 10);
    expect(headPose(3, 4.5).opacity).toBeCloseTo(0, 10);
    expect(headPose(3, 3.5).opacity).toBeCloseTo(1, 10);
    expect(headPose(3, 3.5).y).toBeCloseTo(0, 10);
  });

  it('the app icon leads the text in (§3.7 stagger)', () => {
    // At p = 0.05 the icon has finished fading in; the text has not started.
    expect(headIconPose(1, 1.05).opacity).toBeCloseTo(1, 6);
    expect(headPose(1, 1.05).opacity).toBeCloseTo(0, 10);
  });

  it('the head exits during the handoff and enters from above', () => {
    expect(headPose(1, 1 + HANDOFF_START).opacity).toBeCloseTo(1, 6);
    expect(headPose(1, 1.93).opacity).toBeLessThan(0.05);
    expect(headPose(1, 1.93).y).toBeGreaterThan(0);
    expect(headPose(1, 1.0).y).toBeLessThan(0);
  });

  it('exactly one head is near-opaque at any point in a dwell', () => {
    for (let T = 0; T <= DEFAULT_COUNT; T += 0.01) {
      const lit = indices.filter((i) => headPose(i, T).opacity > 0.5).length;
      expect(lit).toBeLessThanOrEqual(1);
    }
  });

  // §3.8 rail
  it('tileGlyphOpacity lights only the active tile and cross-fades on handoff', () => {
    expect(tileGlyphOpacity(2, 2.4)).toBeCloseTo(1, 10);
    expect(tileGlyphOpacity(3, 2.4)).toBeCloseTo(OPACITY_SIDE, 10);
    expect(tileGlyphOpacity(2, 2.9)).toBeCloseTo(OPACITY_SIDE, 10);
    expect(tileGlyphOpacity(3, 2.9)).toBeCloseTo(1, 10);
  });

  // timeline decomposition
  it('activeIndex and featureProgress decompose T', () => {
    expect(activeIndex(0)).toBe(0);
    expect(activeIndex(3.7)).toBe(3);
    expect(activeIndex(-2)).toBe(0);
    expect(activeIndex(99)).toBe(8);
    expect(featureProgress(3.25)).toBeCloseTo(0.25, 10);
    expect(featureProgress(-1)).toBeCloseTo(0, 10);
  });

  // helpers
  it('cubicBezier is identity at the endpoints and monotonic between', () => {
    const ease = cubicBezier(0.65, 0, 0.35, 1);
    expect(ease(0)).toBe(0);
    expect(ease(1)).toBe(1);
    expect(ease(0.5)).toBeCloseTo(0.5, 6);
    let prev = -1;
    for (let t = 0; t <= 1; t += 0.01) {
      const v = ease(t);
      expect(v).toBeGreaterThanOrEqual(prev - 1e-9);
      prev = v;
    }
  });

  it('cubicBezier matches linear for the identity curve', () => {
    const linear = cubicBezier(0, 0, 1, 1);
    for (const t of [0.1, 0.25, 0.5, 0.75, 0.9]) expect(linear(t)).toBeCloseTo(t, 5);
  });

  it('clamp and ramp bound their inputs', () => {
    expect(clamp(-1, 0, 1)).toBe(0);
    expect(clamp(2, 0, 1)).toBe(1);
    expect(ramp(0.5, 0, 1)).toBeCloseTo(0.5, 10);
    expect(ramp(-1, 0, 1)).toBe(0);
    expect(ramp(2, 0, 1)).toBe(1);
    expect(ramp(5, 3, 3)).toBe(1);
  });
});

/** `-0` and `0` are the same number but format differently; normalise so the
 * symmetry check compares values rather than sign-of-zero. */
const f6 = (n: number): string => (n === 0 ? 0 : n).toFixed(6);

/** Stable string of everything f(T) produces, for the symmetry check. */
function snapshot(T: number): string {
  const parts: string[] = [];
  for (let i = 0; i < DEFAULT_COUNT; i++) {
    const p = poseFor(i, T, STAGE_WIDTH);
    const h = headPose(i, T);
    const ic = headIconPose(i, T);
    parts.push(
      `${f6(p.x)},${f6(p.scale)},${f6(p.opacity)},${p.visible ? 1 : 0}`,
      `${f6(h.opacity)},${f6(h.y)}`,
      `${f6(ic.opacity)},${f6(ic.y)}`,
      f6(tileGlyphOpacity(i, T)),
      f6(tileRingFill(i, T)),
    );
  }
  return parts.join('|');
}
