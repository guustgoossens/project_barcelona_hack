import { useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { writeVertexColors, computeThreshold } from "../lib/colormap";
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
    const colorArr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      colorArr[i * 3 + 0] = 0.82;
      colorArr[i * 3 + 1] = 0.84;
      colorArr[i * 3 + 2] = 0.86;
    }
    g.setAttribute("color", new THREE.BufferAttribute(colorArr, 3));
    g.computeVertexNormals();
    return g;
  }, [gltf]);

  // Compute threshold per timestep so only top 20% of vertices light up
  const bounds = useMemo(() => {
    if (!activations) return { threshold: 0, max: 1 };
    const { T, V, data } = activations;
    const t = Math.min(timestep, T - 1);
    const slice = data.subarray(t * V, (t + 1) * V);
    return computeThreshold(slice, 20);
  }, [activations, timestep]);

  useEffect(() => {
    if (!activations) return;
    const { T, V, data } = activations;
    const t = Math.min(timestep, T - 1);
    const slice = data.subarray(t * V, (t + 1) * V);

    const colorAttr = geometry.attributes.color as THREE.BufferAttribute;
    const colors = colorAttr.array as Float32Array;
    const count = Math.min(V, geometry.attributes.position.count);

    writeVertexColors(colors, slice.subarray(0, count), bounds.threshold, bounds.max);

    if (!showLeft) {
      for (let i = 0; i < hemisphereSplit; i++) {
        colors[i * 3 + 0] = 0.82;
        colors[i * 3 + 1] = 0.84;
        colors[i * 3 + 2] = 0.86;
      }
    }
    if (!showRight) {
      for (let i = hemisphereSplit; i < count; i++) {
        colors[i * 3 + 0] = 0.82;
        colors[i * 3 + 1] = 0.84;
        colors[i * 3 + 2] = 0.86;
      }
    }
    colorAttr.needsUpdate = true;
  }, [activations, timestep, bounds, geometry, showLeft, showRight, hemisphereSplit]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial vertexColors roughness={0.5} metalness={0.0} />
    </mesh>
  );
}

export default function Brain(props: Props) {
  return (
    <Canvas
      camera={{ position: [0, 0, 300], fov: 45 }}
      dpr={[1, 1.5]}
      frameloop="always"
      gl={{ antialias: true }}
      style={{ background: "#F3F4F6" }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[60, 80, 100]} intensity={1.0} />
      <directionalLight position={[-80, -40, 60]} intensity={0.5} />
      <BrainMesh {...props} />
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.3}
        enableDamping
        dampingFactor={0.05}
        makeDefault
      />
    </Canvas>
  );
}
