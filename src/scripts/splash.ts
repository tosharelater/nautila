/**
 * NAUTILA — intro splash
 * Dots swirl in along a golden spiral → the three pillar words → the dots
 * regroup into the stacked logo (spiral + NAUTILA) → tagline → everything
 * coils into the shell's eye while an iris closes on it and reveals the site.
 */

interface P {
  x: number;
  y: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
}

type Pt = { x: number; y: number };

export interface SplashOptions {
  words: string[];
  finale?: string;
  color?: string;
  accent?: string;
  tagEl?: HTMLElement | null;
  onDone?: () => void;
}

const MAX_PARTICLES = 4200;
const PHI = 1.6180339887;
const B = Math.log(PHI) / (Math.PI / 2);
const LOGO =
  'M100 0 A100 100 0 0 1 0 100 A61.8 61.8 0 0 1 -61.8 38.2 A38.2 38.2 0 0 1 -23.61 0 A23.61 23.61 0 0 1 0 23.61 A14.59 14.59 0 0 1 -14.59 38.2';

function offscreen(W: number, H: number) {
  const off = document.createElement('canvas');
  off.width = W;
  off.height = H;
  const octx = off.getContext('2d', { willReadFrequently: true })!;
  octx.clearRect(0, 0, W, H);
  octx.fillStyle = '#000';
  octx.strokeStyle = '#000';
  octx.textAlign = 'center';
  octx.textBaseline = 'middle';
  return octx;
}

function sampleLines(W: number, H: number, lines: string[]): Pt[] {
  const octx = offscreen(W, H);
  const longest = Math.max(...lines.map((l) => l.length), 5);
  const fontSize = Math.min(H * 0.1, (W * 0.8) / (longest * 0.54));
  const lineGap = fontSize * 1.45;
  const startY = H / 2 - (lineGap * (lines.length - 1)) / 2;
  octx.font = `500 ${fontSize}px 'Jost', system-ui, sans-serif`;
  lines.forEach((line, i) => octx.fillText(line, W / 2, startY + i * lineGap));
  return rasterize(octx, W, H);
}

