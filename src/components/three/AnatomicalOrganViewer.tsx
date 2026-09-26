'use client';

/**
 * AnatomicalOrganViewer — renders a real reference-organ GLB with structure
 * selection, isolation, hover identification and camera controls.
 *
 * Design notes
 * ------------
 *  - The model is loaded lazily per selected system, so the dashboard never
 *    downloads anatomy the user has not asked for.
 *  - The loaded glTF scene graph is rendered ONCE via <primitive>. Highlight,
 *    isolation and group filtering are applied by mutating each mesh's own
 *    material and visibility, which avoids cloning geometry and avoids
 *    rendering the graph twice.
 *  - Camera framing is computed from the meshes' real world-space bounding
 *    boxes. Quantized models (KHR_mesh_quantization) report quantized accessor
 *    bounds that do not describe the visible geometry, so accessor min/max is
 *    never trusted for framing.
 *  - Structure names come from the glTF node names, which carry a source
 *    prefix (`VH_M_`, `Allen_`, `FJ<id> `). All name-to-group mapping lives in
 *    the anatomy catalog.
 */

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import {
  ALL_SYSTEM_KEYS,
  ORGAN_DEFINITIONS,
  humanizeStructureName,
  partitionStructures,
} from '@/services/anatomyCatalog';
import type { OrganSystemKey } from '@/services/organHealthService';
import { ORGAN_SYSTEM_SHORT } from '@/services/organHealthService';
import {
  AlertTriangle,
  Crosshair,
  Eye,
  EyeOff,
  Layers,
  Loader2,
  Maximize2,
  Minimize2,
  RotateCcw,
} from 'lucide-react';

const BASE_COLOR = '#cf7a5c';
const BASE_OPACITY = 1;

interface AnatomicalOrganViewerProps {
  system: OrganSystemKey;
  onSelectSystem: (system: OrganSystemKey) => void;
  accent: string;
  expanded?: boolean;
  onToggleExpanded?: () => void;
  reducedMotion?: boolean;
}

interface StructureEntry {
  mesh: THREE.Mesh;
  /** Raw glTF node name identifying the anatomical structure. */
  name: string;
  material: THREE.MeshStandardMaterial;
}

/**
 * Walk a loaded glTF graph and pair each mesh with its structure name and a
 * dedicated material instance that this component owns and disposes.
 *
 * Some exporters name only the parent node, so a mesh with an empty name
 * inherits the nearest named ancestor.
 */
function collectStructures(root: THREE.Object3D): StructureEntry[] {
  const entries: StructureEntry[] = [];
  const inherited = new Map<THREE.Object3D, string>();

  root.traverse((obj) => {
    const name = obj.name || (obj.parent ? inherited.get(obj.parent) ?? '' : '');
    if (name) inherited.set(obj, name);
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(BASE_COLOR),
      roughness: 0.6,
      metalness: 0.04,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: BASE_OPACITY,
    });
    // Release whatever material arrived with the file.
    const original = mesh.material;
    if (Array.isArray(original)) original.forEach((m) => m.dispose?.());
    else original?.dispose?.();
    mesh.material = material;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    entries.push({ mesh, name: name || 'structure', material });
  });

  return entries;
}

/** World-space bounding sphere of a set of meshes. */
function measure(entries: StructureEntry[]): { center: THREE.Vector3; radius: number } {
  const box = new THREE.Box3();
  for (const { mesh } of entries) {
    mesh.updateWorldMatrix(true, false);
    const geom = mesh.geometry;
    if (!geom.boundingBox) geom.computeBoundingBox();
    const bb = geom.boundingBox?.clone();
    if (!bb) continue;
    bb.applyMatrix4(mesh.matrixWorld);
    box.union(bb);
  }
  if (box.isEmpty()) return { center: new THREE.Vector3(), radius: 1 };
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  return { center, radius: Math.max(size.x, size.y, size.z) / 2 || 1 };
}

