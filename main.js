window.addEventListener("DOMContentLoaded", main);

const WIDTH = 256;
const HEIGHT = 256;

const pow = Math.pow;
const sqrt = Math.sqrt;
const floor = Math.floor;
const fract = (x) => x - floor(x);
const sin = Math.sin;

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

function render(s, t) {
  return srand(s, t);
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
    const y = Math.floor(j / WIDTH);

    const s = x / WIDTH;
    const t = y / HEIGHT;

    const v = render(s, t);

    heightmap[i] = v * 255;
    heightmap[i + 1] = v * 255;
    heightmap[i + 2] = v * 255;
    heightmap[i + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);

  console.log("done");
}
