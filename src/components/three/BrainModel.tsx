'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BrainModelProps {
  status?: 'NOMINAL' | 'WATCH' | 'CRITICAL';
}

export default function BrainModel({ status = 'NOMINAL' }: BrainModelProps) {
  const brainGroupRef = useRef<THREE.Group>(null);
  const synapseGroupRef = useRef<THREE.Group>(null);

  // Subtle neural synapse pulse animation
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    if (brainGroupRef.current) {
      brainGroupRef.current.rotation.y = Math.sin(time * 0.15) * 0.15;
    }

    if (synapseGroupRef.current) {
      synapseGroupRef.current.children.forEach((child, i) => {
        const pulse = Math.sin(time * 3 + i) * 0.5 + 0.5;
        if (child instanceof THREE.Mesh) {
          (child.material as THREE.MeshStandardMaterial).opacity = 0.3 + pulse * 0.6;
        }
      });
    }
  });

  // Clinical cerebral cortex material (realistic cerebral pink/matter with soft specular glossiness)
  const cortexMaterial = new THREE.MeshStandardMaterial({
    color: status === 'WATCH' ? new THREE.Color(0xfbbf24) : new THREE.Color(0xf472b6),
    roughness: 0.35,
    metalness: 0.1,
    bumpScale: 0.04,
  });

  // Cerebellum material (fine folia folds)
  const cerebellumMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xe879f9),
    roughness: 0.45,
    metalness: 0.05,
  });

  // Brainstem & Pons material
  const brainstemMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xf87171),
    roughness: 0.3,
    metalness: 0.1,
  });

  // Neural Synapse glowing nodes material
  const synapseMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x38bdf8),
    roughness: 0.1,
    metalness: 0.5,
    transparent: true,
    opacity: 0.7,
  });

  return (
    <group ref={brainGroupRef} position={[0, -0.05, 0]} scale={[1.4, 1.4, 1.4]}>
      
      {/* ========================================================== */}
      {/* 1. CEREBRUM — LEFT & RIGHT CEREBRAL HEMISPHERES            */}
      {/* ========================================================== */}
      
      {/* Left Cerebral Hemisphere (Frontal, Parietal, Temporal, Occipital Lobes) */}
      <group position={[-0.22, 0.15, 0]}>
        {/* Main Cerebral Mass */}
        <mesh material={cortexMaterial} scale={[0.85, 0.9, 1.15]}>
          <sphereGeometry args={[0.55, 32, 32]} />
        </mesh>
        
        {/* Frontal Lobe Anterior Extension */}
        <mesh material={cortexMaterial} position={[0, 0.08, 0.22]} scale={[0.8, 0.85, 0.75]}>
          <sphereGeometry args={[0.42, 24, 24]} />
        </mesh>
        
        {/* Temporal Lobe Inferior Extension */}
        <mesh material={cortexMaterial} position={[-0.08, -0.22, 0.08]} scale={[0.7, 0.6, 0.8]}>
          <sphereGeometry args={[0.38, 24, 24]} />
        </mesh>
      </group>

      {/* Right Cerebral Hemisphere */}
      <group position={[0.22, 0.15, 0]}>
        {/* Main Cerebral Mass */}
        <mesh material={cortexMaterial} scale={[0.85, 0.9, 1.15]}>
          <sphereGeometry args={[0.55, 32, 32]} />
        </mesh>

        {/* Frontal Lobe Anterior Extension */}
        <mesh material={cortexMaterial} position={[0, 0.08, 0.22]} scale={[0.8, 0.85, 0.75]}>
          <sphereGeometry args={[0.42, 24, 24]} />
        </mesh>

        {/* Temporal Lobe Inferior Extension */}
        <mesh material={cortexMaterial} position={[0.08, -0.22, 0.08]} scale={[0.7, 0.6, 0.8]}>
          <sphereGeometry args={[0.38, 24, 24]} />
        </mesh>
      </group>

      {/* Longitudinal Fissure / Interhemispheric Groove */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.04, 0.8, 1.1]} />
        <meshStandardMaterial color={0x9d174d} roughness={0.6} />
      </mesh>

      {/* ========================================================== */}
      {/* 2. CEREBELLUM & BRAINSTEM                                  */}
      {/* ========================================================== */}
      
      {/* Cerebellum (Posterior inferior brain structure with horizontal folia) */}
      <group position={[0, -0.32, -0.32]}>
        <mesh material={cerebellumMaterial} position={[-0.2, 0, 0]} scale={[1, 0.8, 0.9]}>
          <sphereGeometry args={[0.34, 24, 24]} />
        </mesh>
        <mesh material={cerebellumMaterial} position={[0.2, 0, 0]} scale={[1, 0.8, 0.9]}>
          <sphereGeometry args={[0.34, 24, 24]} />
        </mesh>
      </group>

      {/* Brainstem (Pons & Medulla extending vertically downward) */}
      <mesh material={brainstemMaterial} position={[0, -0.45, -0.05]} rotation={[0.15, 0, 0]}>
        <cylinderGeometry args={[0.13, 0.1, 0.45, 20]} />
      </mesh>

      {/* ========================================================== */}
      {/* 3. NEURAL SYNAPSE NODES (COGNITIVE PATHWAY HIGHLIGHTS)     */}
      {/* ========================================================== */}
      <group ref={synapseGroupRef}>
        {[
          [-0.3, 0.35, 0.2],
          [0.3, 0.35, 0.2],
          [-0.2, 0.4, -0.2],
          [0.2, 0.4, -0.2],
          [-0.35, 0.05, 0.1],
          [0.35, 0.05, 0.1],
          [0, 0.45, 0],
        ].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]} material={synapseMaterial}>
            <sphereGeometry args={[0.045, 12, 12]} />
          </mesh>
        ))}
      </group>

    </group>
  );
}
