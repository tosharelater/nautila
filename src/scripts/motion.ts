/**
 * NAUTILA — cinematic motion layer
 * Parallax depth · horizontal scrub · pointer tilt · scroll storytelling
 * Zero deps. Respects prefers-reduced-motion.
 */

const q = <T extends Element = Element>(sel: string, scope: ParentNode = document) =>
  scope.querySelector<T>(sel);
const qa = <T extends Element = HTMLElement>(sel: string, scope: ParentNode = document) =>
  Array.from(scope.querySelectorAll<T>(sel));

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Shared pointer (normalized -0.5…0.5) for parallax / shaders */
export const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
window.addEventListener(
  'pointermove',
  (e) => {
    pointer.x = e.clientX / window.innerWidth - 0.5;
    pointer.y = e.clientY / window.innerHeight - 0.5;
  },
  { passive: true }
);

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/* ------------------------------------------------------------------ */
/* Scroll progress + nav                                               */
/* ------------------------------------------------------------------ */
const progressBar = q<HTMLElement>('[data-progress-bar]');
const nav = q('[data-nav]');

function onScrollChrome() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (progressBar) {
    const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    progressBar.style.transform = `scaleX(${p})`;
  }
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
}

/* ------------------------------------------------------------------ */
/* Reveal-on-scroll                                                    */
/* ------------------------------------------------------------------ */
const fadeEls = qa('[data-fade]');
if (fadeEls.length && 'IntersectionObserver' in window && !prefersReduced) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-in');
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -10% 0px' }
  );
  fadeEls.forEach((el) => {
    el.classList.add('reveal-init');
    io.observe(el);
  });
}

/* ------------------------------------------------------------------ */
/* Metrics counters                                                    */
/* ------------------------------------------------------------------ */
if (!prefersReduced && 'IntersectionObserver' in window) {
  const locale = document.documentElement.lang === 'en' ? 'en-US' : 'fr-FR';

  const animateCounter = (el: HTMLElement) => {
    const target = parseFloat(el.dataset.target || '0');
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const decimals = target % 1 !== 0 ? 2 : 0;
    const duration = 1600;
    const start = performance.now();

    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = target * eased;
      el.textContent =
        prefix +
        v.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) +
        suffix;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const counterIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target as HTMLElement);
          counterIo.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  qa('[data-counter]').forEach((el) => counterIo.observe(el));
}

/* ------------------------------------------------------------------ */
/* Trust marquee pause                                                 */
/* ------------------------------------------------------------------ */
const marquee = q<HTMLElement>('[data-marquee]');
if (marquee) {
  marquee.addEventListener('mouseenter', () => (marquee.style.animationPlayState = 'paused'));
  marquee.addEventListener('mouseleave', () => (marquee.style.animationPlayState = 'running'));
}

/* ------------------------------------------------------------------ */
/* Manifesto — sticky scroll story                                     */
/* ------------------------------------------------------------------ */
const steps = qa('[data-step]');
const dots = qa('[data-dot]');
const manifesto = q<HTMLElement>('[data-manifesto]');
const manifestoProgress = q<HTMLElement>('[data-manifesto-progress]');

function activateStep(idx: number) {
  steps.forEach((s, i) => {
    s.classList.toggle('active', i === idx);
    s.classList.toggle('leaving', i === idx - 1);
    s.setAttribute('aria-hidden', i === idx ? 'false' : 'true');
  });
  dots.forEach((d, i) => d.classList.toggle('active', i === idx));
}

if (manifesto && steps.length) {
  activateStep(0);

  const updateManifesto = () => {
    const r = manifesto.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = manifesto.offsetHeight - vh;
    const scrolled = Math.min(Math.max(-r.top, 0), total);
    const p = total > 0 ? scrolled / total : 0;

    if (manifestoProgress) manifestoProgress.style.transform = `scaleX(${p})`;

    const idx = Math.min(Math.floor(p * steps.length), steps.length - 1);
    activateStep(idx);

    /* Parallax the active visual */
    const visual = steps[idx]?.querySelector<HTMLElement>('[data-step-visual]');
    if (visual && !prefersReduced) {
      const local = (p * steps.length) % 1;
      visual.style.setProperty('--vp', String(local));
      visual.style.transform = `translateY(${(local - 0.5) * -28}px) scale(${1 + local * 0.04})`;
    }
  };

  (window as any).__nautilaManifesto = updateManifesto;
}

/* ------------------------------------------------------------------ */
/* Horizontal pillars scrub                                            */
/* ------------------------------------------------------------------ */
const hPin = q<HTMLElement>('[data-h-pin]');
const hTrack = q<HTMLElement>('[data-h-track]');
const hProgress = q<HTMLElement>('[data-h-progress]');

function updateHorizontal() {
  if (!hPin || !hTrack) return;
  const r = hPin.getBoundingClientRect();
  const vh = window.innerHeight;
  const total = hPin.offsetHeight - vh;
  const scrolled = Math.min(Math.max(-r.top, 0), total);
  const p = total > 0 ? scrolled / total : 0;

  const maxX = Math.max(0, hTrack.scrollWidth - window.innerWidth);
  hTrack.style.transform = `translate3d(${-maxX * p}px, 0, 0)`;
  if (hProgress) hProgress.style.transform = `scaleX(${p})`;

  /* Depth on cards based on distance from center */
  qa('[data-h-card]', hTrack).forEach((card) => {
    const cr = card.getBoundingClientRect();
    const center = cr.left + cr.width / 2;
    const dist = (center - window.innerWidth / 2) / window.innerWidth;
    if (!prefersReduced) {
      card.style.transform = `translateY(${dist * dist * 18}px) rotateY(${dist * -8}deg)`;
      card.style.opacity = String(1 - Math.min(Math.abs(dist) * 0.35, 0.35));
    }
  });
}

