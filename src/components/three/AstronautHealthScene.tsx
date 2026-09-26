'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Heart, 
  Wind, 
  Activity, 
  Brain, 
  Moon, 
  Sparkles, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut,
  AlertCircle
} from 'lucide-react';

export type HealthSystemType = 'cardiovascular' | 'respiratory' | 'musculoskeletal' | 'cognitive' | 'recovery';

interface AstronautHealthSceneProps {
  selectedSystem: HealthSystemType;
  onSelectSystem: (system: HealthSystemType) => void;
  astronautName?: string;
  heartRate?: number;
  spo2?: number;
  sleepHours?: number;
  stressIndex?: number;
}

export default function AstronautHealthScene({
  selectedSystem,
  onSelectSystem,
  astronautName = 'Maya Chen',
  heartRate = 78,
  spo2 = 98,
  sleepHours = 6.2,
  stressIndex = 26
}: AstronautHealthSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webGlSupported, setWebGlSupported] = useState(true);
  const [isRotating, setIsRotating] = useState(true);

  // Scene references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const bodyGroupRef = useRef<THREE.Group | null>(null);
  const organNodesRef = useRef<{ [key in HealthSystemType]?: THREE.Mesh | THREE.Group }>({});

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // WebGL support check
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
    const height = container.clientHeight || 500;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xf8fafc); // soft slate-50 background

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7.5);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x3b82f6, 1.2); // Soft Royal Blue
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x60a5fa, 0.6); // Soft Light Blue rim
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x2563eb, 1.5, 10);
    pointLight.position.set(0, 1, 2);
    scene.add(pointLight);

    // 5. Stylized Human Holographic Silhouette
    const bodyGroup = new THREE.Group();
    bodyGroupRef.current = bodyGroup;
    scene.add(bodyGroup);

    // Material definitions
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xcbd5e1, // slate-300
      transparent: true,
      opacity: 0.25,
      roughness: 0.3,
      metalness: 0.1,
      clearcoat: 0.8,
      wireframe: false
    });

    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });

    // Head Sphere
    const headGeo = new THREE.SphereGeometry(0.55, 32, 32);
    const headMesh = new THREE.Mesh(headGeo, bodyMaterial);
    headMesh.position.set(0, 2.2, 0);
    bodyGroup.add(headMesh);

    // Neck Cylinder
    const neckGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.4, 16);
    const neckMesh = new THREE.Mesh(neckGeo, bodyMaterial);
    neckMesh.position.set(0, 1.65, 0);
    bodyGroup.add(neckMesh);

    // Torso / Chest Capsule
    const torsoGeo = new THREE.CylinderGeometry(0.7, 0.5, 1.8, 32);
    const torsoMesh = new THREE.Mesh(torsoGeo, bodyMaterial);
    torsoMesh.position.set(0, 0.6, 0);
    bodyGroup.add(torsoMesh);

    // Arms
    const leftArmGeo = new THREE.CylinderGeometry(0.16, 0.12, 1.7, 16);
    const leftArm = new THREE.Mesh(leftArmGeo, bodyMaterial);
    leftArm.position.set(-0.95, 0.6, 0);
    leftArm.rotation.z = 0.15;
    bodyGroup.add(leftArm);

    const rightArm = leftArm.clone();
    rightArm.position.set(0.95, 0.6, 0);
    rightArm.rotation.z = -0.15;
    bodyGroup.add(rightArm);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.22, 0.16, 2.0, 16);
    const leftLeg = new THREE.Mesh(legGeo, bodyMaterial);
    leftLeg.position.set(-0.38, -1.3, 0);
    bodyGroup.add(leftLeg);

    const rightLeg = leftLeg.clone();
    rightLeg.position.set(0.38, -1.3, 0);
    bodyGroup.add(rightLeg);

    // 6. Interactive Organ System Nodes
    const organNodes: { [key in HealthSystemType]?: THREE.Mesh | THREE.Group } = {};

    // A. Cardiovascular Node (Heart)
    const heartGeo = new THREE.SphereGeometry(0.28, 32, 32);
    const heartMat = new THREE.MeshStandardMaterial({
      color: 0xef4444, // Red
      emissive: 0xd97706,
      emissiveIntensity: 0.6,
      roughness: 0.2
    });
    const heartNode = new THREE.Mesh(heartGeo, heartMat);
    heartNode.position.set(-0.15, 0.95, 0.25);
    bodyGroup.add(heartNode);
    organNodes['cardiovascular'] = heartNode;

    // B. Respiratory Node (Lungs)
    const lungGroup = new THREE.Group();
    const lungGeo = new THREE.CapsuleGeometry(0.2, 0.4, 16, 16);
    const lungMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6, // Blue
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.5,
      roughness: 0.3
    });
    const leftLung = new THREE.Mesh(lungGeo, lungMat);
    leftLung.position.set(-0.3, 0.95, 0.1);
    const rightLung = new THREE.Mesh(lungGeo, lungMat);
    rightLung.position.set(0.3, 0.95, 0.1);
    lungGroup.add(leftLung);
    lungGroup.add(rightLung);
    bodyGroup.add(lungGroup);
    organNodes['respiratory'] = lungGroup;

    // C. Cognitive Node (Brain)
    const brainGeo = new THREE.SphereGeometry(0.38, 32, 32);
    const brainMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6, // Purple
      emissive: 0x6d28d9,
      emissiveIntensity: 0.6,
      roughness: 0.3
    });
    const brainNode = new THREE.Mesh(brainGeo, brainMat);
    brainNode.position.set(0, 2.25, 0.05);
    bodyGroup.add(brainNode);
    organNodes['cognitive'] = brainNode;

    // D. Musculoskeletal (Spine & Joint Nodes)
    const musculoGroup = new THREE.Group();
    const spineMat = new THREE.MeshStandardMaterial({
      color: 0x10b981, // Emerald
      emissive: 0x047857,
      emissiveIntensity: 0.5
    });
    for (let i = 0; i < 7; i++) {
      const nodeGeo = new THREE.SphereGeometry(0.08, 16, 16);
      const node = new THREE.Mesh(nodeGeo, spineMat);
      node.position.set(0, 1.4 - i * 0.25, -0.1);
      musculoGroup.add(node);
    }
    bodyGroup.add(musculoGroup);
    organNodes['musculoskeletal'] = musculoGroup;

    // E. Recovery/Sleep (Full Aura Particle Ring)
    const auraGroup = new THREE.Group();
    const auraGeo = new THREE.TorusGeometry(1.6, 0.04, 16, 100);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4, // Cyan
      transparent: true,
      opacity: 0.6
    });
    const auraRing = new THREE.Mesh(auraGeo, auraMat);
    auraRing.rotation.x = Math.PI / 2;
    auraRing.position.set(0, 0.3, 0);
    auraGroup.add(auraRing);
    bodyGroup.add(auraGroup);
    organNodes['recovery'] = auraGroup;

    organNodesRef.current = organNodes;

    // 7. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Continuous subtle rotation
      if (bodyGroupRef.current) {
        bodyGroupRef.current.rotation.y = elapsedTime * 0.25;
      }

      // Organ animations
      if (heartNode) {
        const pulse = 1 + Math.sin(elapsedTime * 4) * 0.08;
        heartNode.scale.set(pulse, pulse, pulse);
      }

      if (lungGroup) {
        const breath = 1 + Math.sin(elapsedTime * 2) * 0.05;
        lungGroup.scale.set(breath, breath, breath);
      }

      if (auraRing) {
        auraRing.rotation.z = elapsedTime * 0.5;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // Resize listener
    const handleResize = () => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      const w = container.clientWidth || 400;
      const h = container.clientHeight || 500;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && rendererRef.current.domElement) {
        container.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  // Handle camera & highlight focus when selectedSystem changes
  useEffect(() => {
    const camera = cameraRef.current;
    if (!camera) return;

    const targetPositions: { [key in HealthSystemType]: { z: number; y: number } } = {
      cardiovascular: { z: 5.5, y: 0.8 },
      respiratory: { z: 5.5, y: 0.8 },
      cognitive: { z: 4.8, y: 2.2 },
      musculoskeletal: { z: 6.0, y: 0.2 },
      recovery: { z: 7.5, y: 0.3 }
    };

    const target = targetPositions[selectedSystem];
    if (target) {
      camera.position.set(0, target.y, target.z);
    }
  }, [selectedSystem]);

  return (
    <div className="relative w-full h-[480px] bg-gradient-to-b from-slate-50/80 via-white to-blue-50/30 rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between p-4">
      
      {/* Top Floating Badge */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/60 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
          <span className="text-xs font-bold text-slate-800 tracking-tight">3D Interactive Health Visualizer</span>
        </div>

        <div className="flex items-center gap-1 bg-white/80 backdrop-blur-md px-2 py-1 rounded-full border border-slate-200/60 text-[11px] font-semibold text-slate-600">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Real-Time Biometrics</span>
        </div>
      </div>

      {/* Main Three.js Canvas Container */}
      {webGlSupported ? (
        <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />
      ) : (
        /* WebGL Fallback Interactive Anatomy Display */
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-50">
          <AlertCircle className="w-10 h-10 text-amber-500 mb-2" />
          <h4 className="text-sm font-bold text-slate-900">WebGL Acceleration Unavailable</h4>
          <p className="text-xs text-slate-500 max-w-xs mt-1">
            Displaying SVG high-resolution anatomical system map for {astronautName}.
          </p>
        </div>
      )}

      {/* FLOATING OVERLAY METRIC CARD (Target reference specification: floating over left visual) */}
      <div className="absolute top-16 left-6 z-20 bg-white/90 backdrop-blur-xl p-4 rounded-2xl border border-slate-100 shadow-lg shadow-blue-500/5 max-w-[210px] transition-all transform hover:scale-105">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            {selectedSystem.toUpperCase()}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-600 border border-blue-100">
            NOMINAL
          </span>
        </div>

        {selectedSystem === 'cardiovascular' && (
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">{heartRate}</span>
              <span className="text-xs font-bold text-slate-500">BPM</span>
            </div>
            <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
              <span>↑ +8% vs baseline</span>
            </p>
          </div>
        )}

        {selectedSystem === 'respiratory' && (
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">{spo2}%</span>
              <span className="text-xs font-bold text-slate-500">SpO2</span>
            </div>
            <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
              <span>✓ Optimal Airway Saturation</span>
            </p>
          </div>
        )}

        {selectedSystem === 'cognitive' && (
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">{stressIndex}</span>
              <span className="text-xs font-bold text-slate-500">Stress Index</span>
            </div>
            <p className="text-[11px] font-semibold text-amber-600 flex items-center gap-1 mt-0.5">
              <span>⚠ Elevated Cognitive Load</span>
            </p>
          </div>
        )}

        {selectedSystem === 'musculoskeletal' && (
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">0.96</span>
              <span className="text-xs font-bold text-slate-500">BMD T-Score</span>
            </div>
            <p className="text-[11px] font-semibold text-blue-600 flex items-center gap-1 mt-0.5">
              <span>98.2% Bone Density</span>
            </p>
          </div>
        )}

        {selectedSystem === 'recovery' && (
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">{sleepHours}h</span>
              <span className="text-xs font-bold text-slate-500">Sleep (24H)</span>
            </div>
            <p className="text-[11px] font-semibold text-amber-600 flex items-center gap-1 mt-0.5">
              <span>↓ -1.3h Target Deficit</span>
            </p>
          </div>
        )}
      </div>

      {/* BOTTOM SYSTEM SELECTOR CARDS (Rounded pills under visual per Dribbble layout) */}
      <div className="z-20 w-full flex items-center justify-center gap-1.5 overflow-x-auto py-1">
        {[
          { id: 'cardiovascular' as const, label: 'Heart', icon: Heart },
          { id: 'respiratory' as const, label: 'Lungs', icon: Wind },
          { id: 'cognitive' as const, label: 'Brain', icon: Brain },
          { id: 'musculoskeletal' as const, label: 'Bones', icon: Activity },
          { id: 'recovery' as const, label: 'Sleep', icon: Moon },
        ].map((sys) => {
          const Icon = sys.icon;
          const isSelected = selectedSystem === sys.id;

          return (
            <button
              key={sys.id}
              onClick={() => onSelectSystem(sys.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs whitespace-nowrap ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105'
                  : 'bg-white/90 hover:bg-white text-slate-700 hover:text-blue-600 border border-slate-200/80'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-blue-500'}`} />
              <span>{sys.label}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
