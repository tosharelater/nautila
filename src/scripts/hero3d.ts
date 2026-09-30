/**
 * NAUTILA — WebGL hero
 * A 3D golden spiral shell (log spiral, b = ln φ / (π/2)) over a
 * topographic "ocean depth" shader, with drifting écume particles.
 * Palette Atlantique only. Pauses off-screen, static under reduced motion.
 */
import * as THREE from 'three';

const PHI = 1.6180339887;
const B = Math.log(PHI) / (Math.PI / 2);

const C = {
  petrole: new THREE.Color('#14333B'),
  atlantique: new THREE.Color('#2E7D8C'),
  ecume: new THREE.Color('#63A6A0'),
  sable: new THREE.Color('#F2EFE6'),
};

const bgFrag = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uMouse;
  uniform vec3 cDeep;
  uniform vec3 cMid;
  uniform vec3 cLine;
  varying vec2 vUv;

  vec2 hash(vec2 p){ p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3))); return -1.0 + 2.0*fract(sin(p)*43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(dot(hash(i+vec2(0,0)),f-vec2(0,0)), dot(hash(i+vec2(1,0)),f-vec2(1,0)),u.x),
               mix(dot(hash(i+vec2(0,1)),f-vec2(0,1)), dot(hash(i+vec2(1,1)),f-vec2(1,1)),u.x),u.y);
  }
  float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<4;i++){ v+=a*noise(p); p*=2.02; a*=0.5; } return v; }

  void main(){
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(uRes.x/uRes.y, 1.0);
    float t = uTime * 0.035;

    // Depth field, gently warped by the pointer
    vec2 m = (uMouse) * vec2(uRes.x/uRes.y, 1.0) * 0.5;
    float md = length(p - m);
    vec2 q = p * 1.6 + vec2(t, -t*0.6);
    float h = fbm(q + fbm(q*0.8 + t) * 0.9) + 0.18 * exp(-md*md*6.0);

    // Contour lines (bathymetry)
    float bands = h * 18.0;
    float line = abs(fract(bands) - 0.5) / fwidth(bands);
    float contour = 1.0 - min(line, 1.0);
    float major = 1.0 - min(abs(fract(h*18.0/5.0) - 0.5) / fwidth(h*18.0/5.0), 1.0);

    // Base colour: pétrole with an Atlantique bloom toward the right
    float glow = smoothstep(1.1, 0.0, length(p - vec2(0.45, 0.02)));
    vec3 col = mix(cDeep, cMid, glow * 0.55 + h * 0.25);
    col += cLine * contour * 0.07 * (0.4 + glow);
    col += cLine * major * 0.12 * (0.3 + glow);

    // Pointer lantern
    col += cLine * 0.10 * exp(-md*md*9.0);

    // Vignette
    float vig = smoothstep(1.25, 0.35, length(p));
    col *= mix(0.72, 1.0, vig);
    gl_FragColor = vec4(col, 1.0);
  }
`;

const tubeVert = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vView;
  void main(){
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const tubeFrag = /* glsl */ `
  uniform float uTime;
  uniform float uDraw;
  uniform vec3 cA;
  uniform vec3 cB;
  uniform vec3 cS;
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vView;
  void main(){
    if (vUv.x > uDraw) discard;
    float fres = pow(1.0 - abs(dot(normalize(vN), normalize(vView))), 2.2);
    vec3 base = mix(cA, cB, smoothstep(0.0, 1.0, vUv.x));
    // travelling light pulse along the shell
    float pulse = smoothstep(0.06, 0.0, abs(fract(uTime*0.09) - vUv.x));
    // soft ridges (growth lines of a nautilus)
    float ridge = 0.5 + 0.5*sin(vUv.x * 160.0);
    vec3 col = base * (0.55 + 0.35*ridge) + cS * fres * 0.9 + cS * pulse * 0.8;
    float tip = smoothstep(uDraw, uDraw - 0.02, vUv.x);
    gl_FragColor = vec4(col, (0.55 + fres*0.45) * tip);
  }
