'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { atlasLoaderService, Part } from '../../services/atlasLoaderService';
import { 
  RotateCcw, 
  Activity, 
  Heart, 
  Wind, 
  Brain, 
  Dumbbell, 
  Moon, 
  Sparkles
} from 'lucide-react';

export type HealthSystemType = 'CARDIOVASCULAR' | 'RESPIRATORY' | 'NEUROLOGICAL' | 'MUSCULOSKELETAL' | 'CIRCADIAN';

interface BodyPartsOrganSceneProps {
  selectedSystem: HealthSystemType;
  onSelectSystem?: (system: HealthSystemType) => void;
  astronautName?: string;
  metricValue?: string;
  metricLabel?: string;
  baselineDelta?: string;
  status?: 'NOMINAL' | 'WATCH' | 'CRITICAL';
}

export default function BodyPartsOrganScene({
  selectedSystem,
  onSelectSystem,
  astronautName = 'CDR Maya Chen',
  metricValue = '65 BPM',
  metricLabel = 'Heart Rate (Resting)',
  baselineDelta = '+8%',
  status = 'WATCH'
}: BodyPartsOrganSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Loading & State
  const [loadingStatus, setLoadingStatus] = useState<string>('Initializing 3D Anatomy...');
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasWebGLError, setHasWebGLError] = useState<boolean>(false);
  const [hoveredPartName, setHoveredPartName] = useState<string | null>(null);
  const [selectedPart, setSelectedPart] = useState<{ name: string; system: string; conceptId: string } | null>(null);
  const [isolatedPartName, setIsolatedPartName] = useState<string | null>(null);

  // Mutable Ref to keep track of selectedSystem inside long-running callbacks/loops
  const selectedSystemRef = useRef<HealthSystemType>(selectedSystem);
  useEffect(() => {
    selectedSystemRef.current = selectedSystem;
  }, [selectedSystem]);

  // Three.js References
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const currentGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const partMeshesRef = useRef<{ mesh: THREE.Mesh; part: Part }[]>([]);
  const initialCameraPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0.04, 0.02, 0.45));

  // Helper to dispose Three.js geometry/material resources
  const disposeGroup = (group: THREE.Group) => {
    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material?.dispose();
        }
      }
    });
  };

  // Initialize Three.js Scene & Canvas
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) {
      setHasWebGLError(true);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, container.clientWidth / container.clientHeight, 0.01, 100);
    camera.position.set(0, 0, 0.45);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 0.05;
    controls.maxDistance = 5.0;
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffdfa, 2.2);
    keyLight.position.set(1.5, 2.5, 2.0);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 1.4);
    fillLight.position.set(-2.0, 1.0, -1.5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xdbeafe, 1.0);
    rimLight.position.set(0, -2.0, 2.0);
    scene.add(rimLight);

    let pulseTime = 0;
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      controls.update();

      if (selectedSystemRef.current === 'CARDIOVASCULAR' && currentGroupRef.current) {
        pulseTime += 0.04;
        const pulse = 1 + Math.sin(pulseTime * 2.5) * 0.012;
        currentGroupRef.current.scale.set(pulse, pulse, pulse);
      } else if (currentGroupRef.current) {
        currentGroupRef.current.scale.set(1, 1, 1);
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (currentGroupRef.current) disposeGroup(currentGroupRef.current);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // Load BodyParts3D anatomical model whenever selectedSystem changes
  useEffect(() => {
    let isCancelled = false;

    const loadAnatomicalModel = async () => {
      setIsLoaded(false);
      setLoadingProgress(10);
      setLoadingStatus(`Loading ${selectedSystem} anatomical mesh...`);

      try {
        const result = await atlasLoaderService.buildSystemMeshes(selectedSystem, (status, pct) => {
          if (!isCancelled) {
            setLoadingStatus(status);
            setLoadingProgress(pct);
          }
        });

        if (isCancelled || !sceneRef.current) {
          disposeGroup(result.group);
          return;
        }

        if (currentGroupRef.current) {
          disposeGroup(currentGroupRef.current);
          sceneRef.current.remove(currentGroupRef.current);
        }

        sceneRef.current.add(result.group);
        currentGroupRef.current = result.group;
        partMeshesRef.current = result.parts;

        if (cameraRef.current && controlsRef.current) {
          const fitRadius = result.radius;
          const fov = cameraRef.current.fov * (Math.PI / 180);
          const distance = Math.abs(fitRadius / Math.sin(fov / 2)) * 1.35;

          controlsRef.current.target.set(0, 0, 0);
          
          let targetCamPos: THREE.Vector3;
          if (selectedSystem === 'CARDIOVASCULAR') {
            targetCamPos = new THREE.Vector3(0.04, 0.02, distance * 0.85);
          } else {
            targetCamPos = new THREE.Vector3(0, 0.02, distance * 0.95);
          }

          cameraRef.current.position.copy(targetCamPos);
          initialCameraPosRef.current.copy(targetCamPos);
          controlsRef.current.update();
        }

        setIsLoaded(true);
        setIsolatedPartName(null);
        setSelectedPart(null);
      } catch (err) {
        console.error('Failed to load BodyParts3D model:', err);
        setHasWebGLError(true);
      }
    };

    loadAnatomicalModel();

    return () => {
      isCancelled = true;
    };
  }, [selectedSystem]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current || !cameraRef.current || partMeshesRef.current.length === 0) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const meshes = partMeshesRef.current.map(p => p.mesh);
    const intersects = raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const topHit = intersects[0].object as THREE.Mesh;
      setHoveredPartName(topHit.name);
      containerRef.current.style.cursor = 'pointer';
    } else {
      setHoveredPartName(null);
      containerRef.current.style.cursor = 'grab';
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current || !cameraRef.current || partMeshesRef.current.length === 0) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const meshes = partMeshesRef.current.map(p => p.mesh);
    const intersects = raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const topHit = intersects[0].object as THREE.Mesh;
      const partData = topHit.userData;
      setSelectedPart({
        name: topHit.name,
        system: partData.system || selectedSystem,
        conceptId: partData.conceptId || ''
      });
    }
  };

  const handleResetCamera = () => {
    if (cameraRef.current && controlsRef.current && currentGroupRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      cameraRef.current.position.copy(initialCameraPosRef.current);
      controlsRef.current.update();
    }
    setIsolatedPartName(null);
    setSelectedPart(null);
  };

  const toggleIsolatePart = (partName: string) => {
    if (!currentGroupRef.current) return;

    if (isolatedPartName === partName) {
      partMeshesRef.current.forEach(({ mesh }) => {
        mesh.visible = true;
      });
      setIsolatedPartName(null);
    } else {
      partMeshesRef.current.forEach(({ mesh }) => {
        mesh.visible = mesh.name === partName;
      });
      setIsolatedPartName(partName);
    }
  };

  if (hasWebGLError) {
    return (
      <div className="w-full h-[520px] bg-white rounded-3xl border border-slate-100 p-6 flex flex-col items-center justify-center text-center shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
          <Activity className="w-6 h-6" />
        </div>
        <h3 className="text-base font-extrabold text-slate-900">WebGL Acceleration Unavailable</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Rendering reference anatomical view in high-contrast clinical 2D fallback mode.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[540px] bg-gradient-to-b from-slate-50/90 via-white to-slate-50/90 rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col select-none">
      
      {/* Top Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2">
        
        {/* System Pill Group */}
        <div className="flex items-center gap-1.5 p-1 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm">
          {[
            { id: 'CARDIOVASCULAR', label: 'Cardiovascular (Heart)', icon: Heart, color: 'text-rose-600' },
            { id: 'RESPIRATORY', label: 'Respiratory (Lungs)', icon: Wind, color: 'text-sky-600' },
            { id: 'NEUROLOGICAL', label: 'Cognitive (Brain)', icon: Brain, color: 'text-amber-600' },
            { id: 'MUSCULOSKELETAL', label: 'Musculoskeletal', icon: Dumbbell, color: 'text-emerald-600' },
            { id: 'CIRCADIAN', label: 'Circadian / Sleep', icon: Moon, color: 'text-purple-600' },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = selectedSystem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectSystem?.(item.id as HealthSystemType)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : item.color}`} />
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">{item.id.slice(0, 4)}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleResetCamera}
            title="Reset 3D Camera Frame"
            className="p-2 rounded-xl bg-white/90 backdrop-blur-md text-slate-700 hover:text-blue-600 hover:bg-slate-100 border border-slate-200/80 shadow-sm transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Floating Dynamic Metric Data Overlay Card */}
      <div className="absolute bottom-12 left-4 z-20 max-w-[280px] bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-md">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            {selectedSystem} TELEMETRY
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            status === 'WATCH' ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
          }`}>
            {status}
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900 tracking-tight">{metricValue}</span>
          <span className={`text-xs font-extrabold ${
            status === 'WATCH' ? 'text-amber-600' : 'text-emerald-600'
          }`}>
            {baselineDelta}
          </span>
        </div>

        <p className="text-xs font-medium text-slate-600 mt-0.5">{metricLabel}</p>

        {selectedPart && (
          <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-600">SELECTED STRUCTURE</span>
              <button 
                onClick={() => toggleIsolatePart(selectedPart.name)}
                className="text-[10px] font-bold text-slate-500 hover:text-blue-600 underline"
              >
                {isolatedPartName === selectedPart.name ? 'Show All' : 'Isolate'}
              </button>
            </div>
            <p className="text-xs font-extrabold text-slate-800 leading-tight">{selectedPart.name}</p>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 z-30 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-3 animate-pulse">
            <Sparkles className="w-6 h-6 animate-spin" />
          </div>
          <h4 className="text-sm font-black text-slate-900">{loadingStatus}</h4>
          <div className="w-48 h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-slate-400 mt-1">{loadingProgress}%</span>
        </div>
      )}

      {/* Hover Tooltip */}
      {hoveredPartName && isLoaded && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-extrabold shadow-lg backdrop-blur-sm border border-slate-700 pointer-events-none">
          {hoveredPartName}
        </div>
      )}

      {/* Three.js Canvas Container */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Footer Attribution & Reference Anatomy License Disclaimer */}
      <div className="absolute bottom-2 left-4 right-4 z-20 flex items-center justify-between text-[10px] text-slate-400 font-medium pointer-events-none">
        <span className="bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded-md border border-slate-200/60">
          Reference Anatomy • BodyParts3D © DBCLS (CC BY 4.0) • Human Atlas (MIT)
        </span>
        <span className="bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded-md border border-slate-200/60 hidden sm:inline">
          Orbit: Drag | Zoom: Scroll
        </span>
      </div>

    </div>
  );
}
