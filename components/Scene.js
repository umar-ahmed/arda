import React, { useMemo } from "react";
import { Canvas } from "react-three-fiber";
import { OrbitControls, Sky } from "drei";
import * as THREE from "three";

import { main } from "../lib/main";

export default function Scene() {
  const imageData = useMemo(() => main(), []);

  return (
    <Canvas shadowMap={true}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} intensity={0.5} />

      <mesh rotation-x={-Math.PI / 2} receiveShadow={true}>
        <planeGeometry attach="geometry" args={[1, 1, 255, 255]} />
        <meshStandardMaterial
          attach="material"
          side={THREE.DoubleSide}
          color="orange"
        >
          <dataTexture
            attach="displacementMap"
            args={[imageData.data, 256, 256, THREE.RGBAFormat]}
          />
        </meshStandardMaterial>
      </mesh>

      <OrbitControls />
    </Canvas>
  );
}
