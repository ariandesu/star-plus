import * as THREE from 'three';

export type SystemId = 
  | 'skeletal'
  | 'muscular'
  | 'arterial'
  | 'venous'
  | 'nervous'
  | 'digestive'
  | 'respiratory'
  | 'urinary'
  | 'reproductive'
  | 'lymphatic'
  | 'endocrine'
  | 'integumentary'
  | 'connective'
  | 'sensory'
  | 'cardiac';

export interface Part {
  id: string;
  name: string;
  conceptId: string;
  system: SystemId;
  chunk: number;
  positions: number;
  normals: number;
  indices: number;
  vertexCount: number;
  indexCount: number;
  bounds: [number[], number[]];
}

export interface ChunkInfo {
  url: string;
  bytes: number;
  gzip?: string;
  gzipBytes?: number;
}

export interface AtlasManifest {
  version: string;
  parts: Part[];
  chunks: ChunkInfo[];
  triangles: number;
}

// System map for STAR PLUS dashboard categories
export const STAR_PLUS_SYSTEM_MAPPING: Record<string, { systems: SystemId[]; targetChunks: number[]; color: string }> = {
  CARDIOVASCULAR: {
    systems: ['cardiac', 'arterial', 'venous'],
    targetChunks: [5, 6, 7, 8],
    color: '#dc2626'
  },
  RESPIRATORY: {
    systems: ['respiratory', 'arterial', 'venous'],
    targetChunks: [7, 8, 9, 10],
    color: '#0284c7'
  },
  NEUROLOGICAL: {
    systems: ['nervous', 'sensory', 'endocrine'],
    targetChunks: [0, 5, 6],
    color: '#d97706'
  },
  MUSCULOSKELETAL: {
    systems: ['skeletal', 'muscular', 'connective'],
    targetChunks: [0, 1, 4, 8, 9, 10],
    color: '#e2d9ba'
  },
  CIRCADIAN: {
    systems: ['endocrine', 'nervous', 'sensory'],
    targetChunks: [5, 6, 11],
    color: '#7c3aed'
  }
};

class AtlasLoaderService {
  private manifest: AtlasManifest | null = null;
  private chunkCache = new Map<number, ArrayBuffer>();
  private manifestPromise: Promise<AtlasManifest> | null = null;

  async getManifest(): Promise<AtlasManifest> {
    if (this.manifest) return this.manifest;
    if (this.manifestPromise) return this.manifestPromise;

    this.manifestPromise = (async () => {
      try {
        const response = await fetch('/models/atlas.json');
        if (!response.ok) throw new Error(`Failed to load atlas manifest: ${response.statusText}`);
        this.manifest = await response.json();
        return this.manifest!;
      } catch (err) {
        this.manifestPromise = null;
        throw err;
      }
    })();

    return this.manifestPromise;
  }

