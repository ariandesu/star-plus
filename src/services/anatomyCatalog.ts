import type { OrganSystemKey } from './organHealthService';

/**
 * Anatomy catalog for the 3D organ visualizer.
 *
 * Model sources (all CC BY 4.0, see public/ATTRIBUTION.md):
 *  - Heart: "Realistic Human Heart" by neshallads (Sketchfab). A single fused
 *    photoreal surface with authored PBR texture maps and no named
 *    sub-structures, so it is shown as one whole organ (`partitioned: false`)
 *    rather than being split into invented chambers.
 *  - Lung / Spinal cord: Human Reference Atlas (HuBMAP) reference organs
 *    v1.2, male (VH_M_*). https://humanatlas.io
 *  - Brain: Allen Human Brain Reference Atlas (Allen_M_Brain).
 *
 * Structure groups map runtime node names (which carry a source prefix such as
 * `VH_M_` or `Allen_`) onto friendly clinical labels. Matching is done with
 * plain substring rules against the lower-cased node name so that later
 * re-exports of the source models keep working.
 */

export interface StructureGroup {
  id: string;
  label: string;
  /** Case-insensitive substrings; a node matching ANY pattern joins the group. */
  match: string[];
  /** Structures that must NOT join even if another pattern matches. */
  exclude?: string[];
  /**
   * Collects every structure not claimed by an earlier group. Only the last
   * group of a system should set this. Needed because groups are matched by
   * substring, so the catch-all must not rely on a pattern at all.
   */
  isCatchAll?: boolean;
  /** Longer description shown when the group is focused. */
  description: string;
}

export interface OrganDefinition {
  system: OrganSystemKey;
  /** File under /models/organs/. */
  file: string;
  /** Human-readable model name shown in the attribution line. */
  modelName: string;
  /** Source organisation for attribution. */
  source: string;
  /** Display name of the whole organ. */
  organLabel: string;
  /** Accent colour (hex) used for the selected structure highlight. */
  accent: string;
  /**
   * Optional rotation applied to the model so it presents anatomically
   * upright in the default camera. [x, y, z] in radians.
   */
  orientation: [number, number, number];
  /** Groups presented in the structure list, in display order. */
  groups: StructureGroup[];
  /**
   * Id of the group focused when the system is first opened.
   *
   * Only meaningful for partitioned models; unpartitioned ones have a single
   * whole-organ group.
   */
  defaultGroup: string;
  /**
   * Whether the glTF ships individually named anatomical sub-structures.
   *
   * Some models are a single fused surface with no node-level anatomy (the
   * photoreal heart scan). There is nothing to select, label or isolate in
   * those, and inventing a chamber/valve breakdown for them would present
   * anatomy the file does not actually contain — so the viewer drops the
   * structure panel and the click-to-isolate interaction instead, and shows
   * the organ as one whole-organ view.
   */
  partitioned: boolean;
}

/** Prefixes stripped from raw node names before display. */
const SOURCE_PREFIXES = ['VH_M_', 'VH_F_', 'Allen_', 'VH_'];

/** BodyParts3D nodes are named `FJ<id> <Name>`, e.g. `FJ3237 Left clavicle`. */
const BP3D_ID_RE = /^FJ\d+[A-Z]?\s+/;

/** Turn a raw source node name into a readable label. */
export function humanizeStructureName(rawName: string): string {
  let name = rawName.trim();
  name = name.replace(BP3D_ID_RE, '');
  for (const prefix of SOURCE_PREFIXES) {
    if (name.startsWith(prefix)) {
      name = name.slice(prefix.length);
      break;
    }
  }
  // Drop the trailing _L / _R side marker into a readable suffix.
  let side = '';
  const sideMatch = name.match(/_([LR])$/);
  if (sideMatch) {
    side = sideMatch[1] === 'L' ? ' (left)' : ' (right)';
    name = name.slice(0, -2);
  }
  name = name
    .replace(/_HTH/g, ' (hypothalamus)')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  // Title-case while preserving known acronyms and short tokens.
  const KEEP_UPPER = new Set(['of', 'the', 'and', 'in', 'to']);
  const words = name.split(' ').map((w, i) => {
    const lower = w.toLowerCase();
    if (i > 0 && KEEP_UPPER.has(lower)) return lower;
    // Preserve tokens that are already all-caps abbreviations (e.g. C1, DNA).
    if (/^[A-Z0-9]{1,3}$/.test(w)) return w;
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  });
  return words.join(' ') + side;
}

