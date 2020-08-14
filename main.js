window.addEventListener("DOMContentLoaded", main);

const WIDTH = 256;
const HEIGHT = 256;

const pow = Math.pow;
const sqrt = Math.sqrt;
const floor = Math.floor;
const sin = Math.sin;
const cos = Math.cos;
const min = Math.min;
const max = Math.max;
const PI = Math.PI;
const fract = (x) => x - floor(x);
const mix = (a, b, t) => (1 - t) * a + t * b;
const clamp = (x, minVal, maxVal) => min(maxVal, max(minVal, x));
const dot2 = ([a0, a1], [b0, b1]) => a0 * b0 + a1 * b1;

function random_direction([s, t]) {
  const u = srand(s, t);
  const theta = 2 * PI * u;
  const x = cos(theta);
  const y = sin(theta);
  return [x, y];
}

function remap(x, [srcMin, srcMax], [destMin, destMax]) {
  if (srcMax <= srcMin) throw Error("Invalid source range");
  if (destMax <= destMin) throw Error("Invalid destination range");

  const X = clamp(x, srcMin, srcMax);

  const srcRange = srcMax - srcMin;
  const destRange = destMax - destMin;

  return ((X - srcMin) / srcRange) * destRange + destMin;
}

function smoothstep(v) {
  const t = clamp(v, 0.0, 1.0);
  return t * t * t * (t * (6.0 * t - 15.0) + 10);
}

function constant(v) {
  return v;
}

function verticalGradient(s, t) {
  return t;
}

function horizontalGradient(s, t) {
  return s;
}

function diagonalGradient(s, t) {
  return (s + t) / 2;
}

function radialGradient(s, t) {
  return 1 - sqrt(pow(s - 0.5, 2) + pow(t - 0.5, 2));
}

function srand(s, t) {
  return fract(sin(s * 269.5 + t * 183.3) * 43758.5453123);
}

function perlin(s, t) {
  const [iS, iT] = [floor(s), floor(t)];
  const [fS, fT] = [fract(s), fract(t)];

  // Position vectors
  const p00 = [iS + 0, iT + 0];
  const p01 = [iS + 0, iT + 1];
  const p10 = [iS + 1, iT + 0];
  const p11 = [iS + 1, iT + 1];

  // Gradient vectors
  const c00 = random_direction(p00);
  const c01 = random_direction(p01);
  const c10 = random_direction(p10);
  const c11 = random_direction(p11);

  // Displacement vectors
  const f00 = [fS - 0.0, fT - 0.0];
  const f01 = [fS - 0.0, fT - 1.0];
  const f10 = [fS - 1.0, fT - 0.0];
  const f11 = [fS - 1.0, fT - 1.0];

  // Displacement vectors dot products
  const d00 = dot2(c00, f00);
  const d01 = dot2(c01, f01);
  const d10 = dot2(c10, f10);
  const d11 = dot2(c11, f11);

  // Lerp
  const wS = smoothstep(fS);
  const wT = smoothstep(fT);
  const va = mix(d00, d10, wS);
  const vb = mix(d01, d11, wS);
  const vc = mix(va, vb, wT);

  return vc;
}

function render(s, t) {
  return perlin(s * 10, t * 10);
}

function main() {
  console.log("start");

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
  const heightmap = imageData.data;

  // Update heightmap
  for (let i = 0; i < heightmap.length; i += 4) {
    const j = i / 4;

    const x = j % WIDTH;
    const y = floor(j / WIDTH);

    const s = remap(x, [0, WIDTH], [0.0, 1.0]);
    const t = remap(y, [0, HEIGHT], [0.0, 1.0]);

    const v = remap(render(s, t), [0.0, 1.0], [0, 255]);

    heightmap[i] = heightmap[i + 1] = heightmap[i + 2] = v;
    heightmap[i + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);

  console.log("done");
}
