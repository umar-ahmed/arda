window.addEventListener("DOMContentLoaded", main);

const WIDTH = 256;
const HEIGHT = 256;

function render(s, t) {
  return [s, t, 0.5, 1.0];
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

    const [r, g, b, a] = render(s, t);

    heightmap[i] = r * 255;
    heightmap[i + 1] = g * 255;
    heightmap[i + 2] = b * 255;
    heightmap[i + 3] = a * 255;
  }

  ctx.putImageData(imageData, 0, 0);

  console.log("done");
}
