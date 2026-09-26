'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CircadianModelProps {
  status?: 'NOMINAL' | 'WATCH' | 'CRITICAL';
}

export default function CircadianModel({ status = 'WATCH' }: CircadianModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  // Smooth rotation for 24h circadian cycle wave rings
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.15;
    }

    if (ring1Ref.current && ring2Ref.current) {
      ring1Ref.current.rotation.z = time * 0.3;
      ring2Ref.current.rotation.x = time * -0.25;
    }
  });

  // Clinical pineal gland & hypothalamic nucleus material
  const pinealMaterial = new THREE.MeshStandardMaterial({
    color: status === 'WATCH' ? new THREE.Color(0xf59e0b) : new THREE.Color(0x8b5cf6),
    roughness: 0.2,
    metalness: 0.25,
  });

  // Melatonin circadian rhythm wave ring material
  const waveMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x38bdf8),
    roughness: 0.1,
    metalness: 0.4,
    transparent: true,
    opacity: 0.75,
  });

  // Day/Night 24-hour cycle ring material
  const cycleMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xa78bfa),
    roughness: 0.15,
    metalness: 0.3,
    transparent: true,
    opacity: 0.6,
  });

  return (
    <group ref={groupRef} position={[0, -0.05, 0]} scale={[1.3, 1.3, 1.3]}>
      
      {/* ========================================================== */}
      {/* 1. CENTRAL PINEAL GLAND & SUPRACHIASMATIC NUCLEUS (SCN)    */}
      {/* ========================================================== */}
      
      {/* Pineal Gland (Central endocrine organ producing melatonin) */}
      <mesh material={pinealMaterial} position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.35, 32, 32]} />
      </mesh>

      {/* Hypothalamus Base Structure */}
      <mesh material={pinealMaterial} position={[0, -0.18, 0]} scale={[1.2, 0.6, 1.1]}>
        <sphereGeometry args={[0.38, 24, 24]} />
      </mesh>

      {/* Suprachiasmatic Pacemaker Nuclei (Left & Right SCN Nodes) */}
      <mesh position={[-0.14, -0.05, 0.18]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={0xfacc15} roughness={0.2} />
      </mesh>
      <mesh position={[0.14, -0.05, 0.18]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={0xfacc15} roughness={0.2} />
      </mesh>

      {/* ========================================================== */}
      {/* 2. 24-HOUR CIRCADIAN PHASE RINGS & MELATONIN WAVE ORBITS   */}
      {/* ========================================================== */}
      
      {/* Circadian Phase Orbital Ring 1 */}
      <mesh ref={ring1Ref} material={waveMaterial} position={[0, 0, 0]}>
        <torusGeometry args={[0.72, 0.025, 16, 64]} />
      </mesh>

      {/* Circadian Phase Orbital Ring 2 */}
      <mesh ref={ring2Ref} material={cycleMaterial} position={[0, 0, 0]} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[0.88, 0.02, 16, 64]} />
      </mesh>

      {/* Melatonin Secretion Nodes along Orbits */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(angle) * 0.72,
            Math.sin(angle) * 0.72,
            0
          ]}
        >
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial color={0x60a5fa} roughness={0.1} />
        </mesh>
      ))}

    </group>
  );
}