interface SceneProps {
  system: OrganSystemKey;
  isolated: string | null;
  selected: string | null;
  hovered: string | null;
  visible: Set<string> | null;
  accent: string;
  reducedMotion: boolean;
  resetToken: number;
  zoomCommand: { direction: 'in' | 'out'; token: number } | null;
  onHover: (name: string | null) => void;
  onSelect: (name: string | null) => void;
  onStructures: (names: string[]) => void;
}

function OrganScene({
  system,
  isolated,
  selected,
  hovered,
  visible,
  accent,
  reducedMotion,
  resetToken,
  zoomCommand,
  onHover,
  onSelect,
  onStructures,
}: SceneProps) {
  const definition = ORGAN_DEFINITIONS[system];
  const gltf = useGLTF(`/models/organs/${definition.file}`);
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  const [entries, setEntries] = useState<StructureEntry[]>([]);

  // Adopt the loaded graph once per model: build materials, then measure.
  useEffect(() => {
    const root = gltf.scene;
    const collected = collectStructures(root);
    setEntries(collected);
    onStructures(collected.map((e) => e.name));

    // Frame the camera on the real geometry.
    const { center, radius } = measure(collected);
    const controls = controlsRef.current;
    camera.position.set(
      center.x,
      center.y + radius * 0.10,
      center.z + radius * 3.0
    );
    camera.near = Math.max(radius / 400, 0.001);
    camera.far = radius * 400;
    camera.updateProjectionMatrix();
    if (controls) {
      controls.target.copy(center);
      controls.minDistance = radius * 1.2;
      controls.maxDistance = radius * 7;
      controls.update();
    }

    return () => {
      collected.forEach((entry) => entry.material.dispose());
      setEntries([]);
    };
  }, [gltf, camera, system, onStructures]);

  // Orbit target must track the model even before controls exist.
  useEffect(() => {
    if (!entries.length || !controlsRef.current) return;
    const { center } = measure(entries);
    controlsRef.current.target.copy(center);
    controlsRef.current.update();
  }, [entries]);

  // Apply highlight, isolation and group filtering.
  useEffect(() => {
    for (const entry of entries) {
      const isHovered = hovered === entry.name;
      const isSelected = selected === entry.name;
      const active = isHovered || isSelected;
      const inGroup = visible === null || visible.has(entry.name);
      const allowedByIsolation = isolated === null || isolated === entry.name;

      entry.mesh.visible = inGroup && allowedByIsolation;
      entry.material.color.set(active ? accent : BASE_COLOR);
      entry.material.emissive.set(active ? new THREE.Color(accent).multiplyScalar(0.3) : 0x000000);
      entry.material.opacity = entry.mesh.visible ? BASE_OPACITY : 0;
      entry.material.depthWrite = entry.mesh.visible;
    }
  }, [entries, hovered, selected, visible, isolated, accent]);

  // Gentle pulse on the active structure only.
  const pulseRef = useRef(0);
  useEffect(() => {
    if (reducedMotion) return;
    let raf = 0;
    const tick = () => {
      pulseRef.current += 1;
      const scale = 1 + Math.sin(pulseRef.current / 24) * 0.006;
      for (const entry of entries) {
        if (entry.name === hovered || entry.name === selected) entry.mesh.scale.setScalar(scale);
        else if (entry.mesh.scale.x !== 1) entry.mesh.scale.setScalar(1);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [entries, hovered, selected, reducedMotion]);

  /**
   * The region the camera should be looking at: the isolated structure when one
   * is isolated, otherwise the whole organ. Isolation re-frames the camera so
   * the selected structure actually fills the viewport — isolating a valve at
   * whole-heart distance would leave it a few pixels across.
   */
  const framing = useMemo(() => {
    if (isolated) {
      const subset = entries.filter((e) => e.name === isolated);
      if (subset.length) return measure(subset);
    }
    return measure(entries);
  }, [entries, isolated]);

  // Smoothly tween the camera to the new framing rather than snapping.
  const tween = useRef<{
    fromPos: THREE.Vector3;
    toPos: THREE.Vector3;
    fromTarget: THREE.Vector3;
    toTarget: THREE.Vector3;
    t: number;
  } | null>(null);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls || !entries.length) return;

    const zoom = isolated ? 2.5 : 3.0;
    const current = camera.position.clone().sub(controls.target);
    const dir = current.lengthSq() > 1e-8 ? current.normalize() : new THREE.Vector3(0, 0.15, 1).normalize();
    const toPos = framing.center.clone().addScaledVector(dir, framing.radius * zoom);
    const toTarget = framing.center.clone();

    // Distance limits are relative to what is currently being framed. Without
    // this, isolating a small structure would frame it and then be clamped back
    // out to the whole-organ limit, leaving it a few pixels wide again.
    controls.minDistance = framing.radius * 1.05;
    controls.maxDistance = framing.radius * 8;

    if (reducedMotion) {
      camera.position.copy(toPos);
      controls.target.copy(toTarget);
      controls.update();
      tween.current = null;
      return;
    }
    tween.current = {
      fromPos: camera.position.clone(),
      toPos,
      fromTarget: controls.target.clone(),
      toTarget,
      t: 0,
    };
  }, [framing, isolated, entries.length, camera, reducedMotion]);

  useFrame(() => {
    const tw = tween.current;
    const controls = controlsRef.current;
    if (!tw || !controls) return;
    tw.t = Math.min(1, tw.t + 0.06);
    const eased = 1 - Math.pow(1 - tw.t, 3); // easeOutCubic
    camera.position.lerpVectors(tw.fromPos, tw.toPos, eased);
    controls.target.lerpVectors(tw.fromTarget, tw.toTarget, eased);
    controls.update();
    if (tw.t >= 1) tween.current = null;
  });

  // Camera reset.
  useEffect(() => {
    if (resetToken === 0 || !entries.length) return;
    const { center, radius } = measure(entries);
    camera.position.set(center.x, center.y + radius * 0.10, center.z + radius * 3.0);
    if (controlsRef.current) {
      controlsRef.current.target.copy(center);
      controlsRef.current.update();
    }
  }, [resetToken, entries, camera]);

  // Discrete zoom buttons, bounded by the measured model size.
  const lastZoom = useRef(0);
  useEffect(() => {
    if (!zoomCommand || zoomCommand.token === lastZoom.current || !entries.length) return;
    lastZoom.current = zoomCommand.token;
    const controls = controlsRef.current;
    if (!controls) return;
    const { center, radius } = measure(entries);
    const target = center.clone();
    const dir = camera.position.clone().sub(target).normalize();
    const current = camera.position.distanceTo(target);
    const factor = zoomCommand.direction === 'in' ? 0.8 : 1.25;
    const next = THREE.MathUtils.clamp(current * factor, radius * 1.2, radius * 7);
    camera.position.copy(target).addScaledVector(dir, next);
    controls.update();
  }, [zoomCommand, entries, camera]);

  return (
    <>
      <primitive
        object={gltf.scene}
        onPointerOver={(e: any) => {
          e.stopPropagation();
          if (e.object?.isMesh) onHover(e.object.name || null);
        }}
        onPointerOut={(e: any) => {
          e.stopPropagation();
          onHover(null);
        }}
        onClick={(e: any) => {
          e.stopPropagation();
          const name = e.object?.name;
          if (name) onSelect(name === selected ? null : name);
        }}
      />
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.65}
        zoomSpeed={0.8}
      />
    </>
  );
}

