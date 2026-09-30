'use client';

import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center } from '@react-three/drei';
import * as THREE from 'three';

function ShuttleModel() {
  const { scene } = useGLTF('/models/space_shuttle_discovery.glb');
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.2;
    groupRef.current.position.y = Math.sin(t * 0.8) * 0.08;
  });

  return (
    <group ref={groupRef}>
      <Center>
        <primitive object={scene} scale={[1.2, 1.2, 1.2]} />
      </Center>
    </group>
  );
}

interface MissionEnvironmentSceneProps {
  cabinPressure?: number; // kPa
  o2Percentage?: number; // %
  co2Level?: number; // %
  cabinTemp?: number; // °C
  radiationLevel?: number; // mSv/h
}

export default function MissionEnvironmentScene({
  cabinPressure = 101.3,
  o2Percentage = 20.9,
  co2Level = 0.38,
  cabinTemp = 21.5,
  radiationLevel = 0.12
}: MissionEnvironmentSceneProps) {
  return (
    <div className="relative w-full h-[320px] bg-gradient-to-b from-slate-900 via-slate-950 to-blue-950/40 rounded-3xl border border-slate-800 shadow-xl overflow-hidden p-4 flex flex-col justify-between">
      
      {/* Header Badge */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/60 shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-100 tracking-tight">Habitat Environmental Telemetry</span>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
          ORBITAL VEHICLE ACTIVE
        </span>
      </div>

      {/* Three.js 3D Canvas */}
      <div className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing">
        <Canvas
          camera={{ position: [0, 2, 5], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={1.2} />
          <directionalLight position={[5, 8, 5]} intensity={2.0} />
          <pointLight position={[-5, -5, -5]} intensity={0.8} />
          <Suspense fallback={null}>
            <ShuttleModel />
          </Suspense>
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={2}
            maxDistance={8}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Canvas>
      </div>

      {/* Floating Telemetry Pill Cards */}
      <div className="z-10 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-slate-900/80 backdrop-blur-md p-2.5 rounded-2xl border border-slate-800 shadow-md">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">PRESSURE</span>
          <span className="text-sm font-black text-slate-100">{cabinPressure} kPa</span>
        </div>
        <div className="bg-slate-900/80 backdrop-blur-md p-2.5 rounded-2xl border border-slate-800 shadow-md">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">O2 CONCENTRATION</span>
          <span className="text-sm font-black text-slate-100">{o2Percentage}%</span>
        </div>
        <div className="bg-slate-900/80 backdrop-blur-md p-2.5 rounded-2xl border border-slate-800 shadow-md">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">CO2 LEVEL</span>
          <span className="text-sm font-black text-slate-100">{co2Level}%</span>
        </div>
        <div className="bg-slate-900/80 backdrop-blur-md p-2.5 rounded-2xl border border-slate-800 shadow-md">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">RADIATION</span>
          <span className="text-sm font-black text-slate-100">{radiationLevel} mSv/h</span>
        </div>
      </div>
    </div>
  );
}
