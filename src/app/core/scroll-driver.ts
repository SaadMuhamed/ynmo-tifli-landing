/**
 * S03 feature-scroll driver — plain, framework-free TypeScript per plan §8.6.
 * Runs entirely outside Angular's zone; the component wires it to the DOM.
 */

export const FLIP = {
  scenePages: 0.9, // viewport-heights of scroll each feature owns
  flipLead: 0.21, // pages of flip that run BEFORE the ring closes
  flipTail: 0.16, // …and after, inside the next feature's cycle
  restScale: 1, // plane scale, flat-on
  edgeScale: 0.9, // plane scale, edge-on
  titleSpan: 0.34, // how much of a half-turn a title stays visible for
  introOpacity: 0.3, // feature 1 sits this faint before the first scroll
  introFrac: 0.14, // …and reaches full by this fraction of its ring
  shadow: 0.35, // ground shadow peak opacity
  damping: 0.12, // scroll smoothing, 0→1 per frame
} as const;

export const DESIGN_W = 1440;
export const N = 9;

export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const SPANS = Array(N).fill(FLIP.scenePages);
export const TOTAL = SPANS.reduce((a, b) => a + b, 0);
/** page position of each scene's end */
const SEAMS = SPANS.map((_, i) => SPANS.slice(0, i + 1).reduce((a, b) => a + b, 0));
const FLIP_LEN = FLIP.flipLead + FLIP.flipTail;

export interface Located {
  index: number;
  lp: number;
}

/** Absolute, monotonic card angle at page position u — reverses cleanly on scroll-up. */
export function angleAt(u: number): number {
  let a = 0;
  for (let i = 0; i < N - 1; i++) {
    const t = clamp((u - (SEAMS[i] - FLIP.flipLead)) / FLIP_LEN, 0, 1);
    a -= 180 * easeInOutCubic(t);
  }
  return a;
}

export function locate(u: number): Located {
  let acc = 0;
  for (let i = 0; i < N; i++) {
    if (u < acc + SPANS[i] || i === N - 1) {
      return { index: i, lp: clamp((u - acc) / SPANS[i], 0, 1) };
    }
    acc += SPANS[i];
  }
  return { index: N - 1, lp: 1 };
}

export interface DriverDom {
  track: HTMLElement;
  design: HTMLElement;
  flipper: HTMLElement;
  ground: HTMLElement;
  faces: [HTMLImageElement, HTMLImageElement];
  heads: HTMLElement[];
  chips: { ring: SVGPathElement; ringSvg: SVGSVGElement; el: HTMLElement }[];
}

export interface DriverCallbacks {
  scenes: { scene: string }[];
  reducedMotion: boolean;
}

/**
 * Owns layout()/readPages()/frame()/render() — the component supplies the
 * measured DOM + scenes and calls start()/stop()/layout().
 */
export class ScrollDriver {
  private smoothed = 0;
  private lastFacePair = '';
  private dirty = true;
  private prev = -1;
  private rafId: number | null = null;

  constructor(
    private readonly win: Window,
    private readonly dom: DriverDom,
    private readonly cb: DriverCallbacks,
  ) {}

  layout(): void {
    this.dom.track.style.height = 100 + TOTAL * 100 + 'vh';
    const h = this.dom.design.offsetHeight || 1;
    const s = Math.min((this.win.innerWidth * 0.94) / DESIGN_W, (this.win.innerHeight * 0.92) / h);
    this.dom.design.style.setProperty('--stage-scale', s.toFixed(4));
    this.dirty = true;
  }

  private readPages(): number {
    if (this.cb.reducedMotion) return TOTAL;
    const dist = this.dom.track.offsetHeight - this.win.innerHeight;
    if (dist <= 0) return 0;
    return clamp((this.win.scrollY - this.dom.track.offsetTop) / dist, 0, 1) * TOTAL;
  }

