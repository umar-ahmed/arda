window.addEventListener("DOMContentLoaded", main);

const SIZE = 256;

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

    const x = j % SIZE;
    const y = floor(j / SIZE);

    const s = remap(x, [0, SIZE], [0.0, 1.0]);
    const t = remap(y, [0, SIZE], [0.0, 1.0]);

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

  const geometry = new THREE.PlaneGeometry(0, 0, SIZE - 1, SIZE - 1);
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

function erosion(heightmap) {
  let particles = [];
  for (let i = 0; i < SIZE; i++) {
    particles[i] = [];
  }

  // Create a water particle at each point in heightmap
  for (let i = 0; i < heightmap.length; i += 4) {
    const j = i / 4;

    const x = j % SIZE;
    const y = floor(j / SIZE);

    particles[x][y] = {
      x,
      y,
      z: remap(heightmap[i], [0, 255], [0.0, 1.0]),
      erosion: 0,
      sediment: 0,
      water: 1,
      newWater: 0,
      down: 0,
    };
  }

  const scale = 0.5;
  const erosion = 0.005 * scale;
  const deposition = 0.000002 * scale;
  const evaporation = 0.5;
  const iterations = 300;

  // Run erosion simulation a fixed number of iterations
  for (var i = 0; i < iterations; i++) {
    for (let x = 1; x < SIZE - 1; x++) {
      for (let y = 1; y < SIZE - 1; y++) {
        let down = 0;
        down += max(particles[x][y].z - particles[x + 1][y].z, 0);
        down += max(particles[x][y].z - particles[x + 1][y + 1].z, 0);
        down += max(particles[x][y].z - particles[x + 1][y - 1].z, 0);
        down += max(particles[x][y].z - particles[x][y + 1].z, 0);
        down += max(particles[x][y].z - particles[x][y - 1].z, 0);
        down += max(particles[x][y].z - particles[x - 1][y].z, 0);
        down += max(particles[x][y].z - particles[x - 1][y + 1].z, 0);
        down += max(particles[x][y].z - particles[x - 1][y - 1].z, 0);

        particles[x][y].down = down;

        if (down != 0) {
          let water = particles[x][y].water * evaporation;
          let stayingWater = (water * 0.0002) / (down * scale + 1);
          water = water - stayingWater;

          particles[x + 1][y].newWater +=
            (max(particles[x][y].z - particles[x + 1][y].z, 0) / down) * water;
          particles[x + 1][y + 1].newWater +=
            (max(particles[x][y].z - particles[x + 1][y + 1].z, 0) / down) *
            water;
          particles[x + 1][y - 1].newWater +=
            (max(particles[x][y].z - particles[x + 1][y - 1].z, 0) / down) *
            water;
          particles[x][y + 1].newWater +=
            (max(particles[x][y].z - particles[x][y + 1].z, 0) / down) * water;
          particles[x][y - 1].newWater +=
            (max(particles[x][y].z - particles[x][y - 1].z, 0) / down) * water;
          particles[x - 1][y].newWater +=
            (max(particles[x][y].z - particles[x - 1][y].z, 0) / down) * water;
          particles[x - 1][y + 1].newWater +=
            (max(particles[x][y].z - particles[x - 1][y + 1].z, 0) / down) *
            water;
          particles[x - 1][y - 1].newWater +=
            (max(particles[x][y].z - particles[x - 1][y - 1].z, 0) / down) *
            water;

          particles[x][y].water = 1 + stayingWater;
        }
      }
    }

    for (let x = 1; x < SIZE - 1; x++) {
      for (let y = 1; y < SIZE - 1; y++) {
        particles[x][y].water += particles[x][y].newWater;
        particles[x][y].newWater = 0;

        const oldZ = particles[x][y].z;
        particles[x][y].z +=
          -(particles[x][y].down - 0.005 / scale) *
            particles[x][y].water *
            erosion +
          particles[x][y].water * deposition;
        particles[x][y].erosion = oldZ - particles[x][y].z;

        if (oldZ < particles[x][y].z) {
          particles[x][y].water = max(
            particles[x][y].water - (particles[x][y].z - oldZ) * 1000,
            0
          );
        }
      }
    }
  }

  // Update heightmap
  for (let i = 0; i < heightmap.length; i += 4) {
    const j = i / 4;

    const x = j % SIZE;
    const y = floor(j / SIZE);

    const v = remap(particles[x][y].z, [0.0, 1.0], [0, 255]);

    heightmap[i] = heightmap[i + 1] = heightmap[i + 2] = v;
    heightmap[i + 3] = 255;
  }
}

function main() {
  const canvas = document.getElementById("heightmap");
  const ctx = canvas.getContext("2d");

  const imageData = ctx.getImageData(0, 0, SIZE, SIZE);
  const heightmap = imageData.data;

  generate(heightmap);

  erosion(heightmap);

  ctx.putImageData(imageData, 0, 0);

  display3D(imageData.data);
}
