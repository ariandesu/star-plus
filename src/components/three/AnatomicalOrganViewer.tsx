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
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
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
  /** Material shown for this structure when it is not highlighted. */
  base: THREE.Material;
}

/**
 * Appearance used only for meshes that carry no authored material.
 *
 * The reference organs are authored with curated per-structure colours — the
 * heart ships `#ca7571` at roughness 0.25, the lung separates `lung_mat`
 * (tissue) from `mucosa_mat` and `Cartilage_Mat`, the brain separates brain
 * from retina. Those MUST be preserved: overlaying one flat colour on all of
 * them discards the contrast that identifies tissue boundaries in the first
 * place.
 *
 * A model with no materials at all is the exception. GLTFLoader then hands
 * every mesh the glTF spec default (white, metalness 1, roughness 1), which
 * renders as dull grey metal — the skeleton GLB is exactly this case. These
 * fallbacks supply a plausible tissue appearance per system so such a model
 * still reads as anatomy rather than as chrome.
 */
const FALLBACK_APPEARANCE: Record<
  OrganSystemKey,
  { color: string; roughness: number; metalness: number }
> = {
  CARDIOVASCULAR: { color: '#b4534d', roughness: 0.55, metalness: 0.02 },
  RESPIRATORY: { color: '#e0b0b3', roughness: 0.6, metalness: 0.02 },
  COGNITIVE: { color: '#efb4a2', roughness: 0.6, metalness: 0.02 },
  // Cortical bone is warm off-white, not white, and only faintly specular.
  MUSCULOSKELETAL: { color: '#e9e3d6', roughness: 0.55, metalness: 0.02 },
  SLEEP: { color: '#d9a5aa', roughness: 0.6, metalness: 0.02 },
};

/**
 * True when a loaded material carries authored appearance worth keeping.
 *
 * The spec default is detected structurally rather than by name: an untextured
 * material at metalness 1 / roughness 1 is what the glTF loader substitutes for
 * a missing material, and it is never a deliberate artist choice.
 */
function hasAuthoredAppearance(material: THREE.Material | null | undefined): boolean {
  if (!material) return false;
  const standard = material as THREE.MeshStandardMaterial;
  // Anything that is not a standard material is authored on purpose.
  if (standard.isMeshStandardMaterial !== true) return true;
  if (standard.map || standard.normalMap || standard.roughnessMap || standard.metalnessMap) {
    return true;
  }
  return !(standard.metalness >= 0.99 && standard.roughness >= 0.99);
}

function createFallbackMaterial(system: OrganSystemKey): THREE.MeshStandardMaterial {
  const look = FALLBACK_APPEARANCE[system];
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(look.color),
    roughness: look.roughness,
    metalness: look.metalness,
    // Models that ship no materials are also not guaranteed to have consistent
    // winding, so both faces are drawn.
    side: THREE.DoubleSide,
  });
}

/**
 * One shared highlight material for the whole scene.
 *
 * Only the active structure is switched to it, so the program count stays at
 * the number of distinct source materials plus one no matter how many
 * structures a model has.
 *
 * It is deliberately opaque: a transparent highlight would push every
 * structure into the depth-sorted transparent pass. Visibility is driven by
 * `mesh.visible`, not by opacity.
 */
function createHighlightMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(BASE_COLOR),
    roughness: 0.5,
    metalness: 0.05,
    side: THREE.DoubleSide,
    emissive: new THREE.Color(0x000000),
  });
}

/**
 * Image-based lighting from a neutral studio room.
 *
 * MeshStandardMaterial only shows specular response when the scene has an
 * environment; with lights alone every surface reads as flat matte no matter
 * how good its roughness map is. RoomEnvironment is generated procedurally, so
 * this costs no network request and no HDR asset.
 */
function StudioEnvironment({ intensity = 0.55 }: { intensity?: number }) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = pmrem.fromScene(room, 0.04);
    scene.environment = target.texture;
    scene.environmentIntensity = intensity;
    room.dispose?.();
    pmrem.dispose();

    return () => {
      scene.environment = null;
      target.texture.dispose();
    };
  }, [gl, scene, intensity]);

  return null;
}

/**
 * Walk a loaded glTF graph and pair each mesh with its structure name.
 *
 * Some exporters name only the parent node, so a mesh with an empty name
 * inherits the nearest named ancestor.
 */