(window as any).__nautilaHorizontal = updateHorizontal;

/* ------------------------------------------------------------------ */
/* Generic [data-parallax] layers                                      */
/* ------------------------------------------------------------------ */
const parallaxEls = qa<HTMLElement>('[data-parallax]');

function updateParallax() {
  if (prefersReduced) return;
  const vh = window.innerHeight;
  parallaxEls.forEach((el) => {
    const speed = parseFloat(el.dataset.parallax || '0.2');
    const r = el.getBoundingClientRect();
    const mid = r.top + r.height / 2;
    const offset = (mid - vh / 2) * -speed;
    const px = pointer.sx * (parseFloat(el.dataset.parallaxX || '0') || speed * 40);
    const py = pointer.sy * (parseFloat(el.dataset.parallaxY || '0') || speed * 24);
    el.style.transform = `translate3d(${px}px, ${offset + py}px, 0)`;
  });
}

/* ------------------------------------------------------------------ */
/* Card tilt on pointer                                                */
/* ------------------------------------------------------------------ */
qa('[data-tilt]').forEach((card) => {
  if (prefersReduced) return;
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    const x = ((e as PointerEvent).clientX - r.left) / r.width - 0.5;
    const y = ((e as PointerEvent).clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
  });
  card.addEventListener('pointerleave', () => {
    card.style.transform = '';
  });
});

/* ------------------------------------------------------------------ */
/* Showcase chart bars grow in view                                    */
/* ------------------------------------------------------------------ */
const chart = q('[data-chart]');
if (chart && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          chart.classList.add('is-on');
          io.unobserve(chart);
        }
      });
    },
    { threshold: 0.4 }
  );
  io.observe(chart);
}

/* ------------------------------------------------------------------ */
/* Smooth anchors                                                      */
/* ------------------------------------------------------------------ */
qa('[data-nav-link]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href') || '';
    if (!href.startsWith('#')) return;
    const target = q(href);
    if (!target) return;
    e.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    history.replaceState(null, '', href);
  });
});

/* ------------------------------------------------------------------ */
/* Spiral scroll indicator                                             */
/* ------------------------------------------------------------------ */
const spiralTop = q<HTMLElement>('[data-spiral-top]');
const spiralFill = q<SVGPathElement>('[data-spiral-fill]');
const spiralPct = q<HTMLElement>('[data-spiral-pct]');

function updateSpiral() {
  if (!spiralTop) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
  spiralTop.classList.toggle('show', window.scrollY > window.innerHeight * 0.6);
  if (spiralFill) spiralFill.style.strokeDashoffset = String(1 - p);
  if (spiralPct) spiralPct.textContent = `${Math.round(p * 100)}`;
}

/* ------------------------------------------------------------------ */
/* Section titles "speak" word by word as they scroll into place       */
/* ------------------------------------------------------------------ */
const scrubTitles = qa<HTMLElement>('.section-title, .ct-copy h2');
scrubTitles.forEach((el) => {
  if (prefersReduced) return;
  el.removeAttribute('data-fade');
  el.classList.remove('reveal-init');
  const words = (el.textContent || '').trim().split(/\s+/);
  el.setAttribute('aria-label', el.textContent?.trim() || '');
  const esc = (w: string) => w.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  el.innerHTML = words.map((w) => `<span class="scrub-word" aria-hidden="true">${esc(w)}</span>`).join(" ");
});

function updateScrub() {
  const vh = window.innerHeight;
  scrubTitles.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.bottom < -50 || r.top > vh + 50) return;
    // 0 when the title enters at 90% of the viewport, 1 when it reaches 45%
    const p = Math.min(1, Math.max(0, (vh * 0.9 - r.top) / (vh * 0.45)));
    const spans = el.children;
    const lit = Math.round(p * spans.length);
    for (let i = 0; i < spans.length; i++) spans[i].classList.toggle('lit', i < lit);
  });
}

/* ------------------------------------------------------------------ */
/* Main rAF loop — smooth pointer + scroll-driven scenes               */
/* ------------------------------------------------------------------ */
function frame() {
  pointer.sx = lerp(pointer.sx, pointer.x, 0.08);
  pointer.sy = lerp(pointer.sy, pointer.y, 0.08);

  document.documentElement.style.setProperty('--mx', String(pointer.sx));
  document.documentElement.style.setProperty('--my', String(pointer.sy));

  onScrollChrome();
  (window as any).__nautilaManifesto?.();
  updateHorizontal();
  updateParallax();
  updateSpiral();
  updateScrub();

  requestAnimationFrame(frame);
}

if (!prefersReduced) {
  requestAnimationFrame(frame);
} else {
  window.addEventListener('scroll', () => {
    onScrollChrome();
    updateSpiral();
    (window as any).__nautilaManifesto?.();
    if (hPin && hTrack) {
      const r = hPin.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = hPin.offsetHeight - vh;
      const scrolled = Math.min(Math.max(-r.top, 0), total);
      const p = total > 0 ? scrolled / total : 0;
      const maxX = Math.max(0, hTrack.scrollWidth - window.innerWidth);
      hTrack.style.transform = `translate3d(${-maxX * p}px, 0, 0)`;
    }
  }, { passive: true });
  onScrollChrome();
}
