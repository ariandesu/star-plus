'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SkeletalModelProps {
  status?: 'NOMINAL' | 'WATCH' | 'CRITICAL';
}

export default function SkeletalModel({ status = 'NOMINAL' }: SkeletalModelProps) {
  const skeletalGroupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (skeletalGroupRef.current) {
      skeletalGroupRef.current.rotation.y = Math.sin(time * 0.15) * 0.15;
    }
  });

  // Ivory osteological bone material
  const boneMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xf8fafc),
    roughness: 0.3,
    metalness: 0.1,
  });

  // Intervertebral disc cartilaginous material
  const discMaterial = new THREE.MeshStandardMaterial({
    color: status === 'WATCH' ? new THREE.Color(0xf59e0b) : new THREE.Color(0x38bdf8),
    roughness: 0.2,
    metalness: 0.15,
  });

  // Costal Cartilage & Joint material
  const jointMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x94a3b8),
    roughness: 0.4,
    metalness: 0.05,
  });

  return (
    <group ref={skeletalGroupRef} position={[0, -0.05, 0]} scale={[1.2, 1.2, 1.2]}>
      
      {/* ========================================================== */}
      {/* 1. VERTEBRAL COLUMN (CERVICAL, THORACIC, LUMBAR SPINE)     */}
      {/* ========================================================== */}
      
      {/* Spine curve trajectory */}
      {Array.from({ length: 18 }).map((_, i) => {
        const y = 0.85 - i * 0.095;
        const zCurve = Math.sin(i * 0.35) * 0.06;

        return (
          <group key={i} position={[0, y, zCurve]}>
            {/* Vertebral Body */}
            <mesh material={boneMaterial}>
              <cylinderGeometry args={[0.08, 0.085, 0.06, 16]} />
            </mesh>
            
            {/* Spinous Process (Posterior bone projection) */}
            <mesh material={boneMaterial} position={[0, 0, -0.1]} rotation={[0.2, 0, 0]}>
              <boxGeometry args={[0.03, 0.04, 0.12]} />
            </mesh>

            {/* Intervertebral Disc */}
            <mesh material={discMaterial} position={[0, -0.04, 0]}>
              <cylinderGeometry args={[0.078, 0.078, 0.02, 16]} />
            </mesh>
          </group>
        );
      })}

      {/* ========================================================== */}
      {/* 2. RIBCAGE & STERNUM (THORACIC CAGE)                       */}
      {/* ========================================================== */}
      
      {/* Sternum (Central anterior breastbone) */}
      <mesh material={boneMaterial} position={[0, 0.25, 0.32]}>
        <boxGeometry args={[0.09, 0.55, 0.03]} />
      </mesh>

      {/* 10 Pairs of Rib Arches */}
      {Array.from({ length: 10 }).map((_, i) => {
        const y = 0.65 - i * 0.08;
        const radius = 0.22 + Math.sin((i / 10) * Math.PI) * 0.16;

        return (
          <group key={i} position={[0, y, 0]}>
            {/* Right Rib Arch */}
            <mesh material={boneMaterial} position={[radius * 0.6, 0, 0.1]} rotation={[0.15, 0.2, -0.2]}>
              <torusGeometry args={[radius, 0.016, 12, 24, Math.PI * 0.85]} />
            </mesh>

            {/* Left Rib Arch */}
            <mesh material={boneMaterial} position={[-radius * 0.6, 0, 0.1]} rotation={[0.15, -0.2, 0.2]}>
              <torusGeometry args={[radius, 0.016, 12, 24, Math.PI * 0.85]} />
            </mesh>

            {/* Costal Cartilages connecting to Sternum */}
            <mesh material={jointMaterial} position={[0.12, -0.02, 0.28]} rotation={[0, 0, -0.3]}>
              <cylinderGeometry args={[0.012, 0.012, 0.14, 8]} />
            </mesh>
            <mesh material={jointMaterial} position={[-0.12, -0.02, 0.28]} rotation={[0, 0, 0.3]}>
              <cylinderGeometry args={[0.012, 0.012, 0.14, 8]} />
            </mesh>
          </group>
        );
      })}

      {/* ========================================================== */}
      {/* 3. SHOULDER GIRDLE (CLAVICLES & SCAPULAE)                  */}
      {/* ========================================================== */}

      {/* Right Clavicle */}
      <mesh material={boneMaterial} position={[0.22, 0.72, 0.22]} rotation={[0, -0.2, -0.15]}>
        <cylinderGeometry args={[0.02, 0.022, 0.38, 12]} />
      </mesh>

      {/* Left Clavicle */}
      <mesh material={boneMaterial} position={[-0.22, 0.72, 0.22]} rotation={[0, 0.2, 0.15]}>
        <cylinderGeometry args={[0.02, 0.022, 0.38, 12]} />
      </mesh>

      {/* Right Scapula (Posterior shoulder blade) */}
      <mesh material={boneMaterial} position={[0.26, 0.45, -0.15]} rotation={[0.1, -0.3, 0]}>
        <boxGeometry args={[0.2, 0.28, 0.02]} />
      </mesh>

      {/* Left Scapula */}
      <mesh material={boneMaterial} position={[-0.26, 0.45, -0.15]} rotation={[0.1, 0.3, 0]}>
        <boxGeometry args={[0.2, 0.28, 0.02]} />
      </mesh>

      {/* ========================================================== */}
      {/* 4. PELVIC GIRDLE (SACRUM & ILIAC BONE)                     */}
      {/* ========================================================== */}
      <group position={[0, -0.7, 0]}>
        {/* Sacrum */}
        <mesh material={boneMaterial} position={[0, 0, -0.05]}>
          <coneGeometry args={[0.16, 0.35, 16]} />
        </mesh>

        {/* Right Iliac Blade */}
        <mesh material={boneMaterial} position={[0.22, 0.08, 0.05]} rotation={[0.2, -0.4, -0.2]}>
          <sphereGeometry args={[0.22, 16, 16, 0, Math.PI, 0, Math.PI * 0.7]} />
        </mesh>

        {/* Left Iliac Blade */}
        <mesh material={boneMaterial} position={[-0.22, 0.08, 0.05]} rotation={[0.2, 0.4, 0.2]}>
          <sphereGeometry args={[0.22, 16, 16, 0, Math.PI, 0, Math.PI * 0.7]} />
        </mesh>
      </group>

    </group>
  );
}