function collectStructures(root: THREE.Object3D, system: OrganSystemKey): StructureEntry[] {
  const entries: StructureEntry[] = [];
  const inherited = new Map<THREE.Object3D, string>();

  // One shared fallback per system, so the skeleton's 246 untextured meshes
  // still compile a single program instead of one per mesh.
  let fallback: THREE.MeshStandardMaterial | null = null;
  const fallbackFor = () => (fallback ??= createFallbackMaterial(system));

  root.traverse((obj) => {
    const name = obj.name || (obj.parent ? inherited.get(obj.parent) ?? '' : '');
    if (name) inherited.set(obj, name);
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    // A mesh may carry a material array (multi-material geometry); the first
    // slot is the one the viewer would show, so judge the group by that.
    const authored = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    entries.push({
      mesh,
      name: name || 'structure',
      base: hasAuthoredAppearance(authored) ? (authored as THREE.Material) : fallbackFor(),
    });
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
  /**
   * Whether the model exposes named sub-structures worth picking. An
   * unpartitioned model is one fused surface, so hover identification and
   * click-to-select are not attached at all — there is no structure to
   * identify, and pretending otherwise would let the user "select" the whole
   * heart and read a fabricated part name.
   */
  selectable: boolean;
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
  selectable,
  onHover,
  onSelect,
  onStructures,
}: SceneProps) {
  const definition = ORGAN_DEFINITIONS[system];
  const gltf = useGLTF(`/models/organs/${definition.file}`);
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  const [entries, setEntries] = useState<StructureEntry[]>([]);
  const materials = useMemo(() => ({ highlight: createHighlightMaterial() }), []);

  // Adopt the loaded graph once per model, then measure and frame it.
  useEffect(() => {
    const root = gltf.scene;
    const collected = collectStructures(root, system);
    setEntries(collected);
    onStructures(collected.map((e) => e.name));
    // Show each structure with the appearance it was authored with.
    for (const entry of collected) {
      if (entry.mesh.material !== entry.base) entry.mesh.material = entry.base;
    }

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

    return () => setEntries([]);
  }, [gltf, camera, system, onStructures]);

  // Dispose the shared highlight material when the viewer unmounts. Authored
  // materials belong to the loaded glTF and are disposed with it.
  useEffect(
    () => () => {
      materials.highlight.dispose();
    },
    [materials]
  );

  // Orbit target must track the model even before controls exist.
  useEffect(() => {
    if (!entries.length || !controlsRef.current) return;
    const { center } = measure(entries);
    controlsRef.current.target.copy(center);
    controlsRef.current.update();
  }, [entries]);

  // Apply highlight, isolation and group filtering.
  useEffect(() => {
    const highlightColor = new THREE.Color(accent);
    materials.highlight.color.copy(highlightColor);
    materials.highlight.emissive.copy(highlightColor).multiplyScalar(0.3);

    for (const entry of entries) {
      const active = entry.name === hovered || entry.name === selected;
      const inGroup = visible === null || visible.has(entry.name);
      const allowedByIsolation = isolated === null || isolated === entry.name;

      entry.mesh.visible = inGroup && allowedByIsolation;
      const wanted = active ? materials.highlight : entry.base;
      if (entry.mesh.material !== wanted) entry.mesh.material = wanted;
    }
  }, [entries, hovered, selected, visible, isolated, materials, accent]);

  // Gentle pulse on the active structure only.
  useEffect(() => {
    if (reducedMotion) return;
    const activeMeshes = entries.filter((e) => e.name === hovered || e.name === selected);
    if (!activeMeshes.length) return;
    let raf = 0;
    let t = 0;
    const tick = () => {
      t += 1;
      const scale = 1 + Math.sin(t / 24) * 0.006;
      activeMeshes.forEach((e) => e.mesh.scale.setScalar(scale));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      activeMeshes.forEach((e) => e.mesh.scale.setScalar(1));
    };
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
        {...(selectable
          ? {
              onPointerOver: (e: any) => {
                e.stopPropagation();
                if (e.object?.isMesh) onHover(e.object.name || null);
              },
              onPointerOut: (e: any) => {
                e.stopPropagation();
                onHover(null);
              },
              onClick: (e: any) => {
                e.stopPropagation();
                const name = e.object?.name;
                if (name) onSelect(name === selected ? null : name);
              },
            }
          : {})}
      />
      {/* Orbit controls stay available for partitioned models with selectable sub-structures.
          For unpartitioned models (like the photoreal heart), 3D viewport interaction is disabled entirely. */}
      <OrbitControls
        ref={controlsRef}
        enabled={selectable}
        enablePan={false}
        enableZoom={selectable}
        enableRotate={selectable}
        enableDamping={selectable}
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
  /**
   * Whether this model has real named sub-structures. When false the model is a
   * single fused surface (the photoreal heart), so the whole structure panel,
   * the group filters, the hover label and the isolate control are withheld
   * instead of offering selections that name something the file does not
   * contain.
   */
  const selectable = definition.partitioned;
  const [isolated, setIsolated] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState(0);
  const [zoomCommand, setZoomCommand] = useState<{ direction: 'in' | 'out'; token: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [names, setNames] = useState<string[]>([]);

  // Reset per-system structure state. The group filter starts cleared so a
  // newly opened system always shows the complete organ; groups are an
  // optional filter the user opts into, never a default that hides anatomy.
  useEffect(() => {
    setSelected(null);
    setHovered(null);
    setError(null);
    setNames([]);
    setIsolated(null);
    setActiveGroup(null);
  }, [system]);

  const groups = useMemo(
    () => (selectable ? partitionStructures(definition, names) : {}),
    [selectable, definition, names]
  );

  const visible = useMemo<Set<string> | null>(() => {
    if (!activeGroup) return null;
    const list = groups[activeGroup];
    if (!list || !list.length) return null;
    return new Set(list);
  }, [activeGroup, groups]);

  /**
   * Structures listed for selection. With no group filter this is every loaded
   * structure in the model, so any anatomical part is reachable directly
   * without first having to guess which group contains it.
   */
  const structureList = useMemo(
    () => (activeGroup ? groups[activeGroup] ?? [] : names),
    [activeGroup, groups, names]
  );

  const handleStructures = useCallback((next: string[]) => {
    if (!next.length) {
      setError('No anatomical structures could be read from this model.');
      return;
    }
    setError(null);
    setNames(next);
  }, []);

  const activeName = selectable ? hovered || selected : null;
  const label = activeName ? humanizeStructureName(activeName) : null;
  const groupCounts = selectable
    ? definition.groups
        .map((g) => ({ group: g, count: (groups[g.id] ?? []).length }))
        .filter((x) => x.count > 0)
    : [];

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
          {selectable && (
            <>
              <IconButton label="Zoom in" onClick={() => setZoomCommand({ direction: 'in', token: performance.now() })}>
                <Maximize2 className="h-3.5 w-3.5" />
              </IconButton>
              <IconButton label="Zoom out" onClick={() => setZoomCommand({ direction: 'out', token: performance.now() })}>
                <Minimize2 className="h-3.5 w-3.5" />
              </IconButton>
              <IconButton label="Reset camera" onClick={() => setResetToken((t) => t + 1)}>
                <RotateCcw className="h-3.5 w-3.5" />
              </IconButton>
            </>
          )}
          {onToggleExpanded && (
            <IconButton label={expanded ? 'Collapse viewer' : 'Expand viewer'} onClick={onToggleExpanded}>
              <Crosshair className="h-3.5 w-3.5" />
            </IconButton>
          )}
        </div>
      </div>

      {/* 3D viewport */}
      <div className={`relative min-h-[300px] flex-1 bg-gradient-to-b from-slate-50 to-white ${selectable ? '' : 'pointer-events-none'}`}>
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
              gl={{
                antialias: true,
                alpha: true,
                powerPreference: 'high-performance',
                // Filmic tone mapping keeps the specular highlights of wet
                // tissue from clipping to white at this light intensity.
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.0,
              }}
            >
              <StudioEnvironment intensity={0.55} />
              <ambientLight intensity={0.55} />
              <hemisphereLight intensity={0.35} groundColor="#e2e8f0" color="#ffffff" />
              <directionalLight position={[4, 6, 5]} intensity={1.35} />
              <directionalLight position={[-5, -2, -4]} intensity={0.45} color="#93c5fd" />
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
                  selectable={selectable}
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

      {/* Structure panel — only rendered for models that actually carry named
          sub-structures. A fused single-surface model has nothing to list, so
          it gets a plain factual note instead of an empty or invented list. */}
      {selectable ? (
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
              {structureList.length > 0 ? (
                <ul className="flex flex-wrap gap-1">
                  {structureList.map((raw) => {
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
                  <Eye className="h-3 w-3" /> No structures loaded.
                </p>
              )}
            </div>
          </>
        )}
      </div>
      ) : (
        <div className="relative z-20 border-t border-slate-100 px-3 py-2.5">
          <div className="flex items-start gap-2">
            <Layers className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
            <p className="text-[10px] leading-relaxed text-slate-500">
              Photoreal single-surface model · the file contains no separately named anatomical
              parts, so nothing is labelled or isolated here.
            </p>
          </div>
        </div>
      )}
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
