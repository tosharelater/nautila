/**
 * NAUTILA — hero canvas (Radiant-inspired)
 * Soft animated flow-gradient with pointer-reactive drift.
 */

const VERT = `attribute vec2 a_pos;void main(){gl_Position=vec4(a_pos,0.,1.);}`;

const FRAG = `precision mediump float;
uniform vec2 u_res;uniform float u_time;uniform vec2 u_mouse;
const vec3 A=vec3(0.976,0.980,0.968);
const vec3 B=vec3(0.631,0.776,0.647);
const vec3 C=vec3(0.439,0.596,0.463);
const vec3 D=vec3(0.255,0.365,0.263);
vec2 hash2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return -1.+2.*fract(sin(p)*43758.5453123);}
float gnoise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);vec2 u=f*f*(3.-2.*f);
return mix(mix(dot(hash2(i+vec2(0.,0.)),f-vec2(0.,0.)),dot(hash2(i+vec2(1.,0.)),f-vec2(1.,0.)),u.x),
mix(dot(hash2(i+vec2(0.,1.)),f-vec2(0.,1.)),dot(hash2(i+vec2(1.,1.)),f-vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.;float a=.55;for(int i=0;i<5;i++){v+=a*gnoise(p);p*=2.03;a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/u_res;
  vec2 p=uv*vec2(u_res.x/u_res.y,1.);
  vec2 m=u_mouse*vec2(u_res.x/u_res.y,1.)*0.55;
  float t=u_time*.055;
  float n=fbm(p*1.2+vec2(t*.85,t*.42)+m*.35);
  float n2=fbm(p*2.35-vec2(t*.5,t*.28)+n*.8-m*.25);
  float msk=smoothstep(.12,.92,n2*.5+.5);
  vec3 col=mix(A,B,smoothstep(.05,.62,uv.y*.5+msk*.65));
  col=mix(col,C,smoothstep(.4,.95,msk)*.68);
  col=mix(col,D,smoothstep(.68,1.,msk)*.38);
  /* soft spotlight that follows pointer */
  float spot=smoothstep(.85,.05,length(uv-vec2(.5)+u_mouse*vec2(.35,-.28)));
  col=mix(col,mix(B,A,.55),spot*.28);
  col=mix(col,A,smoothstep(.78,.12,length(uv-vec2(.2,.84)))*.48);
  col=mix(col,A,smoothstep(.4,0.,uv.y)*.72);
  gl_FragColor=vec4(col,1.);
}`;

export interface GradientHandle {
  destroy: () => void;
}

export function createGradient(canvas: HTMLCanvasElement): GradientHandle | null {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) return null;

  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn('[nautila-gradient]', gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  };

  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;

  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, 'u_res');
  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');

  let raf = 0;
  let running = false;
  let mx = 0;
  let my = 0;
  let tx = 0;
  let ty = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width - 0.5;
    ty = (e.clientY - r.top) / r.height - 0.5;
  };

  const resize = () => {
    const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  };

  const draw = (t: number) => {
    resize();
    mx += (tx - mx) * 0.06;
    my += (ty - my) * 0.06;
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, reduced ? 0 : t * 0.001);
    gl.uniform2f(uMouse, mx, my);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const loop = (t: number) => {
    draw(t);
    raf = requestAnimationFrame(loop);
  };

  const start = () => {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(loop);
  };

  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => (e.isIntersecting ? start() : stop())),
    { threshold: 0.02 }
  );
  io.observe(canvas);

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', onMove, { passive: true });
  const ro = new ResizeObserver(() => resize());
  ro.observe(canvas);
  resize();
  draw(0);

  return {
    destroy() {
      stop();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