`;

function spiralCurve() {
  const pts: THREE.Vector3[] = [];
  const t0 = -4.2 * Math.PI;
  const t1 = 0.95 * Math.PI;
  const N = 420;
  for (let i = 0; i <= N; i++) {
    const th = t0 + (t1 - t0) * (i / N);
    const r = Math.exp(B * th);
    // gentle cone: inner turns lift toward the viewer, like a shell's apex
    const z = (1 - i / N) * 0.35;
    pts.push(new THREE.Vector3(r * Math.cos(th), r * Math.sin(th), z));
  }
  return new THREE.CatmullRomCurve3(pts);
}

function taperedTube(curve: THREE.Curve<THREE.Vector3>, tubular: number, radial: number, rMax: number) {
  const geo = new THREE.TubeGeometry(curve, tubular, rMax, radial, false);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const c = new THREE.Vector3();
  const v = new THREE.Vector3();
  for (let k = 0; k < pos.count; k++) {
    const i = Math.floor(k / (radial + 1));
    const u = i / tubular;
    curve.getPointAt(u, c);
    v.fromBufferAttribute(pos, k).sub(c);
    const s = 0.08 + 0.92 * Math.pow(u, 1.35);
    v.multiplyScalar(s).add(c);
    pos.setXYZ(k, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

export interface Hero3DOptions {
  /** 0 = centred "artwork" composition, 1 = hero layout (spiral on the right) */
  view?: () => number;
  /** 0…1 scroll progress used for the uncoil; defaults to window scroll / host height */
  scroll?: () => number;
}

export function createHero3D(canvas: HTMLCanvasElement, host: HTMLElement, opts: Hero3DOptions = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(dpr);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 8);

  // --- Background shader -------------------------------------------------
  const bgMat = new THREE.ShaderMaterial({
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }`,
    fragmentShader: bgFrag,
    uniforms: {
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      cDeep: { value: C.petrole.clone().multiplyScalar(0.95) },
      cMid: { value: C.atlantique.clone().lerp(C.petrole, 0.4) },
      cLine: { value: C.ecume },
    },
    depthWrite: false,
    depthTest: false,
  });
  // fwidth needs derivatives on WebGL1
  (bgMat as any).extensions = { derivatives: true };
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat);
  bg.frustumCulled = false;
  bg.renderOrder = -1;
  scene.add(bg);

  // --- Spiral shell ------------------------------------------------------
  const group = new THREE.Group();
  scene.add(group);

  const curve = spiralCurve();
  const tubeMat = new THREE.ShaderMaterial({
    vertexShader: tubeVert,
    fragmentShader: tubeFrag,
    uniforms: {
      uTime: { value: 0 },
      uDraw: { value: 0 },
      cA: { value: C.atlantique },
      cB: { value: C.ecume },
      cS: { value: C.sable },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const tube = new THREE.Mesh(taperedTube(curve, 480, 18, 0.11), tubeMat);
  group.add(tube);

  // Soft halo shell around the tube (cheap bloom substitute)
  const glowMat = new THREE.ShaderMaterial({
    vertexShader: tubeVert,
    fragmentShader: /* glsl */ `
      uniform float uDraw; uniform vec3 cG;
      varying vec2 vUv; varying vec3 vN; varying vec3 vView;
      void main(){
        if (vUv.x > uDraw) discard;
        float f = abs(dot(normalize(vN), normalize(vView)));
        gl_FragColor = vec4(cG, pow(f, 3.0) * 0.16 * (0.3 + vUv.x));
      }`,
    uniforms: { uDraw: tubeMat.uniforms.uDraw, cG: { value: C.ecume } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  group.add(new THREE.Mesh(taperedTube(curve, 240, 12, 0.42), glowMat));

  // --- Layout ------------------------------------------------------------
  let W = 1;
  let H = 1;
  let baseX = 0;
  let baseScale = 1;
  let baseY = -0.1;
  const resize = () => {
    // layout size, not the transformed (zoomed) box
    W = Math.max(1, host.clientWidth);
    H = Math.max(1, host.clientHeight);
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    bgMat.uniforms.uRes.value.set(W, H);
    const wide = W / H > 1.1;
    baseX = wide ? 2.52 * (W / H) * 0.46 : 0.4;
    baseScale = wide ? 1.15 : 0.62;
    baseY = wide ? -0.1 : -1.55;
  };
  resize();
  window.addEventListener('resize', resize);

  // --- Interaction -------------------------------------------------------
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  window.addEventListener(
    'pointermove',
    (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
    },
    { passive: true }
  );

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const t0 = performance.now();
  let last = t0;
  let raf = 0;
  let running = false;
  let intro = reduced ? 1 : 0;
  // Start drawing once the intro splash lifts (or right away if there is none)
  const splashUp = !!document.querySelector('[data-splash]') && document.documentElement.classList.contains('splash-lock');
  let introStart = splashUp ? Infinity : performance.now() + 200;
  window.addEventListener('nautila:splash-done', () => (introStart = performance.now() + 150), { once: true });
  window.setTimeout(() => {
    if (introStart === Infinity) introStart = performance.now();
  }, 9000);

  const render = () => {
    const now = performance.now();
    const t = (now - t0) / 1000;
    last = now;
    intro = reduced ? 1 : Math.min(1, Math.max(0, (now - introStart) / 3400));
    const e = 1 - Math.pow(1 - intro, 3);

    mouse.sx += (mouse.x - mouse.sx) * 0.05;
    mouse.sy += (mouse.y - mouse.sy) * 0.05;

    const scroll = Math.min(1, Math.max(0, opts.scroll ? opts.scroll() : window.scrollY / H));
    const v = opts.view ? Math.min(1, Math.max(0, opts.view())) : 1;
    const vx = baseX * v;
    const vy = baseY * v + (1 - v) * 0.5;
    const vs = baseScale * v + (1 - v) * (W / H > 1.1 ? 1.35 : 0.85);

    bgMat.uniforms.uTime.value = t;
    bgMat.uniforms.uMouse.value.set(mouse.sx, mouse.sy);
    tubeMat.uniforms.uTime.value = t;
    tubeMat.uniforms.uDraw.value = e * 1.001;

    group.position.set(vx + mouse.sx * 0.25, vy + mouse.sy * 0.15 + scroll * 1.2, 0);
    const s = vs * (0.85 + 0.15 * e) * (1 + scroll * 0.6);
    group.scale.setScalar(s * 1.55);
    group.rotation.set(
      -0.35 + mouse.sy * 0.25 + scroll * 0.6,
      0.28 + mouse.sx * 0.35,
      Math.PI + 0.15 + Math.sin(t * 0.12) * 0.08 + scroll * 1.4 - (1 - e) * 1.2
    );


    renderer.render(scene, camera);
  };

  const loop = () => {
    render();
    raf = requestAnimationFrame(loop);
  };
  const start = () => {
    if (running || reduced) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  const io = new IntersectionObserver((en) => en.forEach((x) => (x.isIntersecting ? start() : stop())));
  io.observe(host);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

  if (reduced) render();
  return { destroy: () => (stop(), io.disconnect(), renderer.dispose()) };
}
