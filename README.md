# Arda

**Arda** is a terrain generator that allows game developers and VFX artists to generate natural-looking terrain heightmaps for use in 3D applications right from their web browser. Arda lowers the barrier to entry for terrain generation by distributing on the web and being entirely open-source.

# Motivation

Realistic terrain can make a big difference in the aesthetics of games and films that need to "ground" 3D scenes in natural-looking locations. There are two main approaches to generating terrain that I'm aware of:

- Making use of data captured using satellite elevation data
- Procedural generation using layered noises

Both of these approaches usually generate what is called a "heightmap", a black-and-white image of the elevation of the terrain geometry at a particular XY-coordinate. However, both of these approaches have some cons.

While using satellite elevation data can result in very natural looking terrain, the issue is that once the data is captured, the resolution of the elevation information is fixed. This means that we must make use of very high resolution heightmaps to achieve realism. Additionally, art directing this data can be a challenge since we are limited by the types of terrain that exist on the planet and further limited to the ones that have been captured in high enough detail.

Procedural generation on the other hand suffers the opposite problem. Using noises, we can art-direct the terrain using different parameters like noise type, amplitude and frequency, and the seed value. Using these parameters, layered noises can get us quite far when it comes to the level of detail that we desire for natural-looking terrain. However, they don't capture the physical processes that occur in the real world on terrain, such as: erosion due to water flow, tectonic plate interaction, erosion due to thermal expansion/contraction, differences in soil layers, etc. These physical processes have a big impact on the last 10-15% of the "natural-ness" of the terrain. To achieve this realism, we need to simulate these processes on our layered noises.

Much work has been done prior to research how these processes can be simulated efficiently on high-end CPUs and has been made available to professionals in the form of commercial desktop software. Some examples include the popular [World Machine](https://www.world-machine.com/) and [Gaea](https://quadspinner.com/) softwares. However, most of these packages require specific hardware or operating system requirements, making it difficult to start playing around with terrain generation.

With the improvements in the capabilities of the web platform in the past couple of years, including but not limited to Web Workers, WebGL, WebAssembly, and the upcoming WebGPU, it is looking like it might soon be possible to create complex applications like terrain generators entirely on the web! Examples like Figma and Google Maps already show us what is possible on the web nowadays, and have motivated me to explore this idea of a "web-native" terrain generator more seriously.

# My Process

Here are the tasks that I hope to accomplish in order to achieve a Minimum Viable Product (MVP):

- [x] Set up HTML and JS files
- [x] Create a `canvas` and render an in-memory representation of the heightmap on it
- [x] Solid color
- [x] Gradient
- [ ] Perlin noise
- [ ] Display a 3D preview of the heightmap using ThreeJS
- [ ] Implement hydraulic erosion
- [ ] Load an image from disk
- [ ] Mix node

# Outcome

what you tried (what worked and did not work)
