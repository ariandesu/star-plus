import type { OrganSystemKey } from './organHealthService';

/**
 * Anatomy catalog for the 3D organ visualizer.
 *
 * Model sources (all CC BY 4.0, see public/ATTRIBUTION.md):
 *  - Heart / Lung / Spinal cord: Human Reference Atlas (HuBMAP) reference organs
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
  /** Id of the group focused when the system is first opened. */
  defaultGroup: string;
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
    file: 'VH_M_Heart.glb',
    modelName: '3D Reference Organ — Heart (male)',
    source: 'Human Reference Atlas',
    organLabel: 'Heart',
    accent: '#dc2626',
    orientation: [0, 0, 0],
    defaultGroup: 'chambers',
    groups: [
      {
        id: 'chambers',
        label: 'Cardiac Chambers',
        match: ['cardiac_chamber', 'cardiac_atrium', 'cardiac_ventricle', 'ventricle'],
        exclude: ['papillary', 'septum'],
        description:
          'The four chambers. The atria receive venous return and the ventricles generate the pressure that drives pulmonary and systemic circulation.',
      },
      {
        id: 'septum',
        label: 'Interventricular Septum',
        match: ['interventricular_septum', 'septum'],
        exclude: ['papillary'],
        description:
          'The muscular and membranous wall separating the ventricles. Septal motion is a direct readout of ventricular contractile synchrony.',
      },
      {
        id: 'valves',
        label: 'Cardiac Valves',
        match: ['valve'],
        exclude: ['papillary'],
        description:
          'Mitral, tricuspid, aortic and pulmonary valves. Competence of these leaflets determines the direction of flow through the heart.',
      },
      {
        id: 'papillary',
        label: 'Papillary Muscles',
        match: ['papillary'],
        description:
          'Muscles anchored to the ventricular wall that tension the chordae tendineae and prevent atrioventricular valve prolapse during systole.',
      },
      {
        id: 'other',
        label: 'Other Structures',
        isCatchAll: true,
        match: [],
        description:
          'Remaining structures in this model that are not part of the primary cardiac groups.',
      },
    ],
  },

  RESPIRATORY: {
    system: 'RESPIRATORY',
    file: 'VH_M_Lung.glb',
    modelName: '3D Reference Organ — Lungs (male)',
    source: 'Human Reference Atlas',
    organLabel: 'Lungs',
    accent: '#0284c7',
    orientation: [0, 0, 0],
    defaultGroup: 'lobes',
    groups: [
      {
        id: 'lobes',
        label: 'Lung Lobes',
        match: ['lobe', 'lungs_l', 'lungs_r', 'hilum'],
        exclude: ['bronch'],
        description:
          'Three lobes on the right and two on the left. Lobes are the gross anatomical divisions mapped to regional ventilation.',
      },
      {
        id: 'segments',
        label: 'Bronchopulmonary Segments',
        match: ['bronchopulmonary_segment'],
        description:
          'The functionally independent segments supplied by their own tertiary bronchus. These are the units used for regional lung analysis.',
      },
      {
        id: 'airway',
        label: 'Trachea & Bronchial Tree',
        match: ['trachea', 'bronch', 'carina'],
        exclude: ['bronchopulmonary'],
        description:
          'Conducting airways from the trachea through the main and lobar bronchi to the tertiary bronchi. This is the anatomical dead space.',
      },
      {
        id: 'cartilage',
        label: 'Supporting Cartilage',
        match: ['cartilage'],
        description:
          'Tracheal, bronchial, thyroid and arytenoid cartilages that hold the conducting airways patent against pressure changes.',
      },
      {
        id: 'other',
        label: 'Other Structures',
        isCatchAll: true,
        match: [],
        description:
          'Remaining structures in this model that are not part of the primary respiratory groups.',
      },
    ],
  },

  COGNITIVE: {
    system: 'COGNITIVE',
    file: 'Allen_M_Brain.glb',
    modelName: '3D Reference Organ — Brain (Allen Human Brain Atlas)',
    source: 'Allen Institute / HRA',
    organLabel: 'Brain',
    accent: '#7c3aed',
    orientation: [0, 0, 0],
    defaultGroup: 'cortex',
    groups: [
      {
        id: 'cortex',
        label: 'Cerebral Cortex',
        match: ['gyrus', 'cortex', 'lobule', 'pole', 'operculum', 'planum'],
        exclude: ['cingulate', 'hippocamp', 'parahippocamp'],
        description:
          'The cortical ribbon. Cortical activity underlies the vigilance and reaction-time measures tracked for this system.',
      },
      {
        id: 'limbic',
        label: 'Limbic System',
        match: [
          'hippocamp',
          'amygdal',
          'cingulate',
          'fornix',
          'septal',
          'parahippocamp',
          'olfactory',
          'piriform',
          'basal_forebrain',
          'stria_terminalis',
          // Amygdaloid complex nuclei, which carry bare anatomical names.
          'central_nuclear_group',
          'basolateral_nucleus',
          'basomedial_nucleus',
          'lateral_nucleus',
          'cortical_nucleus',
          'medial_nucleus',
        ],
        description:
          'Hippocampus, amygdala, olfactory and cingulate structures. The limbic system is central to memory consolidation, smell and stress response.',
      },
      {
        id: 'deep',
        label: 'Deep Grey Matter',
        match: ['putamen', 'caudate', 'globus_pallidus', 'accumbens', 'claustrum', 'subthalamic'],
        description:
          'Basal ganglia and related nuclei that gate voluntary movement and habit formation.',
      },
      {
        id: 'thalamus',
        label: 'Thalamus & Relays',
        match: ['thalamus', 'geniculate', 'habenular', 'pulvinar'],
        description:
          'Sensory and motor relay nuclei routing information between subcortical structures and the cortex.',
      },
      {
        id: 'hindbrain',
        label: 'Cerebellum & Brainstem',
        match: ['cerebell', 'pons', 'medulla', 'midbrain', 'colliculus', 'tegmentum', 'vermis', 'olive'],
        description:
          'Cerebellum, pons and medulla. These govern balance, coordination, arousal and autonomic control.',
      },
      {
        id: 'ventricles',
        label: 'Ventricular System',
        match: ['ventricle', 'aqueduct', 'central_canal', 'chiasm'],
        description:
          'Cerebrospinal fluid spaces. Ventricular volume is a sensitive marker of intracranial fluid shifts in microgravity.',
      },
      {
        id: 'endocrine',
        label: 'Circadian Endocrine Structures',
        match: ['pineal', 'hypothalam', 'pituitary', 'hth'],
        description:
          'Pineal body and hypothalamic regions. The pineal secretes melatonin and is the anatomical basis of the circadian signal.',
      },
      {
        id: 'other',
        label: 'Other Structures',
        isCatchAll: true,
        match: [],
        description:
          'Remaining structures in this model that are not part of the primary neuroendocrine groups.',
      },
    ],
  },

  MUSCULOSKELETAL: {
    system: 'MUSCULOSKELETAL',
    file: 'Skeleton.glb',
    modelName: '3D Reference Organ — Skeleton (BodyParts3D 4.0)',
    source: 'BodyParts3D / DBCLS',
    organLabel: 'Skeleton',
    accent: '#57534e',
    orientation: [0, 0, 0],
    defaultGroup: 'spine',
    groups: [
      {
        id: 'spine',
        label: 'Vertebral Column',
        match: [
          'vertebra',
          'vertebral',
          'intervertebral',
          'atlas',
          'axis',
          'sacrum',
          'coccyx',
        ],
        description:
          'Cervical, thoracic, lumbar, sacral and coccygeal spine with the intervertebral discs. The column is the primary load path and the site where skeletal unloading is measured.',
      },
      {
        id: 'thorax',
        label: 'Thoracic Cage',
        match: ['rib', 'sternum', 'manubrium', 'xiphoid', 'costal cartilage'],
        description:
          'Ribs, sternum and costal cartilages. The cage protects the heart and lungs and moves with every breath.',
      },
      {
        id: 'skull',
        label: 'Skull & Facial Bones',
        match: [
          'ethmoid',
          'frontal bone',
          'parietal',
          'temporal bone',
          'occipital',
          'sphenoid',
          'vomer',
          'maxilla',
          'zygomatic',
          'nasal bone',
          'palatine bone',
          'mandible',
          'hyoid',
          'cricoid',
          'arytenoid cartilage',
          'corniculate',
          'cuneiform cartilage',
          'thyroid cartilage',
          'alar cartilage',
        ],
        description:
          'Cranial vault, facial skeleton, mandible and the laryngeal cartilages that support the airway and voice.',
      },
      {
        id: 'upper',
        label: 'Upper Limb',
        match: [
          'humerus',
          'radius',
          'ulna',
          'scapula',
          'clavicle',
          'metacarpal',
          'scaphoid',
          'lunate',
          'triquetral',
          'pisiform',
          'trapezium',
          'trapezoid',
          'capitate',
          'hamate',
          'finger',
          'thumb',
        ],
        description:
          'Shoulder girdle, arm, forearm, wrist and hand. These are the limbs worked hardest by resistive exercise in orbit.',
      },
      {
        id: 'lower',
        label: 'Lower Limb & Pelvis',
        match: [
          'femur',
          'tibia',
          'fibula',
          'patella',
          'hip bone',
          'pelvis',
          'metatarsal',
          'talus',
          'calcaneus',
          'navicular',
          'cuboid',
          'cuneiform bone',
          'sesamoid',
          'toe',
        ],
        description:
          'Pelvis, thigh, knee, ankle and foot. The femur and tibia carry the highest axial loads in the countermeasure schedule.',
      },
      {
        id: 'other',
        label: 'Other Structures',
        isCatchAll: true,
        match: [],
        description:
          'Remaining structures in this model that are not part of the primary skeletal groups.',
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
  CARDIOVASCULAR: 'VH_M_heart',
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
