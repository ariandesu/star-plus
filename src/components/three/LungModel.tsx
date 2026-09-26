'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LungModelProps {
  status?: 'NOMINAL' | 'WATCH' | 'CRITICAL';
}

export default function LungModel({ status = 'NOMINAL' }: LungModelProps) {
  const lungGroupRef = useRef<THREE.Group>(null);
  const leftLungRef = useRef<THREE.Group>(null);
  const rightLungRef = useRef<THREE.Group>(null);

  // Animate gentle respiratory expansion/contraction (breathing cycle ~14 breaths/min = 0.23 Hz)
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const breath = Math.sin(time * 1.45) * 0.04;
    
    if (leftLungRef.current && rightLungRef.current) {
      leftLungRef.current.scale.set(1 + breath, 1 + breath * 1.1, 1 + breath);
      rightLungRef.current.scale.set(1 + breath, 1 + breath * 1.1, 1 + breath);
    }

    if (lungGroupRef.current) {
      lungGroupRef.current.rotation.y = Math.sin(time * 0.15) * 0.12;
    }
  });

  // Translucent pinkish pulmonary tissue material
  const pulmonaryMaterial = new THREE.MeshStandardMaterial({
    color: status === 'CRITICAL' ? new THREE.Color(0xf43f5e) : new THREE.Color(0xf472b6),
    roughness: 0.4,
    metalness: 0.05,
    transparent: true,
    opacity: 0.92,
  });

  // Trachea & Cartilaginous rings material
  const tracheaMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xe2e8f0),
    roughness: 0.3,
    metalness: 0.2,
  });

  // Bronchial tree vessel material
  const bronchialMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x38bdf8),
    roughness: 0.2,
    metalness: 0.1,
  });

  return (
    <group ref={lungGroupRef} position={[0, -0.1, 0]} scale={[1.3, 1.3, 1.3]}>
      
      {/* ========================================================== */}
      {/* 1. TRACHEA & MAINSTEM BRONCHI                              */}
      {/* ========================================================== */}
      
      {/* Trachea (Central cartilaginous airway tube extending upward) */}
      <mesh material={tracheaMaterial} position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.09, 0.095, 0.65, 20]} />
      </mesh>

      {/* Cartilaginous C-Rings on Trachea */}
      {[0.5, 0.6, 0.7, 0.8, 0.9].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <torusGeometry args={[0.098, 0.012, 12, 24]} />
          <meshStandardMaterial color={0x94a3b8} roughness={0.3} />
        </mesh>
      ))}

      {/* Carina / Bifurcation into Left & Right Bronchi */}
      <mesh material={tracheaMaterial} position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.105, 16, 16]} />
      </mesh>

      {/* Right Primary Bronchus (Short, wider, more vertical) */}
      <mesh material={tracheaMaterial} position={[0.16, 0.28, 0]} rotation={[0, 0, -0.6]}>
        <cylinderGeometry args={[0.065, 0.07, 0.32, 16]} />
      </mesh>

      {/* Left Primary Bronchus (Longer, narrower, more horizontal) */}
      <mesh material={tracheaMaterial} position={[-0.18, 0.26, 0]} rotation={[0, 0, 0.7]}>
        <cylinderGeometry args={[0.06, 0.065, 0.38, 16]} />
      </mesh>

      {/* ========================================================== */}
      {/* 2. RIGHT LUNG (3 LOBES: SUPERIOR, MIDDLE, INFERIOR)        */}
      {/* ========================================================== */}
      <group ref={rightLungRef} position={[0.42, -0.1, 0]}>
        
        {/* Right Superior Lobe */}
        <mesh material={pulmonaryMaterial} position={[0, 0.35, 0]} rotation={[0, 0, -0.1]}>
          <sphereGeometry args={[0.38, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.85]} />
        </mesh>

        {/* Right Middle Lobe */}
        <mesh material={pulmonaryMaterial} position={[0.02, 0.02, 0.05]} rotation={[0.1, 0, -0.15]}>
          <sphereGeometry args={[0.34, 24, 24]} />
        </mesh>

        {/* Right Inferior Lobe (Base resting on diaphragm) */}
        <mesh material={pulmonaryMaterial} position={[-0.02, -0.32, 0]} rotation={[0, 0, -0.1]}>
          <coneGeometry args={[0.42, 0.55, 24]} />
        </mesh>

        {/* Right Bronchial Tree Branching Geometry */}
        <mesh material={bronchialMaterial} position={[-0.15, 0.1, 0]}>
          <tubeGeometry args={[
            new THREE.CatmullRomCurve3([
              new THREE.Vector3(-0.05, 0.15, 0),
              new THREE.Vector3(0.08, 0.05, 0.02),
              new THREE.Vector3(0.18, -0.15, 0.05),
            ]),
            16, 0.025, 8, false
          ]} />
        </mesh>

      </group>

      {/* ========================================================== */}
      {/* 3. LEFT LUNG (2 LOBES WITH CARDIAC NOTCH)                  */}
      {/* ========================================================== */}
      <group ref={leftLungRef} position={[-0.42, -0.1, 0]}>
        
        {/* Left Superior Lobe */}
        <mesh material={pulmonaryMaterial} position={[0, 0.32, 0]} rotation={[0, 0, 0.1]}>
          <sphereGeometry args={[0.36, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.85]} />
        </mesh>

        {/* Cardiac Notch Indentation (where heart sits) */}
        <mesh material={pulmonaryMaterial} position={[0.08, -0.05, 0.08]} rotation={[0.2, 0, 0.2]}>
          <sphereGeometry args={[0.3, 24, 24]} />
        </mesh>

        {/* Left Inferior Lobe */}
        <mesh material={pulmonaryMaterial} position={[0.02, -0.35, 0]} rotation={[0, 0, 0.1]}>
          <coneGeometry args={[0.38, 0.52, 24]} />
        </mesh>

        {/* Left Bronchial Tree Branching Geometry */}
        <mesh material={bronchialMaterial} position={[0.15, 0.08, 0]}>
          <tubeGeometry args={[
            new THREE.CatmullRomCurve3([
              new THREE.Vector3(0.05, 0.15, 0),
              new THREE.Vector3(-0.08, 0.05, 0.02),
              new THREE.Vector3(-0.16, -0.15, 0.05),
            ]),
            16, 0.024, 8, false
          ]} />
        </mesh>

      </group>

    </group>
  );
}
