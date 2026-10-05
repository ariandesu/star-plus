'use client';

import React, { Suspense, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, useProgress, Html } from '@react-three/drei';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import * as THREE from 'three';

/**
 * Image-based PBR studio environment generated procedurally via RoomEnvironment.
 */
function StudioEnvironment({ intensity = 0.65 }: { intensity?: number }) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = pmrem.fromScene(room, 0.04);
    scene.environment = target.texture;
    scene.environmentIntensity = intensity;
    room.dispose?.();
    pmrem.dispose();

    return () => {
      scene.environment = null;
      target.texture.dispose();
    };
  }, [gl, scene, intensity]);

  return null;
}

/**
 * Radar / Wireframe sphere loading fallback displayed in 3D scene while GLB loads.
 */
function LoadingFallback() {
  const { progress } = useProgress();

  return (
    <Html center>
      <div className="flex flex-col items-center justify-center pointer-events-none select-none text-center whitespace-nowrap bg-slate-950/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-cyan-500/40 shadow-xl shadow-cyan-950/50">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-[11px] font-mono font-bold tracking-wider text-cyan-300 uppercase">
            CALIBRATING ORBITAL TELEMETRY... {Math.round(progress)}%
          </span>
        </div>
        <div className="w-52 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-cyan-900/60 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-200"
            style={{ width: `${Math.max(5, progress)}%` }}
          />
        </div>
      </div>
    </Html>
  );
}

function ShuttleModel() {
  const { scene } = useGLTF('/models/space_shuttle_discovery.glb');
  const groupRef = useRef<THREE.Group>(null);

  const clonedScene = useMemo(() => {
    if (!scene) return null;
    const cloned = scene.clone(true);

    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => {
            m.side = THREE.DoubleSide;
            if (m instanceof THREE.MeshStandardMaterial || m instanceof THREE.MeshPhysicalMaterial) {
              m.roughness = m.roughness ?? 0.35;
              m.metalness = m.metalness ?? 0.3;
              if (m.map) m.map.anisotropy = 16;
              if (m.normalMap) m.normalMap.anisotropy = 16;
            }
            m.needsUpdate = true;
          });
        }
      }
    });

    const box = new THREE.Box3().setFromObject(cloned);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    const maxDim = Math.max(size.x, size.y, size.z);
    const targetScale = maxDim > 0 ? 3.2 / maxDim : 1;

    cloned.position.x = -center.x * targetScale;
    cloned.position.y = -center.y * targetScale;
    cloned.position.z = -center.z * targetScale;
    cloned.scale.setScalar(targetScale);

    return cloned;
  }, [scene]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.25;
    groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.8) * 0.04;
  });

  if (!clonedScene) return null;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload('/models/space_shuttle_discovery.glb');

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
      <div className="flex items-center justify-between z-10 pointer-events-none">
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
          shadows
          camera={{ position: [0, 0.8, 3.2], fov: 38, near: 0.1, far: 100 }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            gl.outputColorSpace = THREE.SRGBColorSpace;
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.25;
            gl.shadowMap.enabled = true;
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
          }}
          dpr={[1, 2]}
        >
          <ambientLight intensity={1.2} />
          <directionalLight position={[5, 8, 5]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} />
          <directionalLight position={[-5, 5, -5]} intensity={1.0} />
          <pointLight position={[0, -3, 0]} intensity={0.5} />
          
          <StudioEnvironment intensity={0.65} />

          <Suspense fallback={<LoadingFallback />}>
            <ShuttleModel />
          </Suspense>

          <OrbitControls
            enableZoom={true}
            enablePan={false}
            enableDamping={true}
            dampingFactor={0.05}
            minDistance={1.2}
            maxDistance={6.0}
            autoRotate={false}
          />
        </Canvas>
      </div>

      {/* Floating Telemetry Pill Cards */}
      <div className="z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 pointer-events-none">
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
