/**
 * NAUTILA — particle text reveal (Canvas-UI-style, zero dependencies)
 * Samples the headline glyph pixels into a particle field; particles
 * drift with a gentle flow field and are repelled by the pointer.
 * Pure Canvas2D + offscreen text sampling. Degrades to plain text if
 * canvas is unavailable; static (fully-formed) under reduced motion.
 */

export interface ParticleHandle {
  destroy: () => void;
}

interface P {
  x: number;
  y: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
}

export interface ParticleTextOptions {
  color?: string;
  accent?: string;
}

export function createParticleText(
  canvas: HTMLCanvasElement,
  text: string,
  options: ParticleTextOptions = {}
): ParticleHandle | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  let raf = 0;
  let running = false;
  let particles: P[] = [];
  let W = 0;
  let H = 0;
  let pointerX = -9999;
  let pointerY = -9999;
  let time = 0;

  const GREEN = options.color || '#2E7D8C';
  const SAGE = options.accent || '#2E7D8C';

  const sample = () => {
    const rect = canvas.getBoundingClientRect();
    /* clientWidth/Height are more reliable than getBoundingClientRect in
       flex/grid layouts mid-settle; fall back between them */
    W = Math.max(1, Math.floor(canvas.clientWidth || rect.width));
    H = Math.max(1, Math.floor(canvas.clientHeight || rect.height));
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    /* Draw the text offscreen, then read back filled pixels as particle seeds */
    const gap = Math.max(3, Math.floor(W / 90));
    const off = document.createElement('canvas');
    off.width = W;
    off.height = H;
    const octx = off.getContext('2d')!;
    const fontSize = Math.min(H * 0.42, W / Math.max(text.length * 0.42, 6));
    octx.fillStyle = '#000';
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    octx.font = `500 ${fontSize}px 'Jost', system-ui, sans-serif`;
    octx.fillText(text, W / 2, H / 2);

    const data = octx.getImageData(0, 0, W, H).data;
    particles = [];
    for (let y = 0; y < H; y += gap) {
      for (let x = 0; x < W; x += gap) {
        if (data[(y * W + x) * 4 + 3] > 128) {
          particles.push({
            x: Math.random() * W,
            y: Math.random() * H,
            ox: x,
            oy: y,
            vx: 0,
            vy: 0,
          });
        }
      }
    }
  };

  let rafTicks = 0;
  const renderFrame = () => {
    rafTicks++;
    time += 0.016;
    ctx.clearRect(0, 0, W, H);

    for (const p of particles) {
      /* Spring home */
      let ax = (p.ox - p.x) * 0.015;
      let ay = (p.oy - p.y) * 0.015;

      /* Pointer repulsion */
      const dx = p.x - pointerX;
      const dy = p.y - pointerY;
      const d2 = dx * dx + dy * dy;
      if (d2 < 6400) {
        const d = Math.sqrt(d2) || 1;
        const f = ((80 - d) / 80) * 1.4;
        ax += (dx / d) * f;
        ay += (dy / d) * f;
      }

      /* Gentle flow drift */
      ax += Math.sin(p.y * 0.01 + time * 0.8) * 0.02;
      ay += Math.cos(p.x * 0.012 + time * 0.6) * 0.02;

      p.vx = (p.vx + ax) * 0.86;
      p.vy = (p.vy + ay) * 0.86;
      p.x += p.vx;
      p.y += p.vy;
    }

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.fillStyle = i % 7 === 0 ? SAGE : GREEN;
      ctx.globalAlpha = i % 7 === 0 ? 0.75 : 0.92;
      ctx.fillRect(p.x, p.y, 2, 2);
    }
    ctx.globalAlpha = 1;
  };

  const step = () => {
    if (!running) return;
    renderFrame();
    raf = requestAnimationFrame(step);
  };

  const start = () => {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(step);
  };

  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    pointerX = e.clientX - r.left;
    pointerY = e.clientY - r.top;
  };

  const onLeave = () => {
    pointerX = -9999;
    pointerY = -9999;
  };

  sample();

  /* Second sizing pass after layout/fonts settle — webviews often fire
     observers before final geometry is known */
  requestAnimationFrame(() => requestAnimationFrame(() => sample()));
  if (document.fonts?.ready) document.fonts.ready.then(() => sample());

  if (reduced) {
    /* Static render: draw once at rest */
    for (const p of particles) {
      p.x = p.ox;
      p.y = p.oy;
    }
    time = 1;
    renderFrame();
    return { destroy: () => {} };
  }

  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerleave', onLeave);

  const ro = new ResizeObserver(() => {
    /* Only resample when the CSS size actually changed — RO also fires
       for content-box churn we don't care about */
    const w = Math.max(1, Math.floor(canvas.clientWidth));
    const h = Math.max(1, Math.floor(canvas.clientHeight));
    if (w !== W || h !== H) sample();
  });
  ro.observe(canvas);

  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => (e.isIntersecting ? start() : stop())),
    { threshold: 0.15 }
  );
  io.observe(canvas);

  /* Embedded-webview fallback: if rAF never ticks after start, drive
     frames from a timer instead of freezing on the first frame */
  setTimeout(() => {
    if (rafTicks === 0 && running) {
      stop();
      const timer = setInterval(() => renderFrame(), 33);
      const stopTimer = () => {
        clearInterval(timer);
        window.removeEventListener('pagehide', stopTimer);
      };
      window.addEventListener('pagehide', stopTimer);
    }
  }, 700);

  return {
    destroy() {
      stop();
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
    },
  };
}
