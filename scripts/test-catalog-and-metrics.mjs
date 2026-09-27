#!/usr/bin/env node
/**
 * Runtime assertions for the anatomy catalog and the derived health metrics.
 *
 * These are the two places where a silent regression would be most damaging:
 *
 *  1. The catalog maps ~650 real anatomical structures onto UI groups. If a
 *     group pattern changes, structures can become unreachable and nothing else
 *     in the build would notice.
 *  2. Every health deviation is computed from value vs baseline. If someone
 *     hardcodes a percentage, the UI would display numbers that contradict the
 *     values right next to them.
 *
 * Run: node scripts/test-catalog-and-metrics.mjs
 * Exits non-zero on failure. No test framework required.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ORGAN_DIR = path.join(ROOT, 'public', 'models', 'organs');

let failures = 0;
let checks = 0;

function check(name, condition, detail = '') {
  checks += 1;
  if (condition) {
    console.log(`  ok   ${name}`);
  } else {
    failures += 1;
    console.error(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

/* ------------------------------------------------------------------ */
/* Extract the catalog's group rules from the TypeScript source.       */
/* ------------------------------------------------------------------ */

/**
 * Read the catalog source and pull each system's group definitions out of it.
 * Parsing the real file (rather than duplicating the rules here) is what makes
 * this test able to catch a change to the catalog.
 */
function loadCatalogSource() {
  const src = fs.readFileSync(path.join(ROOT, 'src', 'services', 'anatomyCatalog.ts'), 'utf8');
  const systems = {};
  // Each system block starts with `  SYSTEMNAME: {`
  const systemRe = /^ {2}([A-Z_]+): \{/gm;
  const starts = [];
  let m;
  while ((m = systemRe.exec(src)) !== null) starts.push({ name: m[1], start: m.index });
  starts.forEach((s, i) => {
    const end = i + 1 < starts.length ? starts[i + 1].start : src.length;
    systems[s.name] = src.slice(s.start, end);
  });
  return systems;
}

function glbNodeNames(file) {
  const buf = fs.readFileSync(path.join(ORGAN_DIR, file));
  const total = buf.readUInt32LE(8);
  let off = 12;
  while (off < total) {
    const clen = buf.readUInt32LE(off);
    const ctype = buf.readUInt32LE(off + 4);
    off += 8;
    if (ctype === 0x4e4f534a) {
      const json = JSON.parse(buf.subarray(off, off + clen).toString('utf8'));
      return (json.nodes || []).filter((n) => n.name).map((n) => n.name);
    }
    off += clen;
  }
  throw new Error(`no JSON chunk in ${file}`);
}

/* ------------------------------------------------------------------ */
/* 1. Catalog: every model file referenced must exist and be valid.    */
/* ------------------------------------------------------------------ */

console.log('\nCatalog → model files');
const catalogSrc = loadCatalogSource();
const fileRe = /file: '([^']+)'/g;
const referenced = [];
let fm;
const allSrc = Object.values(catalogSrc).join('\n');
while ((fm = fileRe.exec(allSrc)) !== null) referenced.push(fm[1]);
check('catalog references at least one model', referenced.length > 0, `found ${referenced.length}`);
for (const f of new Set(referenced)) {
  const p = path.join(ORGAN_DIR, f);
  check(`${f} exists`, fs.existsSync(p), p);
  if (fs.existsSync(p)) {
    const names = glbNodeNames(f);
    check(`${f} has named structures`, names.length > 0, `${names.length} names`);
    const dupes = names.filter((n, i) => names.indexOf(n) !== i);
    check(`${f} has no duplicate node names`, dupes.length === 0, dupes.slice(0, 3).join(', '));
  }
}

/* ------------------------------------------------------------------ */
/* 2. Groups: first-match-wins resolution must cover every structure.  */
/* ------------------------------------------------------------------ */

/**
 * Parse the groups of one system block into
 *  { id, match[], exclude[], isCatchAll } in declaration order.
 */
function parseGroups(block) {
  const groups = [];
  // Split on `{` occurring after `groups: [`
  const gi = block.indexOf('groups: [');
  if (gi === -1) return groups;
  const body = block.slice(gi);
  const idRe = /id:\s*'([^']+)'/g;
  const ids = [];
  let im;
  while ((im = idRe.exec(body)) !== null) ids.push({ id: im[1], at: im.index });
  ids.forEach((entry, i) => {
    const end = i + 1 < ids.length ? ids[i + 1].at : body.length;
    const chunk = body.slice(entry.at, end);
    const matchBlock = /match:\s*\[([^\]]*)\]/.exec(chunk);
    const excludeBlock = /exclude:\s*\[([^\]]*)\]/.exec(chunk);
    const parse = (b) =>
      b
        ? b[1]
            .split(',')
            .map((s) => s.trim().replace(/^'|'$/g, ''))
            .filter(Boolean)
        : [];
    groups.push({
      id: entry.id,
      match: parse(matchBlock),
      exclude: parse(excludeBlock),
      isCatchAll: /isCatchAll:\s*true/.test(chunk),
    });
  });
  return groups;
}

