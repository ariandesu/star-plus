'use client';

import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import HeartModel from './HeartModel';
import LungModel from './LungModel';
import BrainModel from './BrainModel';
import SkeletalModel from './SkeletalModel';
import CircadianModel from './CircadianModel';
import HealthVisualizationFallback from './HealthVisualizationFallback';
import { RotateCcw, ZoomIn, ZoomOut, Info, ShieldAlert, Sparkles, Heart, Activity } from 'lucide-react';

export type HealthSystemType = 'CARDIOVASCULAR' | 'RESPIRATORY' | 'MUSCULOSKELETAL' | 'NEUROLOGICAL' | 'CIRCADIAN';

interface OrganHealthSceneProps {
  selectedSystem: HealthSystemType;
  status?: 'NOMINAL' | 'WATCH' | 'CRITICAL';
  metricValue?: string;
  metricLabel?: string;
  baselineDelta?: string;
  astronautName?: string;
  onSelectSystem?: (system: HealthSystemType) => void;
}

export default function OrganHealthScene({
  selectedSystem = 'CARDIOVASCULAR',
  status = 'WATCH',
  metricValue = '65 BPM',
  metricLabel = 'Resting HR',
  baselineDelta = '+8%',
  astronautName = 'Maya Chen',
  onSelectSystem
}: OrganHealthSceneProps) {
  const [cameraKey, setCameraKey] = useState(0);

  const handleResetCamera = () => {
    setCameraKey((prev) => prev + 1);
  };

  const renderOrganModel = () => {
    switch (selectedSystem) {
      case 'CARDIOVASCULAR':
        return <HeartModel status={status} bpm={65} />;
      case 'RESPIRATORY':
        return <LungModel status={status} />;
      case 'NEUROLOGICAL':
        return <BrainModel status={status} />;
      case 'MUSCULOSKELETAL':
        return <SkeletalModel status={status} />;
      case 'CIRCADIAN':
        return <CircadianModel status={status} />;
      default:
        return <HeartModel status={status} bpm={65} />;
    }
  };

  const getSystemTitle = () => {
    switch (selectedSystem) {
      case 'CARDIOVASCULAR': return 'CARDIOVASCULAR SYSTEM • 3D HEART';
      case 'RESPIRATORY': return 'RESPIRATORY SYSTEM • 3D LUNGS';
      case 'NEUROLOGICAL': return 'NEUROLOGICAL SYSTEM • 3D BRAIN';
      case 'MUSCULOSKELETAL': return 'MUSCULOSKELETAL SYSTEM • 3D SPINE/BONES';
      case 'CIRCADIAN': return 'CIRCADIAN & RECOVERY • 3D ENDOCRINE PATHWAY';
      default: return 'CARDIOVASCULAR SYSTEM • 3D HEART';
    }
  };

  return (
    <div className="relative w-full h-[480px] sm:h-[520px] rounded-3xl bg-gradient-to-b from-slate-50 via-white to-slate-100/80 border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between p-4 sm:p-6">
      
      {/* ========================================================== */}
      {/* 1. TOP HEADER OVERLAY BAR                                 */}
      {/* ========================================================== */}
      <div className="relative z-10 flex items-center justify-between pointer-events-auto">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              {getSystemTitle()}
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
            Detailed 3D Anatomical Organ Visualization
          </h3>
        </div>

        {/* Orbit Controls & Camera Reset Trigger */}
        <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <button
            onClick={handleResetCamera}
            title="Reset Camera Angle"
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================== */}
      {/* 2. THREE.JS 3D CANVAS VIEWPORT                             */}
      {/* ========================================================== */}
      <div className="absolute inset-0 z-0">
        <Canvas
          key={cameraKey}
          camera={{ position: [0, 0, 3.8], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          className="w-full h-full"
        >
          {/* Clinical Soft Lighting Setup */}
          <ambientLight intensity={1.2} />
          <directionalLight position={[5, 8, 5]} intensity={1.8} color="#ffffff" castShadow />
          <directionalLight position={[-5, -4, -3]} intensity={0.8} color="#38bdf8" />
          <pointLight position={[0, 2, 2]} intensity={0.5} color="#f472b6" />

          {/* Model Rendering with Suspense */}
          <Suspense fallback={null}>
            {renderOrganModel()}
          </Suspense>

          {/* Orbit Controls (Smooth rotation & restraint) */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={2.5}
            maxDistance={5.5}
            maxPolarAngle={Math.PI / 1.6}
            minPolarAngle={Math.PI / 4}
            rotateSpeed={0.6}
          />
        </Canvas>
      </div>

      {/* ========================================================== */}
      {/* 3. FLOATING GLASSMORPHIC HEALTH METRIC CARD (BOTTOM LEFT)  */}
      {/* ========================================================== */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pointer-events-none">
        
        {/* Floating Health Metric Glass Card */}
        <div className="pointer-events-auto bg-white/90 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-white/80 shadow-xl shadow-slate-200/50 max-w-xs space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {metricLabel}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              status === 'WATCH' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {status}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {metricValue}
            </span>
            <span className="text-xs font-extrabold text-amber-600">
              {baselineDelta} vs baseline
            </span>
          </div>

          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
            {selectedSystem === 'CARDIOVASCULAR'
              ? 'Heart rate elevated during EVA prep phase. Microgravity cardiac adaptation active.'
              : selectedSystem === 'RESPIRATORY'
              ? 'Oxygen saturation nominal at 98%. CO2 clearance rate optimal.'
              : selectedSystem === 'NEUROLOGICAL'
              ? 'Cognitive speed & neural reflex nominal. Stress index slight elevation.'
              : selectedSystem === 'MUSCULOSKELETAL'
              ? 'Lumbar vertebral load & bone mineral density monitored.'
              : 'Circadian phase delay 1.2h. Melatonin secretor rhythm active.'}
          </p>
        </div>

        {/* System Pill Selectors Bar */}
        {onSelectSystem && (
          <div className="pointer-events-auto flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-md">
            {[
              { id: 'CARDIOVASCULAR', label: 'Heart' },
              { id: 'RESPIRATORY', label: 'Lungs' },
              { id: 'NEUROLOGICAL', label: 'Brain' },
              { id: 'MUSCULOSKELETAL', label: 'Bones' },
              { id: 'CIRCADIAN', label: 'Sleep' },
            ].map((sys) => {
              const active = selectedSystem === sys.id;
              return (
                <button
                  key={sys.id}
                  onClick={() => onSelectSystem(sys.id as HealthSystemType)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-transparent text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {sys.label}
                </button>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
