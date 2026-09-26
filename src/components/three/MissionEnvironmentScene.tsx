'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Shield, Thermometer, Wind, Zap, Radio } from 'lucide-react';

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
  const mountRef = useRef<HTMLDivElement>(null);
  const [webGlSupported, setWebGlSupported] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGlSupported(false);
        return;
      }
    } catch (e) {
      setWebGlSupported(false);
      return;
    }

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 300;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x10b981, 1.2, 10);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);

    // 3D Habitat Module Geometry
    const envGroup = new THREE.Group();
    scene.add(envGroup);

    // Outer Cylinder Module
    const cylGeo = new THREE.CylinderGeometry(1.8, 1.8, 3.5, 32, 1, true);
    const cylMat = new THREE.MeshPhysicalMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.2,
      wireframe: true
    });
    const cylMesh = new THREE.Mesh(cylGeo, cylMat);
    cylMesh.rotation.z = Math.PI / 2;
    envGroup.add(cylMesh);

    // Core Docking Ring Nodes
    const ringGeo = new THREE.TorusGeometry(1.7, 0.05, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x1d4ed8, emissiveIntensity: 0.5 });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.y = Math.PI / 2;
    ring1.position.x = -1.2;
    envGroup.add(ring1);

    const ring2 = ring1.clone();
    ring2.position.x = 1.2;
    envGroup.add(ring2);

    // Orbiting Environmental Air Particles
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 3.2;
      positions[i + 1] = (Math.random() - 0.5) * 2.0;
      positions[i + 2] = (Math.random() - 0.5) * 2.0;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x10b981,
      size: 0.06,
      transparent: true,
      opacity: 0.8
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    envGroup.add(particleSystem);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      envGroup.rotation.y = elapsed * 0.15;
      particleSystem.rotation.x = elapsed * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 400;
      const h = container.clientHeight || 300;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement) container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="relative w-full h-[320px] bg-gradient-to-b from-slate-50 via-white to-emerald-50/20 rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-4 flex flex-col justify-between">
      
      {/* Header Badge */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/60 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-800 tracking-tight">Habitat Environmental Telemetry</span>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
          AIR LOOP: NOMINAL
        </span>
      </div>

      {/* Canvas */}
      {webGlSupported ? (
        <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-slate-400">
          3D Habitat Environment Simulation
        </div>
      )}

      {/* Floating Telemetry Pill Cards */}
      <div className="z-10 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-white/90 backdrop-blur-md p-2.5 rounded-2xl border border-slate-100 shadow-2xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">PRESSURE</span>
          <span className="text-sm font-black text-slate-900">{cabinPressure} kPa</span>
        </div>
        <div className="bg-white/90 backdrop-blur-md p-2.5 rounded-2xl border border-slate-100 shadow-2xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">O2 SATURATION</span>
          <span className="text-sm font-black text-slate-900">{o2Percentage}%</span>
        </div>
        <div className="bg-white/90 backdrop-blur-md p-2.5 rounded-2xl border border-slate-100 shadow-2xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">CO2 LEVEL</span>
          <span className="text-sm font-black text-slate-900">{co2Level}%</span>
        </div>
        <div className="bg-white/90 backdrop-blur-md p-2.5 rounded-2xl border border-slate-100 shadow-2xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">RADIATION</span>
          <span className="text-sm font-black text-slate-900">{radiationLevel} mSv/h</span>
        </div>
      </div>
    </div>
  );
}
