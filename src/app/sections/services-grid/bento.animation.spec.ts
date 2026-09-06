import { BENTO_CONFIG, clamp, easeOutCubic, easeOutQuad, sampleTrack } from './bento.animation';

describe('bento.animation', () => {
  it('sampleTrack returns the measured pose at p = 0 for every card', () => {
    for (const cfg of Object.values(BENTO_CONFIG)) {
      const first = cfg.track[0];
      const pose = sampleTrack(cfg.track, 0);
      expect(pose.dx).toBeCloseTo(first.dx, 5);
      expect(pose.dy).toBeCloseTo(first.dy, 5);
      expect(pose.s).toBeCloseTo(first.s, 5);
    }
  });

  it('sampleTrack returns the measured pose at p = 0.5 for every card', () => {
    for (const cfg of Object.values(BENTO_CONFIG)) {
      const mid = cfg.track.find((k) => k.at === 0.5);
      const pose = sampleTrack(cfg.track, 0.5);
      if (mid) {
        // exact waypoint for the two three-point tracks (c1, c3)
        expect(pose.dx).toBeCloseTo(mid.dx, 5);
        expect(pose.dy).toBeCloseTo(mid.dy, 5);
        expect(pose.s).toBeCloseTo(mid.s, 5);
      } else {
        // two-point tracks: eased partway between enter and rest (1) —
        // most cards shrink down to 1, `logo` grows up to it (0.575 → 1)
        const enterS = cfg.track[0].s;
        if (enterS > 1) {
          expect(pose.s).toBeGreaterThan(1);
          expect(pose.s).toBeLessThan(enterS);
        } else {
          expect(pose.s).toBeLessThan(1);
          expect(pose.s).toBeGreaterThan(enterS);
        }
      }
    }
  });

  it('every track ends at rest {0, 0, 1} for p = 1', () => {
    for (const cfg of Object.values(BENTO_CONFIG)) {
      const pose = sampleTrack(cfg.track, 1);
      expect(pose.dx).toBeCloseTo(0, 5);
      expect(pose.dy).toBeCloseTo(0, 5);
      expect(pose.s).toBeCloseTo(1, 5);
    }
  });

  it('sampleTrack scale is monotonically non-increasing toward rest as p rises (c1)', () => {
    const track = BENTO_CONFIG['c1'].track;
    const samples = [0, 0.1, 0.25, 0.4, 0.5, 0.6, 0.75, 0.9, 1].map((p) => sampleTrack(track, p).s);
    for (let i = 1; i < samples.length; i++) {
      expect(samples[i]).toBeLessThanOrEqual(samples[i - 1] + 1e-9);
    }
  });

  it('easeOutCubic and easeOutQuad are identity at the endpoints', () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutQuad(0)).toBe(0);
    expect(easeOutQuad(1)).toBe(1);
  });

  it('clamp bounds values to the given range', () => {
    expect(clamp(-1, 0, 1)).toBe(0);
    expect(clamp(2, 0, 1)).toBe(1);
    expect(clamp(0.5, 0, 1)).toBe(0.5);
  });
});
