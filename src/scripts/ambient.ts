/**
 * Soft floating orbs — ambient depth behind sections (Radiant energy, light touch)
 */

export function createAmbient(canvas: HTMLCanvasElement): { destroy: () => void } | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

  type Orb = { x: number; y: number; r: number; vx: number; vy: number; a: number; hue: number };
  let orbs: Orb[] = [];
  let W = 0;
  let H = 0;
  let raf = 0;
  let running = false;

  const colors = [
    [20, 51, 59],
    [46, 125, 140],
    [99, 166, 160],
    [99, 166, 160],
  ];

  const spawn = () => {
    const rect = canvas.getBoundingClientRect();
    W = Math.max(1, Math.floor(rect.width));
    H = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(14, Math.max(6, Math.floor(W / 140)));
    orbs = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 40 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.2,
      a: 0.04 + Math.random() * 0.08,
      hue: Math.floor(Math.random() * colors.length),
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    for (const o of orbs) {
      if (!reduced) {
        o.x += o.vx;
        o.y += o.vy;
        if (o.x < -o.r) o.x = W + o.r;
        if (o.x > W + o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = H + o.r;
        if (o.y > H + o.r) o.y = -o.r;
      }
      const [r, g, b] = colors[o.hue];
      const gdn = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
      gdn.addColorStop(0, `rgba(${r},${g},${b},${o.a})`);
      gdn.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = gdn;
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const loop = () => {
    draw();
    raf = requestAnimationFrame(loop);
  };

  const start = () => {
    if (running) return;
    running = true;
    if (reduced) {
      draw();
      return;
    }
    raf = requestAnimationFrame(loop);
  };

  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  spawn();
  const ro = new ResizeObserver(() => spawn());
  ro.observe(canvas);
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => (e.isIntersecting ? start() : stop())),
    { threshold: 0.05 }
  );
  io.observe(canvas);

  return {
    destroy() {
      stop();
      ro.disconnect();
      io.disconnect();
    },
  };
}
