import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { writeVertexColors } from "../lib/colormap";
import type { ActivationMatrix } from "../lib/activations";

type Props = {
  meshUrl: string;
  activations: ActivationMatrix | null;
  timestep: number;
  showLeft: boolean;
  showRight: boolean;
  hemisphereSplit: number;
};

function BrainMesh({
  meshUrl,
  activations,
  timestep,
  showLeft,
  showRight,
  hemisphereSplit,
}: Props) {
  const gltf = useGLTF(meshUrl);
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    let geom: THREE.BufferGeometry | null = null;
    gltf.scene.traverse((obj) => {
      if (!geom && (obj as THREE.Mesh).isMesh) {
        geom = (obj as THREE.Mesh).geometry as THREE.BufferGeometry;
      }
    });
    if (!geom) throw new Error("no geometry in glb");
    const g = geom as THREE.BufferGeometry;
    const n = g.attributes.position.count;
    if (!g.attributes.color) {
      g.setAttribute(
        "color",
        new THREE.BufferAttribute(new Float32Array(n * 3).fill(0.7), 3),
      );
    }
    return g;
  }, [gltf]);

  // Bounds for colormap scaling — computed once over whole matrix.
  const bounds = useMemo(() => {
    if (!activations) return { min: 0, max: 1 };
    let min = Infinity;
    let max = -Infinity;
    const d = activations.data;
    for (let i = 0; i < d.length; i++) {
      const v = d[i];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    return { min, max };
  }, [activations]);

  useFrame(() => {
    if (!activations) return;
    const { T, V, data } = activations;
    const t = Math.min(timestep, T - 1);
    const slice = data.subarray(t * V, (t + 1) * V);

    const colorAttr = geometry.attributes.color as THREE.BufferAttribute;
    const colors = colorAttr.array as Float32Array;
    writeVertexColors(colors, slice, bounds.min, bounds.max);

    // Hemisphere masking: push hidden verts to black and below the surface
    // via color only (keeping geometry intact for simplicity).
    if (!showLeft) {
      for (let i = 0; i < hemisphereSplit; i++) {
        colors[i * 3 + 0] = 0.08;
        colors[i * 3 + 1] = 0.08;
        colors[i * 3 + 2] = 0.10;
      }
    }
    if (!showRight) {
      for (let i = hemisphereSplit; i < V; i++) {
        colors[i * 3 + 0] = 0.08;
        colors[i * 3 + 1] = 0.08;
        colors[i * 3 + 2] = 0.10;
      }
    }
    colorAttr.needsUpdate = true;
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial vertexColors flatShading={false} roughness={0.6} />
    </mesh>
  );
}

export default function Brain(props: Props) {
  return (
    <Canvas
      camera={{ position: [0, 0, 200], fov: 45 }}
      dpr={[1, 2]}
      style={{ background: "#0b0d12" }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[50, 80, 100]} intensity={0.8} />
      <directionalLight position={[-80, -40, 60]} intensity={0.3} />
      <BrainMesh {...props} />
      <OrbitControls enableDamping makeDefault />
    </Canvas>
  );
}
