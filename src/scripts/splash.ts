/**
 * NAUTILA — intro splash
 * Three pillar words as dots → hold ~2s → ALL dots combine into "Nautila" → fade → site.
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

export interface SplashOptions {
  words: string[];
  finale?: string;
  color?: string;
  accent?: string;
  onDone?: () => void;
}

const MAX_PARTICLES = 4200;

function sampleLines(W: number, H: number, lines: string[]): { x: number; y: number }[] {
  const off = document.createElement('canvas');
  off.width = W;
  off.height = H;
  const octx = off.getContext('2d')!;

  const longest = Math.max(...lines.map((l) => l.length), 5);
  const fontSize = Math.min(H * 0.105, (W * 0.8) / (longest * 0.54));
  const lineGap = fontSize * 1.5;
  const blockH = lineGap * (lines.length - 1);
  const startY = H / 2 - blockH / 2;

  octx.clearRect(0, 0, W, H);
  octx.fillStyle = '#000';
  octx.textAlign = 'center';
  octx.textBaseline = 'middle';
  octx.font = `500 ${fontSize}px 'Jost', system-ui, sans-serif`;
  lines.forEach((line, i) => octx.fillText(line, W / 2, startY + i * lineGap));

  return rasterize(octx, W, H);
}

function sampleWord(W: number, H: number, text: string): { x: number; y: number }[] {
  const off = document.createElement('canvas');
  off.width = W;
  off.height = H;
  const octx = off.getContext('2d')!;
  const len = Math.max(text.length, 5);
  const fontSize = Math.min(H * 0.17, (W * 0.8) / (len * 0.5));

  octx.clearRect(0, 0, W, H);
  octx.fillStyle = '#000';
  octx.textAlign = 'center';
  octx.textBaseline = 'middle';
  octx.font = `500 ${fontSize}px 'Jost', system-ui, sans-serif`;
  octx.fillText(text, W / 2, H / 2);

  return rasterize(octx, W, H);
}

function rasterize(
  octx: CanvasRenderingContext2D,
  W: number,
  H: number
): { x: number; y: number }[] {
  let gap = 2;
  const collect = (g: number) => {
    const data = octx.getImageData(0, 0, W, H).data;
    const pts: { x: number; y: number }[] = [];
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
    const t = arr[i];
    arr[i] = arr[j];
    arr[j] = t;
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
  const GREEN = options.color || '#63A6A0';
  const SAGE = options.accent || '#F2EFE6';

  let W = 0;
  let H = 0;
  let particles: P[] = [];
  let active = 0;
  let raf = 0;
  let time = 0;
  let spring = 0.09;
  let damp = 0.76;
  let noise = 0.01;
  let done = false;
  let phaseAlpha = 1;
  let dotScale = 1;
  let phase: 'boot' | 'words' | 'brand' | 'fade' | 'done' = 'boot';

  const size = () => {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, Math.floor(r.width || window.innerWidth));
    H = Math.max(1, Math.floor(r.height || window.innerHeight));
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dotScale = Math.max(0.85, Math.min(1.3, W / 1000));
  };

  const spawn = (n: number) => {
    while (particles.length < n) {
      particles.push({
        x: W * 0.5,
        y: H * 0.5,
        ox: W * 0.5,
        oy: H * 0.5,
        vx: 0,
        vy: 0,
        r: 0.85 + Math.random() * 0.65,
        a: 0.6 + Math.random() * 0.4,
      });
    }
  };

  const retarget = (
    targets: { x: number; y: number }[],
    mode: 'scatter' | 'morph',
    keepAll = false
  ) => {
    if (!targets.length) return false;
    const shuffled = targets.slice();
    shuffleInPlace(shuffled);

    if (keepAll && active > 0) {
      const prev = active;
      spawn(shuffled.length);
      /* New dots spawn from existing ones so the cloud fattens into Nautila */
      for (let i = prev; i < shuffled.length; i++) {
        const donor = particles[i % prev];
        particles[i].x = donor.x + (Math.random() - 0.5) * 6;
        particles[i].y = donor.y + (Math.random() - 0.5) * 6;
        particles[i].vx = 0;
        particles[i].vy = 0;
      }
      active = shuffled.length;

      for (let i = 0; i < active; i++) {
        const p = particles[i];
        const t = shuffled[i % shuffled.length];
        const ring = (i / shuffled.length) | 0;
        const jitter = ring === 0 ? 0 : 0.45 + (ring % 3) * 0.28;
        const ang = (i * 2.399) % (Math.PI * 2);
        p.ox = t.x + Math.cos(ang) * jitter;
        p.oy = t.y + Math.sin(ang) * jitter;
        p.vx *= 0.2;
        p.vy *= 0.2;
      }
      return true;
    }

    spawn(shuffled.length);
    active = shuffled.length;

    for (let i = 0; i < active; i++) {
      const p = particles[i];
      const t = shuffled[i];
      p.ox = t.x;
      p.oy = t.y;
      if (mode === 'scatter') {
        const ang = Math.random() * Math.PI * 2;
        const dist = 70 + Math.random() * Math.min(W, H) * 0.36;
        p.x = W * 0.5 + Math.cos(ang) * dist;
        p.y = H * 0.5 + Math.sin(ang) * dist;
        p.vx = (Math.random() - 0.5) * 2.4;
        p.vy = (Math.random() - 0.5) * 2.4;
      } else {
        p.vx *= 0.25;
        p.vy *= 0.25;
      }
    }
    return true;
  };

  const paint = () => {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < active; i++) {
      const p = particles[i];
      ctx.beginPath();
      ctx.fillStyle = i % 5 === 0 ? SAGE : GREEN;
      ctx.globalAlpha = phaseAlpha * p.a;
      ctx.arc(p.x, p.y, p.r * dotScale, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  const tick = () => {
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
      p.vx = (p.vx + ax) * damp;
      p.vy = (p.vy + ay) * damp;
      p.x += p.vx;
      p.y += p.vy;
    }
    paint();
    if (!done) raf = requestAnimationFrame(tick);
  };

  const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  const finish = () => {
    if (done) return;
    done = true;
    phase = 'done';
    cancelAnimationFrame(raf);
    root.classList.add('is-out');
    window.dispatchEvent(new Event('nautila:splash-done'));
    window.setTimeout(() => {
      root.remove();
      document.documentElement.classList.remove('splash-lock');
      options.onDone?.();
    }, 650);
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

    let three = sampleLines(W, H, words);
    let brand = sampleWord(W, H, finale);

    if (!three.length || !brand.length) {
      await wait(150);
      size();
      three = sampleLines(W, H, words);
      brand = sampleWord(W, H, finale);
    }

    /* Debug handle for verification */
    (window as unknown as { __nautilaSplash?: unknown }).__nautilaSplash = {
      get phase() {
        return phase;
      },
      get active() {
        return active;
      },
      get counts() {
        return { three: three.length, brand: brand.length };
      },
    };

    if (!three.length && !brand.length) {
      finish();
      return;
    }

    if (reduced) {
      phase = 'brand';
      retarget(brand.length ? brand : three, 'scatter', false);
      for (let i = 0; i < active; i++) {
        particles[i].x = particles[i].ox;
        particles[i].y = particles[i].oy;
      }
      paint();
      await wait(700);
      finish();
      return;
    }

    /* Fixed timeline so the beat always completes:
       assemble words → hold 2s → combine to Nautila → hold → fade */
    phase = 'words';
    spring = 0.1;
    damp = 0.74;
    noise = 0.012;
    if (!retarget(three, 'scatter', false)) {
      finish();
      return;
    }
    raf = requestAnimationFrame(tick);

    await wait(1800); /* form the three words */
    if (done) return;
    spring = 0.14;
    noise = 0.0015;
    await wait(2000); /* readable hold */
    if (done) return;

    phase = 'brand';
    spring = 0.07;
    damp = 0.73;
    noise = 0.01;
    retarget(brand, 'morph', true); /* keep ALL dots — true combine */
    await wait(2200); /* fly into Nautila */
    if (done) return;
    spring = 0.15;
    noise = 0.001;
    await wait(1200); /* hold finished brand */
    if (done) return;

    phase = 'fade';
    const fadeStart = performance.now();
    const fade = (now: number) => {
      if (done) return;
      const t = Math.min((now - fadeStart) / 650, 1);
      phaseAlpha = 1 - t;
      if (t < 1) requestAnimationFrame(fade);
      else finish();
    };
    requestAnimationFrame(fade);
  };

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
