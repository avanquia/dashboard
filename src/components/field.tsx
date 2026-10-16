"use client";

import { useEffect, useRef } from "react";

const VERT = `#version 300 es
in vec2 p;
void main() { gl_Position = vec4(p, 0., 1.); }`;

// Horizontal "brushed paint" wisps (anisotropic fbm with a slow domain warp,
// soft vignette, light leak and a glow under the cursor), sampled once per
// character cell and drawn as ASCII glyphs whose density follows intensity.
const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes, uCell;
uniform float uTime, uFade;
uniform vec3 uPointer;
out vec4 outColor;

float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * .1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * f * (f * (f * 6. - 15.) + 10.);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), u.x),
             mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), u.x), u.y);
}

float fbm(vec2 p, int octaves) {
  float s = 0., a = .5;
  for (int i = 0; i < octaves; i++) {
    s += a * noise(p);
    p = p * 2.03 + vec2(11.3, 5.7);
    a *= .5;
  }
  return s;
}

// Field intensity at a pixel position.
float field(vec2 px) {
  float ar = uRes.x / uRes.y;
  vec2 st = px / uRes * vec2(ar, 1.);
  float t = uTime;

  vec2 p = vec2(st.x * 1.1, st.y * 6.5);
  p.y += .45 * sin(st.x * 2.2 - t * .28) + .2 * sin(st.x * 4.9 - t * .41 + 1.7);
  p.x -= t * .035;

  vec2 q = p * vec2(.5, .4);
  vec2 warp = vec2(fbm(q + vec2(0., t * .045), 3), fbm(q + vec2(4.1, 1.3 - t * .037), 3));
  float n = fbm(p + warp * vec2(1.2, .9), 5);
  float paint = smoothstep(.42, .84, n);

  vec2 c = (st - vec2(.5 * ar, .5)) / vec2(max(ar, 1.) * .62, .62);
  float mask = 1. - .6 * smoothstep(.45, 1.25, length(c));
  // Quiet zone behind the centered copy so the text stays readable.
  vec2 k = (st - vec2(.5 * ar, .44)) / vec2(.42, .26);
  mask *= 1. - .85 * exp(-dot(k, k) * 1.4);
  vec2 f = (st - vec2(.5 * ar, .065)) / vec2(.16, .045);
  mask *= 1. - .9 * exp(-dot(f, f));

  vec2 e = st - vec2(uPointer.x * ar, uPointer.y);
  mask *= 1. + .6 * uPointer.z * exp(-dot(e, e) / .035);

  float fade = uFade * uFade * (3. - 2. * uFade);
  return clamp(paint * mask * fade, 0., 1.);
}

// 5x5 glyph bitmaps, ordered from sparse to dense: . : * o & 8 @ #
int glyph(float v) {
  if (v < .12) return 0;
  if (v < .22) return 4096;
  if (v < .32) return 65600;
  if (v < .42) return 332772;
  if (v < .52) return 15255086;
  if (v < .62) return 23385164;
  if (v < .72) return 15252014;
  if (v < .84) return 13199452;
  return 11512810;
}

void main() {
  vec2 cellId = floor(gl_FragCoord.xy / uCell);
  float v = field((cellId + .5) * uCell);

  // Glyph occupies a 5x5 grid inside the cell, with a margin around it.
  vec2 g = fract(gl_FragCoord.xy / uCell) * vec2(6., 8.) - vec2(.5, 1.5);
  ivec2 ig = ivec2(floor(g));
  float on = 0.;
  if (ig.x >= 0 && ig.x < 5 && ig.y >= 0 && ig.y < 5) {
    on = float((glyph(v) >> ((4 - ig.x) + 5 * ig.y)) & 1);
  }

  float ar = uRes.x / uRes.y;
  vec2 st = gl_FragCoord.xy / uRes * vec2(ar, 1.);
  vec2 l = (st - vec2(.8 * ar, 1.)) / vec2(max(ar, 1.) * .63, .7);
  float fade = uFade * uFade * (3. - 2. * uFade);

  vec3 ink = vec3(.0588, .0549, .051);
  vec3 col = ink + .035 * v + on * vec3(.5, .49, .45) * (.18 + .4 * v) + .04 * exp(-dot(l, l)) * fade;
  outColor = vec4(col, 1.);
}`;

const CELL = [8, 14]; // character cell in CSS pixels
const FRAME_MS = 32; // ~30fps is plenty for a slow field
const TIME_OFFSET = 40; // start mid-flow instead of at t=0

export function Field({ onUnsupported }: { onUnsupported?: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
    if (!gl) return onUnsupported?.();

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "");
      return s;
    };

    const program = gl.createProgram()!;
    try {
      gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
      gl.bindAttribLocation(program, 0, "p");
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "");
    } catch (err) {
      console.warn("Field shader failed", err);
      return onUnsupported?.();
    }
    gl.useProgram(program);

    // One oversized triangle covering the viewport.
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const u = {
      res: gl.getUniformLocation(program, "uRes"),
      time: gl.getUniformLocation(program, "uTime"),
      fade: gl.getUniformLocation(program, "uFade"),
      pointer: gl.getUniformLocation(program, "uPointer"),
      cell: gl.getUniformLocation(program, "uCell"),
    };

    // Glyphs need crisp pixels, so render at device resolution (capped).
    let scale = 1;
    const resize = () => {
      const w = canvas.clientWidth || innerWidth;
      const h = canvas.clientHeight || innerHeight;
      scale = Math.min(devicePixelRatio || 1, 2, Math.sqrt(4e6 / (w * h)));
      canvas.width = Math.max(1, Math.round(w * scale));
      canvas.height = Math.max(1, Math.round(h * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    const ptr = { x: 0.5, y: 0.5, on: 0, tx: 0.5, ty: 0.5, ton: 0 };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      ptr.tx = e.clientX / innerWidth;
      ptr.ty = 1 - e.clientY / innerHeight;
      ptr.ton = 1;
    };
    const onLeave = () => {
      ptr.ton = 0;
    };

    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const start = performance.now();
    let raf = 0;
    let last = -Infinity;

    const draw = () => {
      const elapsed = (performance.now() - start) / 1000;
      const moving = !reduced.matches;
      ptr.x += (ptr.tx - ptr.x) * 0.05;
      ptr.y += (ptr.ty - ptr.y) * 0.05;
      ptr.on += (ptr.ton - ptr.on) * 0.03;
      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform2f(u.cell, CELL[0] * scale, CELL[1] * scale);
      gl.uniform1f(u.time, moving ? TIME_OFFSET + elapsed : TIME_OFFSET);
      gl.uniform1f(u.fade, moving ? Math.min(1, Math.max(0, elapsed - 0.3) / 3.2) : 1);
      gl.uniform3f(u.pointer, ptr.x, ptr.y, moving ? ptr.on : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last < FRAME_MS) return;
      last = now;
      draw();
    };

    const run = () => {
      cancelAnimationFrame(raf);
      if (reduced.matches) draw();
      else raf = requestAnimationFrame(tick);
    };

    const onResize = () => {
      resize();
      if (reduced.matches) draw();
    };
    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      onUnsupported?.();
    };

    addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    addEventListener("resize", onResize);
    reduced.addEventListener("change", run);
    canvas.addEventListener("webglcontextlost", onLost);
    run();

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      removeEventListener("resize", onResize);
      reduced.removeEventListener("change", run);
      canvas.removeEventListener("webglcontextlost", onLost);
    };
  }, [onUnsupported]);

  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 z-0 block size-full" />;
}
