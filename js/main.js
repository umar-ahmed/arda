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
const norm2 = (a) => sqrt(dot2(a, a));
const normalize2 = ([a0, a1]) => {
  const length = norm2([a0, a1]);
  return length === 0.0 ? [0.0, 0.0] : [a0 / length, a1 / length];
};

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
  return fract(sin(s * 12.9898 + t * 78.233) * 43758.5453123);
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

  return remap(vc, [-0.5, 0.5], [0, 1]);
}

function terrain(s, t) {
  return (
    0.6 * perlin(s, t) +
    0.2 * perlin(2 * s, 2 * t) +
    0.1 * perlin(5 * s, 5 * t) +
    0.05 * perlin(10 * s, 10 * t)
  );
}

function render(s, t) {
  // return constant(0.5);
  // return verticalGradient(s, t);
  // return horizontalGradient(s, t);
  // return diagonalGradient(s, t);
  // return radialGradient(s, t);
  // return srand(s, t);
  // return perlin(s * 2, t * 2);
  return terrain(s, t);
}

function generate(heightmap) {
  console.log("start generate");

  // Update heightmap
  for (let i = 0; i < heightmap.length; i += 4) {
    const j = i / 4;

    const x = j % WIDTH;
    const y = floor(j / WIDTH);

    const s = remap(x, [0, WIDTH], [0.0, 1.0]);
    const t = remap(y, [0, HEIGHT], [0.0, 1.0]);

    const r = render(s, t);
    const v = remap(r, [0.0, 1.0], [0, 255]);

    heightmap[i] = heightmap[i + 1] = heightmap[i + 2] = v;
    heightmap[i + 3] = 255;
  }

  console.log("done generate");
}

function display3D(data) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const geometry = new THREE.PlaneGeometry(0, 0, WIDTH - 1, HEIGHT - 1);
  const material = new THREE.MeshLambertMaterial({
    color: 0x00ff00,
    side: THREE.DoubleSide,
  });
  const plane = new THREE.Mesh(geometry, material);
  scene.add(plane);

  var light = new THREE.AmbientLight(0x404040); // soft white light
  scene.add(light);

  var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  scene.add(directionalLight);

  camera.position.z = 3;
  camera.position.y = 1;

  plane.rotation.x = -PI / 2;

  for (let i = 0; i < plane.geometry.vertices.length; i++) {
    const terrainValue = data[4 * i] / 255;
    plane.geometry.vertices[i].z = terrainValue;
  }

  geometry.computeFaceNormals();
  geometry.computeVertexNormals();

  function animate() {
    requestAnimationFrame(animate);

    plane.rotation.z += 0.01;

    renderer.render(scene, camera);
  }

  animate();
}

class Particle {
  constructor(x, y) {
    this.position = {
      x,
      y,
    };
    this.velocity = {
      x: 0.0,
      y: 0.0,
    };
    this.volume = 1.0;
    this.sediment = 0.0;
  }
}

function getPixelValue(data, x, y) {
  const X = floor(clamp(x, 0.0, 1.0) * WIDTH);
  const Y = floor(clamp(y, 0.0, 1.0) * HEIGHT);
  const i = (Y * HEIGHT + X) * 4;
  const r = remap(data[i + 0], [0, 255], [0.0, 1.0]);
  const g = remap(data[i + 1], [0, 255], [0.0, 1.0]);
  const b = remap(data[i + 2], [0, 255], [0.0, 1.0]);
  const a = remap(data[i + 3], [0, 255], [0.0, 1.0]);
  return [r, g, b, a];
}

function setPixelValue(data, x, y, rgba) {
  const [r, g, b, a] = rgba;
  const X = floor(x * WIDTH);
  const Y = floor(y * HEIGHT);
  const i = (Y * HEIGHT + X) * 4;
  data[i + 0] = remap(r, [0.0, 1.0], [0, 255]);
  data[i + 1] = remap(g, [0.0, 1.0], [0, 255]);
  data[i + 2] = remap(b, [0.0, 1.0], [0, 255]);
  data[i + 3] = remap(a, [0.0, 1.0], [0, 255]);
}