function LoaderOverlay({ label }: { label: string }) {
  const { progress, active } = useProgress();
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-white/85 backdrop-blur-sm">
      <Loader2 className="h-6 w-6 animate-spin text-slate-500" aria-hidden="true" />
      <p className="text-xs font-semibold text-slate-600">Loading {label} anatomy…</p>
      <div className="h-1 w-40 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-slate-500 transition-[width] duration-300"
          style={{ width: `${active ? Math.max(progress, 5) : 100}%` }}
        />
      </div>
    </div>
  );
}

export default function AnatomicalOrganViewer({
  system,
  onSelectSystem,
  accent,
  expanded = false,
  onToggleExpanded,
  reducedMotion = false,
}: AnatomicalOrganViewerProps) {
  const definition = ORGAN_DEFINITIONS[system];
  const [isolated, setIsolated] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<string | null>(definition.defaultGroup);
  const [resetToken, setResetToken] = useState(0);
  const [zoomCommand, setZoomCommand] = useState<{ direction: 'in' | 'out'; token: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [names, setNames] = useState<string[]>([]);

  // Reset per-system structure state.
  useEffect(() => {
    setSelected(null);
    setHovered(null);
    setError(null);
    setNames([]);
    setIsolated(null);
    setActiveGroup(ORGAN_DEFINITIONS[system].defaultGroup);
  }, [system]);

  const groups = useMemo(() => partitionStructures(definition, names), [definition, names]);

  const visible = useMemo<Set<string> | null>(() => {
    if (!activeGroup) return null;
    const list = groups[activeGroup];
    if (!list || !list.length) return null;
    return new Set(list);
  }, [activeGroup, groups]);

  const handleStructures = useCallback((next: string[]) => {
    if (!next.length) {
      setError('No anatomical structures could be read from this model.');
      return;
    }
    setError(null);
    setNames(next);
  }, []);

  const activeName = hovered || selected;
  const label = activeName ? humanizeStructureName(activeName) : null;
  const groupCounts = definition.groups
    .map((g) => ({ group: g, count: (groups[g.id] ?? []).length }))
    .filter((x) => x.count > 0);

  return (
    <section
      className="relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white"
      aria-label={`${definition.organLabel} 3D anatomical viewer`}
    >
      {/* Header: organ tabs + camera controls */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-1" role="tablist" aria-label="Organ system">
          {ALL_SYSTEM_KEYS.map((key) => {
            const active = key === system;
            return (
              <button
                key={key}
                role="tab"
                aria-selected={active}
                onClick={() => onSelectSystem(key)}
                className={`rounded-md px-2.5 py-1.5 text-[11px] font-bold transition ${
                  active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {ORGAN_SYSTEM_SHORT[key]}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-0.5">
          <IconButton label="Zoom in" onClick={() => setZoomCommand({ direction: 'in', token: performance.now() })}>
            <Maximize2 className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton label="Zoom out" onClick={() => setZoomCommand({ direction: 'out', token: performance.now() })}>
            <Minimize2 className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton label="Reset camera" onClick={() => setResetToken((t) => t + 1)}>
            <RotateCcw className="h-3.5 w-3.5" />
          </IconButton>
          {onToggleExpanded && (
            <IconButton label={expanded ? 'Collapse viewer' : 'Expand viewer'} onClick={onToggleExpanded}>
              <Crosshair className="h-3.5 w-3.5" />
            </IconButton>
          )}
        </div>
      </div>

      {/* 3D viewport */}
      <div className="relative min-h-[300px] flex-1 bg-gradient-to-b from-slate-50 to-white">
        {error ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
            <AlertTriangle className="h-6 w-6 text-amber-500" aria-hidden="true" />
            <p className="text-sm font-semibold text-slate-700">3D model unavailable</p>
            <p className="max-w-sm text-xs text-slate-500">{error}</p>
          </div>
        ) : (
          <>
            <Canvas
              camera={{ position: [0, 0, 4], fov: 42, near: 0.01, far: 1000 }}
              dpr={[1, 2]}
              gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            >
              <ambientLight intensity={0.9} />
              <hemisphereLight intensity={0.45} groundColor="#e2e8f0" color="#ffffff" />
              <directionalLight position={[4, 6, 5]} intensity={1.6} />
              <directionalLight position={[-5, -2, -4]} intensity={0.5} color="#93c5fd" />
              <pointLight position={[0, 1.6, 3]} intensity={0.35} />
              <Suspense fallback={null}>
                <OrganScene
                  system={system}
                  isolated={isolated}
                  selected={selected}
                  hovered={hovered}
                  visible={visible}
                  accent={accent}
                  reducedMotion={reducedMotion}
                  resetToken={resetToken}
                  zoomCommand={zoomCommand}
                  onHover={setHovered}
                  onSelect={setSelected}
                  onStructures={handleStructures}
                />
              </Suspense>
            </Canvas>
            {!names.length && !error && <LoaderOverlay label={definition.organLabel} />}
          </>
        )}

        {label && !error && (
          <div className="pointer-events-none absolute left-1/2 top-3 z-20 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-slate-200 bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
            {label}
            {isolated && isolated === activeName && (
              <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-white">
                ISOLATED
              </span>
            )}
          </div>
        )}

        {isolated && (
          <div className="pointer-events-none absolute right-3 top-3 z-20 flex items-center gap-1.5 rounded-lg bg-slate-900/90 px-2.5 py-1.5 text-[10px] font-bold text-white">
            <EyeOff className="h-3 w-3" /> ISOLATED
          </div>
        )}

        <div className="pointer-events-none absolute bottom-2 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-1 text-[10px] leading-tight text-slate-500">
          <span>
            Reference anatomy • {definition.modelName} • {definition.source} (CC BY 4.0)
          </span>
          <span className="hidden sm:inline">Drag to rotate · Scroll to zoom</span>
        </div>
      </div>

      {/* Structure panel */}
      <div className="relative z-20 border-t border-slate-100 px-3 py-2.5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
            <span className="truncate text-[10px] font-bold uppercase tracking-wide text-slate-500">
              Anatomical Structures
            </span>
            <span className="shrink-0 text-[10px] text-slate-400">{names.length}</span>
          </div>
          {(selected || isolated) && (
            <div className="flex shrink-0 items-center gap-1">
              {selected && (
                <button
                  onClick={() => setIsolated(isolated === selected ? null : selected)}
                  className={`rounded-md px-2 py-1 text-[10px] font-bold transition ${
                    isolated === selected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isolated === selected ? 'Show all' : 'Isolate'}
                </button>
              )}
              <button
                onClick={() => {
                  setSelected(null);
                  setIsolated(null);
                }}
                className="rounded-md px-2 py-1 text-[10px] font-bold text-slate-500 hover:bg-slate-100"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {groupCounts.length > 0 && (
          <>
            <div className="mb-2 flex flex-wrap gap-1">
              {groupCounts.map(({ group, count }) => {
                const active = activeGroup === group.id;
                return (
                  <button
                    key={group.id}
                    onClick={() => setActiveGroup(active ? null : group.id)}
                    aria-pressed={active}
                    className={`rounded-md px-2 py-1 text-[10px] font-semibold transition ${
                      active ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    style={active ? { backgroundColor: accent } : undefined}
                  >
                    {group.label} ({count})
                  </button>
                );
              })}
            </div>

            {activeGroup && (
              <p className="mb-2 text-[10px] leading-relaxed text-slate-500">
                {definition.groups.find((g) => g.id === activeGroup)?.description}
              </p>
            )}

            <div className="max-h-28 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50/60 p-1.5">
              {activeGroup ? (
                <ul className="flex flex-wrap gap-1">
                  {(groups[activeGroup] ?? []).map((raw) => {
                    const isSel = selected === raw;
                    return (
                      <li key={raw}>
                        <button
                          onClick={() => {
                            setSelected(isSel ? null : raw);
                            setIsolated(null);
                          }}
                          title={humanizeStructureName(raw)}
                          className={`rounded px-1.5 py-0.5 text-[10px] transition ${
                            isSel ? 'font-bold text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
                          }`}
                          style={isSel ? { backgroundColor: accent } : undefined}
                        >
                          {humanizeStructureName(raw)}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="flex items-center gap-1 px-1 py-0.5 text-[10px] text-slate-400">
                  <Eye className="h-3 w-3" /> Select a group to list its structures.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
    >
      {children}
    </button>
  );
}

// Preload only the default (heart) model: the dashboard's first paint gets the
// heart immediately without pulling down anatomy for other systems.
useGLTF.preload(`/models/organs/${ORGAN_DEFINITIONS.CARDIOVASCULAR.file}`);
