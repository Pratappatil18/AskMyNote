import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

function Avatar({ speaking }: { speaking: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      if (speaking) {
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 10) * 0.05);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <MeshDistortMaterial
          color="#4f46e5"
          speed={speaking ? 5 : 2}
          distort={speaking ? 0.4 : 0.2}
          radius={1}
        />
      </Sphere>
    </Float>
  );
}

export default function HoloTeacher({ speaking }: { speaking: boolean }) {
  return (
    <div className="w-full h-64 bg-slate-900/50 rounded-2xl overflow-hidden relative border border-white/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />
      <Canvas camera={{ position: [0, 0, 4] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Avatar speaking={speaking} />
      </Canvas>
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <div className={speaking ? "w-2 h-2 rounded-full bg-emerald-500 animate-pulse" : "w-2 h-2 rounded-full bg-slate-500"} />
        <span className="text-xs font-mono text-white/50 uppercase tracking-widest">
          {speaking ? "Transmitting..." : "Standby"}
        </span>
      </div>
    </div>
  );
}