  async loadChunk(chunkIndex: number, onProgress?: (percent: number) => void): Promise<ArrayBuffer> {
    if (this.chunkCache.has(chunkIndex)) {
      return this.chunkCache.get(chunkIndex)!;
    }

    const manifest = await this.getManifest();
    const chunkInfo = manifest.chunks[chunkIndex];
    if (!chunkInfo) throw new Error(`Chunk ${chunkIndex} not found in manifest`);

    const url = chunkInfo.gzip ? `/models/body-${chunkIndex}.bin.gz` : `/models/body-${chunkIndex}.bin`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch chunk ${chunkIndex}`);

    const payload = await response.arrayBuffer();
    const signature = new Uint8Array(payload, 0, Math.min(2, payload.byteLength));
    const isGzip = signature[0] === 0x1f && signature[1] === 0x8b;

    let buffer: ArrayBuffer;
    if (isGzip) {
      if (typeof DecompressionStream !== 'undefined') {
        const ds = new DecompressionStream('gzip');
        const responseStream = new Response(new Blob([payload]).stream().pipeThrough(ds));
        buffer = await responseStream.arrayBuffer();
      } else {
        throw new Error(`Chunk ${chunkIndex} is gzipped, but DecompressionStream is not supported in this environment.`);
      }
    } else {
      buffer = payload;
    }

    this.chunkCache.set(chunkIndex, buffer);
    return buffer;
  }

  async buildSystemMeshes(
    categoryKey: string,
    onProgress?: (status: string, percent: number) => void
  ): Promise<{
    group: THREE.Group;
    parts: { mesh: THREE.Mesh; part: Part }[];
    bounds: THREE.Box3;
    center: THREE.Vector3;
    radius: number;
  }> {
    const manifest = await this.getManifest();
    const config = STAR_PLUS_SYSTEM_MAPPING[categoryKey] || STAR_PLUS_SYSTEM_MAPPING['CARDIOVASCULAR'];

    onProgress?.('Fetching BodyParts3D anatomical manifest...', 10);

    let matchingParts = manifest.parts.filter(p => config.systems.includes(p.system));

    if (categoryKey === 'CARDIOVASCULAR') {
      const heartSpecific = manifest.parts.filter(p => 
        p.system === 'cardiac' || 
        p.name.toLowerCase().includes('heart') ||
        p.name.toLowerCase().includes('aorta') ||
        p.name.toLowerCase().includes('ventricle') ||
        p.name.toLowerCase().includes('atrium') ||
        p.name.toLowerCase().includes('coronary') ||
        p.name.toLowerCase().includes('pulmonary trunk') ||
        p.name.toLowerCase().includes('mitral') ||
        p.name.toLowerCase().includes('tricuspid') ||
        p.name.toLowerCase().includes('myocardium') ||
        p.name.toLowerCase().includes('vena cava')
      );
      if (heartSpecific.length > 0) {
        matchingParts = heartSpecific;
      }
    } else if (categoryKey === 'RESPIRATORY') {
      const respSpecific = manifest.parts.filter(p =>
        p.system === 'respiratory' ||
        p.name.toLowerCase().includes('lung') ||
        p.name.toLowerCase().includes('bronch') ||
        p.name.toLowerCase().includes('trachea') ||
        p.name.toLowerCase().includes('pleura')
      );
      if (respSpecific.length > 0) {
        matchingParts = respSpecific;
      }
    } else if (categoryKey === 'NEUROLOGICAL') {
      const brainSpecific = manifest.parts.filter(p =>
        p.system === 'nervous' ||
        p.name.toLowerCase().includes('brain') ||
        p.name.toLowerCase().includes('cerebr') ||
        p.name.toLowerCase().includes('cerebell') ||
        p.name.toLowerCase().includes('cortex') ||
        p.name.toLowerCase().includes('thalamus') ||
        p.name.toLowerCase().includes('hypothalamus') ||
        p.name.toLowerCase().includes('pons') ||
        p.name.toLowerCase().includes('medulla')
      );
      if (brainSpecific.length > 0) {
        matchingParts = brainSpecific;
      }
    }

    const requiredChunks = Array.from(new Set(matchingParts.map(p => p.chunk)));
    
    onProgress?.(`Loading BodyParts3D binary geometry (${requiredChunks.length} chunks)...`, 30);

    const chunkBuffers = new Map<number, ArrayBuffer>();
    for (let i = 0; i < requiredChunks.length; i++) {
      const chunkIdx = requiredChunks[i];
      const buf = await this.loadChunk(chunkIdx);
      chunkBuffers.set(chunkIdx, buf);
      onProgress?.(`Decoded chunk ${chunkIdx}`, 30 + Math.round(((i + 1) / requiredChunks.length) * 50));
    }

    onProgress?.('Assembling anatomical 3D meshes...', 85);

    const group = new THREE.Group();
    group.name = `AnatomyGroup_${categoryKey}`;

    const partMeshes: { mesh: THREE.Mesh; part: Part }[] = [];
    const overallBounds = new THREE.Box3();

    const materials: Record<string, THREE.MeshStandardMaterial> = {
      cardiac: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#dc2626'),
        roughness: 0.4,
        metalness: 0.1,
        side: THREE.DoubleSide
      }),
      arterial: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#ef4444'),
        roughness: 0.45,
        metalness: 0.1,
        side: THREE.DoubleSide
      }),
      venous: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#2563eb'),
        roughness: 0.45,
        metalness: 0.1,
        side: THREE.DoubleSide
      }),
      respiratory: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#38bdf8'),
        roughness: 0.5,
        metalness: 0.05,
        transparent: true,
        opacity: 0.88,
        side: THREE.DoubleSide
      }),
      nervous: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#f59e0b'),
        roughness: 0.4,
        metalness: 0.15,
        side: THREE.DoubleSide
      }),
      skeletal: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#e2d9ba'),
        roughness: 0.6,
        metalness: 0.05,
        side: THREE.DoubleSide
      }),
      muscular: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#b91c1c'),
        roughness: 0.5,
        metalness: 0.05,
        side: THREE.DoubleSide
      }),
      endocrine: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#a855f7'),
        roughness: 0.4,
        metalness: 0.1,
        side: THREE.DoubleSide
      }),
      default: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#64748b'),
        roughness: 0.5,
        metalness: 0.1,
        side: THREE.DoubleSide
      })
    };

    matchingParts.forEach((part) => {
      const buffer = chunkBuffers.get(part.chunk);
      if (!buffer) return;

      const geometry = new THREE.BufferGeometry();
      
      const posSlice = buffer.slice(part.positions, part.positions + part.vertexCount * 3 * 4);
      const posAttr = new THREE.BufferAttribute(new Float32Array(posSlice), 3);
      geometry.setAttribute('position', posAttr);

      const normSlice = buffer.slice(part.normals, part.normals + part.vertexCount * 3 * 2);
      const normAttr = new THREE.BufferAttribute(new Int16Array(normSlice), 3, true);
      geometry.setAttribute('normal', normAttr);

      const indexSlice = buffer.slice(part.indices, part.indices + part.indexCount * 4);
      const indexAttr = new THREE.BufferAttribute(new Uint32Array(indexSlice), 1);
      geometry.setIndex(indexAttr);

      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();

      const mat = materials[part.system] || materials.default;
      const mesh = new THREE.Mesh(geometry, mat);
      mesh.name = part.name;
      mesh.userData = { partId: part.id, conceptId: part.conceptId, system: part.system, name: part.name };

      group.add(mesh);
      partMeshes.push({ mesh, part });

      const partBox = new THREE.Box3(
        new THREE.Vector3().fromArray(part.bounds[0]),
        new THREE.Vector3().fromArray(part.bounds[1])
      );
      overallBounds.union(partBox);
    });

    const center = new THREE.Vector3();
    overallBounds.getCenter(center);

    const sphere = new THREE.Sphere();
    overallBounds.getBoundingSphere(sphere);
    const radius = sphere.radius || 0.1;

    group.position.set(-center.x, -center.y, -center.z);

    onProgress?.('Complete', 100);

    return {
      group,
      parts: partMeshes,
      bounds: overallBounds,
      center,
      radius
    };
  }
}

export const atlasLoaderService = new AtlasLoaderService();