export const ORGAN_DEFINITIONS: Record<OrganSystemKey, OrganDefinition> = {
  CARDIOVASCULAR: {
    system: 'CARDIOVASCULAR',
    file: 'realistic_human_heart.glb',
    modelName: 'Realistic Human Heart',
    source: 'neshallads (Sketchfab)',
    organLabel: 'Heart',
    accent: '#dc2626',
    orientation: [0, 0, 0],
    defaultGroup: 'whole',
    partitioned: false,
    groups: [
      {
        id: 'whole',
        label: 'Whole Heart',
        isCatchAll: true,
        match: [],
        description:
          'This heart is a single fused photoreal surface, not a set of separate chamber, valve and septum meshes. It is therefore presented as one whole organ and nothing is labelled or isolated on it — the file genuinely contains no sub-structure geometry to point at, and naming fragments of one welded surface would state anatomy the model does not have.',
      },
    ],
  },

  RESPIRATORY: {
    system: 'RESPIRATORY',
    file: 'realistic_human_lungs.glb',
    modelName: 'Realistic Human Lungs',
    source: 'neshallads (Sketchfab)',
    organLabel: 'Lungs',
    accent: '#0284c7',
    orientation: [0, 0, 0],
    defaultGroup: 'whole',
    partitioned: false,
    groups: [
      {
        id: 'whole',
        label: 'Whole Lungs',
        isCatchAll: true,
        match: [],
        description:
          'This model is a fused photoreal surface displaying the left and right lung anatomy with authored PBR textures.',
      },
    ],
  },

  COGNITIVE: {
    system: 'COGNITIVE',
    file: 'realistic_human_brain.glb',
    modelName: 'Realistic Human Brain',
    source: '3DRT STUDIOS (Sketchfab)',
    organLabel: 'Brain',
    accent: '#7c3aed',
    orientation: [0, 0, 0],
    defaultGroup: 'whole',
    partitioned: false,
    groups: [
      {
        id: 'whole',
        label: 'Whole Brain',
        isCatchAll: true,
        match: [],
        description:
          'This model is a fused photoreal cerebrum and cerebellum surface with authored PBR textures.',
      },
    ],
  },

  MUSCULOSKELETAL: {
    system: 'MUSCULOSKELETAL',
    file: 'realistic_human_skeleton.glb',
    modelName: 'Realistic Human Skeleton',
    source: 'Wunna Ko Ko (Sketchfab)',
    organLabel: 'Skeleton',
    accent: '#57534e',
    orientation: [0, 0, 0],
    defaultGroup: 'whole',
    partitioned: false,
    groups: [
      {
        id: 'whole',
        label: 'Whole Skeleton',
        isCatchAll: true,
        match: [],
        description:
          'This model is a full anatomical human skeleton with authored PBR bone textures.',
      },
    ],
  },

  SLEEP: {
    system: 'SLEEP',
    file: 'Endocrine.glb',
    modelName: '3D Reference Organ — Endocrine Structures (BodyParts3D 4.0)',
    source: 'BodyParts3D / DBCLS',
    organLabel: 'Endocrine System',
    accent: '#4f46e5',
    orientation: [0, 0, 0],
    defaultGroup: 'circadian',
    partitioned: true,
    groups: [
      {
        id: 'circadian',
        label: 'Circadian Regulators',
        match: ['pineal', 'hypothalam', 'pituitary'],
        description:
          'Pineal body, hypothalamus and pituitary. These drive the melatonin rhythm that the sleep metrics are modelled on.',
      },
      {
        id: 'stress',
        label: 'Stress-Axis Glands',
        match: ['adrenal', 'thyroid', 'parathyroid'],
        description:
          'Adrenal and thyroid glands. Cortisol and thyroid hormone set the metabolic and stress-response baseline.',
      },
      {
        id: 'metabolic',
        label: 'Metabolic & Reproductive Glands',
        match: ['pancrea', 'gonad', 'thymus', 'testis', 'testicle', 'ovary'],
        description:
          'Pancreatic tissue, thymus and gonadal glands involved in glucose handling, immune maturation and long-duration endocrine adaptation.',
      },
      {
        id: 'other',
        label: 'Other Structures',
        isCatchAll: true,
        match: [],
        description:
          'Remaining structures in this model that are not part of the primary endocrine groups.',
      },
    ],
  },
};

/**
 * Partition every structure node into exactly one group.
 *
 * Groups are evaluated in order and the FIRST matching group wins, so a
 * trailing catch-all group (`match: ['.']`) reliably collects only the
 * structures no earlier group claimed. Every visible structure therefore
 * belongs to exactly one group and none can be left unreachable in the UI.
 */
export function partitionStructures(
  definition: OrganDefinition,
  nodeNames: string[]
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const g of definition.groups) out[g.id] = [];
  for (const name of nodeNames) {
    const group = definition.groups.find((g) => matchesGroup(g, name));
    if (group) out[group.id].push(name);
  }
  return out;
}

/**
 * Pick the structure node names belonging to a group, using the group's
 * substring rules. Returns raw node names in source order.
 */
export function resolveGroupStructures(
  definition: OrganDefinition,
  groupId: string,
  nodeNames: string[]
): string[] {
  return partitionStructures(definition, nodeNames)[groupId] ?? [];
}

export function matchesGroup(group: StructureGroup, rawNodeName: string): boolean {
  if (group.isCatchAll) return true;
  const haystack = rawNodeName.toLowerCase();
  if (group.exclude?.some((e) => haystack.includes(e.toLowerCase()))) return false;
  return group.match.some((m) => haystack.includes(m.toLowerCase()));
}

/**
 * The anatomical "hero" part for each system: the single structure that best
 * represents the organ on first paint, used for the initial isolation state
 * and the camera framing fallback.
 */
export const HERO_STRUCTURE: Record<OrganSystemKey, string | null> = {
  CARDIOVASCULAR: null,
  RESPIRATORY: 'VH_M_lungs',
  COGNITIVE: 'Allen_brain',
  MUSCULOSKELETAL: null,
  SLEEP: 'FJ1795 Pineal body',
};

export const ALL_SYSTEM_KEYS: OrganSystemKey[] = [
  'CARDIOVASCULAR',
  'RESPIRATORY',
  'COGNITIVE',
  'MUSCULOSKELETAL',
  'SLEEP',
];