const getHeightMapValue = (data, x, y) => getPixelValue(data, x, y)[0];
const setHeightMapValue = (data, x, y, v) =>
  setPixelValue(data, x, y, [v, v, v, 1.0]);

function getSurfaceNormal(data, x, y) {
  const dy =
    (getHeightMapValue(data, x, y - 0.01) -
      getHeightMapValue(data, x, y + 0.01)) /
    2;
  const dx =
    (getHeightMapValue(data, x - 0.01, y) -
      getHeightMapValue(data, x + 0.01, y)) /
    2;
  return normalize2([dx, dy]);
}

const MIN_VOLUME = 0.1;
const PARTICLE_DENSITY = 1.0;
const FRICTION = 0.1;
const EVAPORATION_RATE = 0.1;
const DEPOSITION_RATE = 0.2;
const EROSION_RATE = 0.3;
const dt = 1 / 100;

function erosion(data) {
  for (let t = 0; t < 20; t++) {
    const p = new Particle(srand(t, 6), srand(1, t));
    // const { x, y } = p.position;
    // setPixelValue(data, x, y, [1.0, 0.0, 0, 1.0]);

    while (p.volume > MIN_VOLUME) {
      const { x, y } = p.position;
      const [Fx, Fy] = getSurfaceNormal(data, x, y);
      const mass = p.volume * PARTICLE_DENSITY;
      const [ax, ay] = [Fx / mass, Fy / mass];

      // Acceleration due to gravity
      p.velocity.x += dt * ax;
      p.velocity.y += dt * ay;

      // Update particle position
      p.position.x += dt * p.velocity.x;
      p.position.y += dt * p.velocity.y;

      // Acceleration due to friction
      p.velocity.x *= 1.0 - dt * FRICTION;
      p.velocity.y *= 1.0 - dt * FRICTION;

      // Stop simulating particle if it has stopped moving or exceeded bounds
      if (
        (p.velocity.x === 0 && p.velocity.y === 0) ||
        p.position.x >= 1.0 ||
        p.position.y >= 1.0 ||
        p.position.x <= 0.0 ||
        p.position.y <= 0.0
      )
        break;

      const oldHeight = getHeightMapValue(data, x, y);
      const newHeight = getHeightMapValue(data, p.position.x, p.position.y);
      const deltaHeight = newHeight - oldHeight;
      const uphill = deltaHeight > 0;
      const speed = norm2([p.velocity.x, p.velocity.y]);
      const maxSediment = max(-deltaHeight * p.volume * speed, 0.0);

      // If carrying more sediment than capacity, or if flowing uphill:
      if (p.sediment > maxSediment || uphill) {
        const amountToDeposit = uphill
          ? min(deltaHeight, p.sediment)
          : (p.sediment - maxSediment) * dt * DEPOSITION_RATE;
        p.sediment -= amountToDeposit;
        setHeightMapValue(data, x, y, oldHeight + amountToDeposit);
      } else {
        const amountToErode = min(
          (maxSediment - p.sediment) * dt * EROSION_RATE,
          -deltaHeight
        );
        p.sediment += amountToErode;
        setHeightMapValue(data, x, y, oldHeight - amountToErode);
      }

      p.volume *= 1.0 - dt * EVAPORATION_RATE;

      setPixelValue(data, x, y, [1.0, p.volume, 1.0, 1.0]);
    }
  }
}

function main() {
  const canvas = document.getElementById("heightmap");
  const ctx = canvas.getContext("2d");

  const imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
  const heightmap = imageData.data;

  generate(heightmap);

  erosion(heightmap);

  ctx.putImageData(imageData, 0, 0);

  display3D(imageData.data);
}