  private paintFace(f: number): void {
    if (f >= 0 && f < N) {
      this.dom.faces[f % 2].src = this.cb.scenes[f].scene;
    }
  }

  /** Paints the boot-time faces (index 0 and 1) before the first frame. */
  primeFaces(): void {
    this.paintFace(0);
    this.paintFace(1);
    this.lastFacePair = '0:1';
  }

  private render(u: number): void {
    const { index, lp } = locate(u);
    const angle = angleAt(u);
    const cos = Math.abs(Math.cos((angle * Math.PI) / 180));
    const tilt = 1 - cos;
    const scale = lerp(FLIP.edgeScale, FLIP.restScale, cos);
    this.dom.flipper.style.transform = `rotateX(${angle.toFixed(3)}deg) scale(${scale.toFixed(4)})`;

    const f = -angle / 180;
    const fa = clamp(Math.floor(f), 0, N - 1);
    const fb = clamp(Math.ceil(f), 0, N - 1);
    const pairKey = fa + ':' + fb;
    if (pairKey !== this.lastFacePair) {
      this.lastFacePair = pairKey;
      this.paintFace(fa);
      this.paintFace(fb);
    }

    this.dom.chips.forEach((chip, i) => {
      chip.ringSvg.style.opacity = i === index ? '1' : '0';
      chip.ring.setAttribute('stroke-dashoffset', i === index ? (1 - lp).toFixed(4) : i < index ? '0' : '1');
      chip.el.classList.toggle('active', i === index);
    });

    this.dom.heads.forEach((el, i) => {
      const o = clamp(1 - Math.abs(f - i) / FLIP.titleSpan, 0, 1);
      el.style.opacity = o.toFixed(3);
      el.style.pointerEvents = o > 0.5 ? 'auto' : 'none';
    });

    const intro = index === 0 ? lerp(FLIP.introOpacity, 1, easeOutCubic(clamp(lp / FLIP.introFrac, 0, 1))) : 1;
    this.dom.flipper.style.opacity = intro.toFixed(3);
    if (index === 0) {
      const headOpacity = parseFloat(this.dom.heads[0].style.opacity || '1');
      this.dom.heads[0].style.opacity = (headOpacity * intro).toFixed(3);
    }

    this.dom.ground.style.setProperty('--sh-op', (FLIP.shadow * (1 - tilt * 0.72) * intro).toFixed(3));
    this.dom.ground.style.setProperty('--sh-blur', (18 + tilt * 46).toFixed(1) + 'px');
    this.dom.ground.style.setProperty('--sh-sx', (1 - tilt * 0.22).toFixed(3));
    this.dom.ground.style.setProperty('--sh-y', (tilt * -26).toFixed(1) + 'px');
  }

  private frame = (): void => {
    const target = this.readPages();
    this.smoothed += (target - this.smoothed) * (this.cb.reducedMotion ? 1 : FLIP.damping);
    if (Math.abs(target - this.smoothed) < 0.0002) this.smoothed = target;

    if (this.dirty || Math.abs(this.smoothed - this.prev) > 0.00002) {
      this.prev = this.smoothed;
      this.dirty = false;
      this.render(this.smoothed);
    }
    this.rafId = this.win.requestAnimationFrame(this.frame);
  };

  start(): void {
    if (this.rafId !== null) return;
    this.rafId = this.win.requestAnimationFrame(this.frame);
  }

  stop(): void {
    if (this.rafId !== null) {
      this.win.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /** Scrolls the window so scene `i` sits centered in its own page span. */
  scrollToScene(i: number): void {
    const dist = this.dom.track.offsetHeight - this.win.innerHeight;
    if (dist <= 0) return;
    const seamStart = i === 0 ? 0 : SEAMS[i - 1];
    const targetPages = seamStart + FLIP.scenePages / 2;
    const y = this.dom.track.offsetTop + (targetPages / TOTAL) * dist;
    this.win.scrollTo({ top: y, behavior: 'smooth' });
  }
}
