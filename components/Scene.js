import React, { useEffect, useMemo, useRef } from "react";
import { Canvas } from "react-three-fiber";
import { OrbitControls, Plane, Sky, softShadows } from "drei";
import * as THREE from "three";

import { main } from "../lib/main";

softShadows();

export default function Scene() {
  const imageData = useMemo(() => main(), []);

  return (
    <Canvas colorManagement shadowMap>
      <ambientLight intensity={0.4} />
      <directionalLight
        castShadow
        position={[2.5, 8, 5]}
        intensity={1.2}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      <mesh rotation-x={-Math.PI / 2} receiveShadow castShadow>
        <planeGeometry attach="geometry" args={[1, 1, 256, 256]} />
        <meshStandardMaterial
          attach="material"
          side={THREE.DoubleSide}
          displacementScale={1}
        >
          <dataTexture
            attach="displacementMap"
            args={[imageData.data, 256, 256, THREE.RGBAFormat]}
          />
          <dataTexture
            attach="map"
            args={[imageData.data, 256, 256, THREE.RGBAFormat]}
          />
        </meshStandardMaterial>
      </mesh>

      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry attach="geometry" args={[10, 10, 2, 2]} />
        <shadowMaterial attach="material" transparent opacity={0.4} />
      </mesh>

      <OrbitControls />
      <gridHelper />
      <axesHelper />
    </Canvas>
  );
}