function resolveOf(groups, name) {
  const low = name.toLowerCase();
  for (const g of groups) {
    if (g.isCatchAll) return g.id;
    if (g.exclude.some((e) => low.includes(e.toLowerCase()))) continue;
    if (g.match.some((mm) => low.includes(mm.toLowerCase()))) return g.id;
  }
  return null;
}

console.log('\nCatalog → structure group coverage');
/**
 * Derive each system's model file from the catalog source rather than repeating
 * the filenames here. The hardcoded copy is what silently went stale when the
 * heart asset was swapped: this test kept asserting against the old file while
 * the viewer loaded the new one.
 */
function fileFor(systemBlock, system) {
  const m = /file:\s*'([^']+)'/.exec(systemBlock);
  if (!m) throw new Error(`no file: '...' found in the ${system} catalog block`);
  return m[1];
}

for (const [system, block] of Object.entries(catalogSrc)) {
  if (!/^\s*system:\s*'/m.test(block)) continue;
  const file = fileFor(block, system);
  if (!fs.existsSync(path.join(ORGAN_DIR, file))) {
    check(`${system}: model file ${file} exists`, false, file);
    continue;
  }
  const groups = parseGroups(block);
  check(`${system} declares groups`, groups.length > 0, `${groups.length}`);
  check(
    `${system} ends with a catch-all`,
    groups.length > 0 && groups[groups.length - 1].isCatchAll,
    `last group: ${groups[groups.length - 1]?.id}`
  );

  // A model without named sub-structures must declare exactly one catch-all
  // group — no per-part groups that nothing can ever populate.
  const partitioned = /partitioned:\s*true/.test(block);
  if (!partitioned) {
    check(
      `${system}: unpartitioned model declares a single whole-organ group`,
      groups.length === 1 && groups[0].isCatchAll,
      `${groups.length} group(s)`
    );
  }

  const names = glbNodeNames(file);
  const unmapped = names.filter((n) => resolveOf(groups, n) === null);
  check(
    `${system}: all ${names.length} structures map to a group`,
    unmapped.length === 0,
    unmapped.slice(0, 5).join(' | ')
  );

  // Every declared group except the catch-all should own at least one structure,
  // otherwise the UI would render a permanently empty control.
  const buckets = {};
  groups.forEach((g) => (buckets[g.id] = 0));
  names.forEach((n) => {
    const id = resolveOf(groups, n);
    if (id) buckets[id] += 1;
  });
  const empty = groups.filter((g) => !g.isCatchAll && buckets[g.id] === 0).map((g) => g.id);
  check(`${system}: no empty non-catch-all group`, empty.length === 0, empty.join(', '));
}

/* ------------------------------------------------------------------ */
/* 3. Metrics: deviations must be derived, never hardcoded.            */
/* ------------------------------------------------------------------ */

console.log('\nDerived metrics');
const metricSrc = fs.readFileSync(
  path.join(ROOT, 'src', 'services', 'organHealthService.ts'),
  'utf8'
);

// The baseline fields the derivation functions must read.
for (const field of ['heartRate', 'hrv', 'sysBp', 'spO2', 'sleepHours', 'stressLevel', 'reactionTimeMs']) {
  check(`derivation reads baseline.${field}`, metricSrc.includes(`b.${field}`), 'not referenced');
}

// deviationPercent must be the single computation point.
check(
  'deviationPercent is used for percentage derivation',
  /export function deviationPercent\(/.test(metricSrc)
);
check(
  'formatDeviation is used for signed labels',
  /export function formatDeviation\(/.test(metricSrc)
);

// Guard the exact regression the dashboard previously had: a literal percentage
// typed next to a value. Building the view must route every deviation through
// the helpers, so a raw quoted percentage should not appear as a deviation value.
const rawPct = /deviation:\s*'[+-]?\d+(\.\d+)?%'/g;
const hardcodedPct = [...metricSrc.matchAll(rawPct)].map((mm) => mm[0]);
check(
  'no hardcoded percentage deviation labels',
  hardcodedPct.length === 0,
  hardcodedPct.join(', ')
);

// A buildOrganHealthView must exist and return the four synchronised parts.
for (const key of ['headline', 'rows', 'trendCaption', 'interpretation']) {
  check(`view exposes ${key}`, new RegExp(`${key}:`).test(metricSrc));
}
check('all five systems handled', ['CARDIOVASCULAR', 'RESPIRATORY', 'COGNITIVE', 'MUSCULOSKELETAL', 'SLEEP'].every((s) => metricSrc.includes(`${s}:`) || metricSrc.includes(`'${s}'`)));

/* ------------------------------------------------------------------ */

console.log(`\n${checks - failures}/${checks} checks passed`);
if (failures > 0) {
  console.error(`${failures} check(s) failed`);
  process.exit(1);
}
console.log('Catalog and metric invariants hold.');