/** Stacked logo: golden spiral above a letter-spaced wordmark (Brand Book p.05 "Empilé"). */
function sampleBrand(W: number, H: number, text: string) {
  const octx = offscreen(W, H);
  const letters = text.toUpperCase().split('');
  const fontSize = Math.min(H * 0.08, (W * 0.78) / (letters.length * 1.25));
  const track = fontSize * 0.42;
  const spiralH = fontSize * 2.4;
  const gap = fontSize * 0.95;
  const blockH = spiralH + gap + fontSize;
  const top = H * 0.47 - blockH / 2;

  // spiral (viewBox x −66…106, y −5…105 → centre 20, 50)
  const s = spiralH / 110;
  octx.save();
  octx.translate(W / 2 - 20 * s, top + spiralH / 2 - 50 * s);
  octx.scale(s, s);
  octx.lineWidth = 7.5;
  octx.lineCap = 'round';
  octx.stroke(new Path2D(LOGO));
  octx.restore();

  // wordmark with manual tracking
  octx.font = `500 ${fontSize}px 'Jost', system-ui, sans-serif`;
  octx.textAlign = 'left';
  const widths = letters.map((c) => octx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + track * (letters.length - 1);
  let x = W / 2 - total / 2;
  const ty = top + spiralH + gap + fontSize / 2;
  letters.forEach((c, i) => {
    octx.fillText(c, x, ty);
    x += widths[i] + track;
  });

  // eye of the shell = innermost arc end (-14.59, 38.2) in viewBox units
  const eye = { x: W / 2 + (-14.59 - 20) * s, y: top + spiralH / 2 + (38.2 - 50) * s };
  return { pts: rasterize(octx, W, H), eye, bottom: ty + fontSize * 0.9 };
}

function rasterize(octx: CanvasRenderingContext2D, W: number, H: number): Pt[] {
  let gap = 2;
  const collect = (g: number) => {
    const data = octx.getImageData(0, 0, W, H).data;
    const pts: Pt[] = [];
    for (let y = 0; y < H; y += g) {
      for (let x = 0; x < W; x += g) {
        if (data[(y * W + x) * 4 + 3] > 90) pts.push({ x: x + g * 0.5, y: y + g * 0.5 });
      }
    }
    return pts;
  };
  let pts = collect(gap);
  while (pts.length > MAX_PARTICLES && gap < 6) {
    gap += 1;
    pts = collect(gap);
  }
  if (pts.length > MAX_PARTICLES) {
    const step = Math.ceil(pts.length / MAX_PARTICLES);
    pts = pts.filter((_, i) => i % step === 0).slice(0, MAX_PARTICLES);
  }
  return pts;
}

function shuffleInPlace<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

export function createSplash(
  root: HTMLElement,
  canvas: HTMLCanvasElement,
  options: SplashOptions
): { destroy: () => void; skip: () => void } | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    options.onDone?.();
    return null;
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const words = options.words.length ? options.words : ['Confiance', 'Rendement', 'Technologie'];
  const finale = options.finale || 'Nautila';
  const ECUME = options.color || '#63A6A0';
  const SABLE = options.accent || '#F2EFE6';

  let W = 0;
  let H = 0;
  let particles: P[] = [];
  let active = 0;
  let raf = 0;
  let time = 0;
  let spring = 0.09;
  let damp = 0.76;
  let noise = 0.01;
  let swirl = 0; // tangential force around the eye
  let eye: Pt = { x: 0, y: 0 };
  let done = false;

  const size = () => {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, Math.floor(r.width || window.innerWidth));
    H = Math.max(1, Math.floor(r.height || window.innerHeight));
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const spawn = (n: number) => {
    while (particles.length < n) {
      particles.push({ x: W / 2, y: H / 2, ox: W / 2, oy: H / 2, vx: 0, vy: 0, r: 0.8 + Math.random() * 0.7, a: 0.55 + Math.random() * 0.45 });
    }
  };

  /** Start every dot on a golden spiral arm, moving tangentially — a vortex. */
  const vortexStart = () => {
    const R = Math.hypot(W, H) * 0.55;
    const k = R / Math.exp(B * 4 * Math.PI);
    for (let i = 0; i < active; i++) {
      const p = particles[i];
      const th = Math.random() * 4 * Math.PI;
      const r = k * Math.exp(B * th) * (0.9 + Math.random() * 0.2);
      const a = th + (i % 3) * ((Math.PI * 2) / 3);
      p.x = W / 2 + Math.cos(a) * r;
      p.y = H / 2 + Math.sin(a) * r;
      const sp = 2 + r * 0.012;
      p.vx = -Math.sin(a) * sp;
      p.vy = Math.cos(a) * sp;
    }
  };

  const retarget = (targets: Pt[], keepAll: boolean) => {
    if (!targets.length) return false;
    const shuffled = targets.slice();
    shuffleInPlace(shuffled);
    const prev = active;
    spawn(shuffled.length);
    if (keepAll && prev > 0) {
      for (let i = prev; i < shuffled.length; i++) {
        const donor = particles[i % prev];
        particles[i].x = donor.x + (Math.random() - 0.5) * 6;
        particles[i].y = donor.y + (Math.random() - 0.5) * 6;
        particles[i].vx = particles[i].vy = 0;
      }
    }
    active = keepAll ? Math.max(prev, shuffled.length) : shuffled.length;
    for (let i = 0; i < active; i++) {
      const t = shuffled[i % shuffled.length];
      const extra = i >= shuffled.length;
      const ang = (i * 2.399) % (Math.PI * 2);
      particles[i].ox = t.x + (extra ? Math.cos(ang) * 0.8 : 0);
      particles[i].oy = t.y + (extra ? Math.sin(ang) * 0.8 : 0);
    }
    return true;
  };

  const paint = () => {
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < active; i++) {
      const p = particles[i];
      ctx.fillStyle = i % 5 === 0 ? SABLE : ECUME;
      ctx.globalAlpha = p.a * 0.9;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  };

  let lastT = 0;
  const tick = (now: number = performance.now()) => {
    // fixed 60 Hz sub-steps so the choreography keeps pace on slow frames
    const steps = lastT ? Math.min(6, Math.max(1, Math.round((now - lastT) / 16.67))) : 1;
    lastT = now;
    for (let s = 0; s < steps; s++) step();
    paint();
    if (!done) raf = requestAnimationFrame(tick);
  };

  const step = () => {
    time += 0.016;
    for (let i = 0; i < active; i++) {
      const p = particles[i];
      const dx = p.ox - p.x;
      const dy = p.oy - p.y;
      const dist = Math.hypot(dx, dy);
      const k = dist < 5 ? spring * 1.75 : spring;
      let ax = dx * k;
      let ay = dy * k;
      if (noise > 0 && dist > 4) {
        ax += Math.sin(p.y * 0.02 + time) * noise;
        ay += Math.cos(p.x * 0.018 + time * 0.9) * noise;
      }
      if (swirl) {
        const ex = p.x - eye.x;
        const ey = p.y - eye.y;
        const d = Math.hypot(ex, ey) + 1;
        ax += (-ey / d) * swirl;
        ay += (ex / d) * swirl;
      }
      p.vx = (p.vx + ax) * damp;
      p.vy = (p.vy + ay) * damp;
      p.x += p.vx;
      p.y += p.vy;
    }
  };

  const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  const setEye = () => {
    root.style.setProperty('--cx', `${eye.x || W / 2}px`);
    root.style.setProperty('--cy', `${eye.y || H / 2}px`);
  };

  const finish = () => {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    setEye();
    root.classList.add('is-out');
    window.dispatchEvent(new Event('nautila:splash-done'));
    try {
      sessionStorage.setItem('nautila-splash', '1');
    } catch {
      /* storage blocked — splash just plays again next time */
    }
    window.setTimeout(() => {
      root.remove();
      document.documentElement.classList.remove('splash-lock');
      options.onDone?.();
    }, 1000);
  };

  const run = async () => {
    size();
    await (document.fonts?.ready ?? Promise.resolve());
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    size();
    if (W < 40 || H < 40) {
      await wait(80);
      size();
    }

    const three = sampleLines(W, H, words);
    const brand = sampleBrand(W, H, finale);
    eye = brand.eye;
    setEye();
    if (options.tagEl) options.tagEl.style.top = `${brand.bottom}px`;

    /* Debug handle for verification */
    (window as unknown as { __nautilaSplash?: unknown }).__nautilaSplash = {
      counts: { three: three.length, brand: brand.pts.length },
      get error() {
        let e = 0;
        for (let i = 0; i < active; i++) e += Math.hypot(particles[i].ox - particles[i].x, particles[i].oy - particles[i].y);
        return active ? e / active : 0;
      },
    };

    if (!three.length && !brand.pts.length) return finish();

    if (reduced) {
      retarget(brand.pts, false);
      particles.forEach((p) => ((p.x = p.ox), (p.y = p.oy)));
      paint();
      options.tagEl?.classList.add('show');
      await wait(900);
      return finish();
    }

    // 1 — vortex → three words
    root.classList.add('is-running');
    spring = 0.045;
    damp = 0.86;
    noise = 0.01;
    retarget(three, false);
    vortexStart();
    raf = requestAnimationFrame(tick);
    await wait(700);
    if (done) return;
    spring = 0.1;
    damp = 0.74;
    await wait(1000);
    if (done) return;
    spring = 0.14;
    noise = 0.0015;
    await wait(1000); // readable hold
    if (done) return;

    // 2 — regroup into the stacked logo
    spring = 0.07;
    damp = 0.73;
    noise = 0.01;
    retarget(brand.pts, true);
    await wait(1500);
    if (done) return;
    spring = 0.15;
    noise = 0.001;
    options.tagEl?.classList.add('show');
    await wait(1300);
    if (done) return;

    // 3 — everything coils into the eye of the shell, iris closes on it
    options.tagEl?.classList.remove('show');
    for (let i = 0; i < active; i++) {
      particles[i].ox = eye.x;
      particles[i].oy = eye.y;
    }
    spring = 0.018;
    damp = 0.9;
    swirl = 1.6;
    noise = 0;
    await wait(420);
    finish();
  };

  try {
    if (sessionStorage.getItem('nautila-splash')) {
      root.remove();
      window.dispatchEvent(new Event('nautila:splash-done'));
      options.onDone?.();
      return { skip: () => {}, destroy: () => {} };
    }
  } catch {
    /* storage blocked — play the splash */
  }

  document.documentElement.classList.add('splash-lock');
  run();

  return {
    skip: finish,
    destroy() {
      done = true;
      cancelAnimationFrame(raf);
    },
  };
}
