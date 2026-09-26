'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HeartModelProps {
  status?: 'NOMINAL' | 'WATCH' | 'CRITICAL';
  bpm?: number;
}

export default function HeartModel({ status = 'WATCH', bpm = 65 }: HeartModelProps) {
  const heartGroupRef = useRef<THREE.Group>(null);
  const aortaRef = useRef<THREE.Mesh>(null);
  const coronaryGroupRef = useRef<THREE.Group>(null);

  // Animate cardiac contraction (pulsing at specified BPM)
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    // 65 BPM = ~1.08 Hz frequency
    const freq = (bpm / 60) * Math.PI * 2;
    // Cardiac double-beat pattern (systole + diastole)
    const beat = Math.sin(time * freq) * 0.04 + Math.sin(time * freq * 2) * 0.02;
    
    if (heartGroupRef.current) {
      heartGroupRef.current.scale.set(1 + beat, 1 + beat * 1.2, 1 + beat);
      // Slow, subtle rotation (no aggressive spinning)
      heartGroupRef.current.rotation.y = Math.sin(time * 0.2) * 0.15;
    }
  });

  // Clinical cardiac muscle material (realistic crimson/myocardium with soft specular highlights)
  const myocardiumMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x991b1b),
    roughness: 0.35,
    metalness: 0.1,
    bumpScale: 0.02,
  });

  // Aorta & Major Arterial vessel material (bright oxygenated arterial red)
  const arterialMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xdc2626),
    roughness: 0.25,
    metalness: 0.15,
  });

  // Vena Cava & Pulmonary Venous material (deoxygenated venous blue)
  const venousMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x2563eb),
    roughness: 0.3,
    metalness: 0.1,
  });

  // Coronary vessel material
  const coronaryArteryMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xef4444),
    roughness: 0.2,
    metalness: 0.2,
  });

  const coronaryVeinMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x3b82f6),
    roughness: 0.2,
    metalness: 0.2,
  });

  return (
    <group ref={heartGroupRef} position={[0, -0.2, 0]} scale={[1.4, 1.4, 1.4]}>
      
      {/* ========================================================== */}
      {/* 1. MYOCARDIUM BASE / VENTRICLES & ATRIA (MAIN HEART BODY)  */}
      {/* ========================================================== */}
      
      {/* Left Ventricle (Thick muscular apex cone tilted slightly to the left) */}
      <mesh material={myocardiumMaterial} position={[-0.2, -0.3, 0]} rotation={[0, 0, 0.25]}>
        <sphereGeometry args={[0.55, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.85]} />
      </mesh>

      {/* Right Ventricle (Anterior crescent chamber wrapping around LV) */}
      <mesh material={myocardiumMaterial} position={[0.25, -0.25, 0.15]} rotation={[0.2, -0.3, -0.2]}>
        <sphereGeometry args={[0.48, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.8]} />
      </mesh>

      {/* Apex of Heart (Pointed inferior tip) */}
      <mesh material={myocardiumMaterial} position={[-0.35, -0.75, 0.05]} rotation={[0, 0, 0.4]}>
        <coneGeometry args={[0.32, 0.55, 32]} />
      </mesh>

      {/* Left Atrium & Auricle (Upper posterior left chamber) */}
      <mesh material={myocardiumMaterial} position={[-0.3, 0.3, -0.1]}>
        <sphereGeometry args={[0.38, 24, 24]} />
      </mesh>

      {/* Right Atrium & Auricle (Upper anterior right chamber) */}
      <mesh material={myocardiumMaterial} position={[0.35, 0.25, 0.1]}>
        <sphereGeometry args={[0.42, 24, 24]} />
      </mesh>

      {/* Interventricular Sulcus / Fat Pad Groove */}
      <mesh position={[-0.05, -0.3, 0.38]} rotation={[0.1, 0, 0.3]}>
        <tubeGeometry args={[
          new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.2, 0.3, 0.1),
            new THREE.Vector3(0.05, 0, 0.15),
            new THREE.Vector3(-0.2, -0.4, 0.05),
          ]),
          20, 0.04, 8, false
        ]} />
        <meshStandardMaterial color={0xfef08a} roughness={0.6} />
      </mesh>

      {/* ========================================================== */}
      {/* 2. GREAT VESSELS (AORTA, PULMONARY ARTERY, VENA CAVA)      */}
      {/* ========================================================== */}

      {/* Ascending Aorta & Arch (Curved thick red arterial vessel arching over heart base) */}
      <mesh ref={aortaRef} material={arterialMaterial} position={[-0.05, 0.65, -0.05]}>
        <tubeGeometry args={[
          new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.1, -0.2, 0.05),
            new THREE.Vector3(-0.05, 0.2, 0),
            new THREE.Vector3(0.1, 0.4, -0.1),
            new THREE.Vector3(0.25, 0.3, -0.2),
            new THREE.Vector3(0.2, 0.05, -0.25),
          ]),
          32, 0.13, 16, false
        ]} />
      </mesh>

      {/* Brachiocephalic, Common Carotid, Subclavian Branches on Aortic Arch */}
      <mesh material={arterialMaterial} position={[-0.02, 1.05, -0.1]}>
        <cylinderGeometry args={[0.035, 0.04, 0.25, 12]} />
      </mesh>
      <mesh material={arterialMaterial} position={[0.08, 1.08, -0.15]}>
        <cylinderGeometry args={[0.032, 0.035, 0.28, 12]} />
      </mesh>
      <mesh material={arterialMaterial} position={[0.18, 1.02, -0.2]}>
        <cylinderGeometry args={[0.03, 0.032, 0.24, 12]} />
      </mesh>

      {/* Pulmonary Trunk & Left/Right Pulmonary Arteries (Crosses anterior to aorta) */}
      <mesh material={venousMaterial} position={[0.08, 0.5, 0.15]} rotation={[0.2, -0.2, -0.3]}>
        <tubeGeometry args={[
          new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.1, -0.2, 0),
            new THREE.Vector3(0, 0.15, 0.05),
            new THREE.Vector3(-0.15, 0.3, -0.05),
          ]),
          24, 0.11, 16, false
        ]} />
      </mesh>

      {/* Superior Vena Cava (Large blue venous trunk entering Right Atrium) */}
      <mesh material={venousMaterial} position={[0.42, 0.7, 0.05]}>
        <cylinderGeometry args={[0.09, 0.095, 0.45, 16]} />
      </mesh>

      {/* Inferior Vena Cava (Entering inferior right atrium) */}
      <mesh material={venousMaterial} position={[0.42, -0.35, 0.05]}>
        <cylinderGeometry args={[0.085, 0.09, 0.35, 16]} />
      </mesh>

      {/* ========================================================== */}
      {/* 3. CORONARY VASCULATURE (LEFT & RIGHT CORONARY ARTERIES)   */}
      {/* ========================================================== */}
      <group ref={coronaryGroupRef}>
        {/* Left Anterior Descending (LAD) Coronary Artery */}
        <mesh material={coronaryArteryMaterial}>
          <tubeGeometry args={[
            new THREE.CatmullRomCurve3([
              new THREE.Vector3(-0.05, 0.25, 0.32),
              new THREE.Vector3(-0.1, 0.05, 0.42),
              new THREE.Vector3(-0.2, -0.2, 0.38),
              new THREE.Vector3(-0.3, -0.55, 0.18),
            ]),
            32, 0.022, 8, false
          ]} />
        </mesh>

        {/* Right Coronary Artery (RCA) */}
        <mesh material={coronaryArteryMaterial}>
          <tubeGeometry args={[
            new THREE.CatmullRomCurve3([
              new THREE.Vector3(0.2, 0.2, 0.3),
              new THREE.Vector3(0.35, 0.05, 0.32),
              new THREE.Vector3(0.38, -0.2, 0.25),
              new THREE.Vector3(0.25, -0.45, 0.15),
            ]),
            32, 0.02, 8, false
          ]} />
        </mesh>

        {/* Great Cardiac Vein (Blue venous vessel running alongside LAD) */}
        <mesh material={coronaryVeinMaterial}>
          <tubeGeometry args={[
            new THREE.CatmullRomCurve3([
              new THREE.Vector3(-0.02, 0.23, 0.34),
              new THREE.Vector3(-0.07, 0.03, 0.43),
              new THREE.Vector3(-0.17, -0.22, 0.39),
              new THREE.Vector3(-0.27, -0.53, 0.2),
            ]),
            32, 0.018, 8, false
          ]} />
        </mesh>
      </group>

    </group>
  );
}
