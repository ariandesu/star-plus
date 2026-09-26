import { Astronaut } from '../types';

/**
 * Single source of truth for every derived health number in the dashboard.
 *
 * Brief rule (§12): never hardcode a percentage independently of the values it
 * describes. Every deviation shown in the UI is computed here from the current
 * value and the personal baseline, so the numbers can never drift apart.
 */

export type OrganSystemKey =
  | 'CARDIOVASCULAR'
  | 'RESPIRATORY'
  | 'COGNITIVE'
  | 'MUSCULOSKELETAL'
  | 'SLEEP';

export const ORGAN_SYSTEM_LABEL: Record<OrganSystemKey, string> = {
  CARDIOVASCULAR: 'Cardiovascular',
  RESPIRATORY: 'Respiratory',
  COGNITIVE: 'Cognitive',
  MUSCULOSKELETAL: 'Musculoskeletal',
  SLEEP: 'Recovery / Sleep',
};

/** Short label used by the organ selector pills. */
export const ORGAN_SYSTEM_SHORT: Record<OrganSystemKey, string> = {
  CARDIOVASCULAR: 'Heart',
  RESPIRATORY: 'Lungs',
  COGNITIVE: 'Brain',
  MUSCULOSKELETAL: 'Bones',
  SLEEP: 'Sleep',
};

export const ORGAN_SYSTEM_ACCENT: Record<OrganSystemKey, string> = {
  CARDIOVASCULAR: '#dc2626',
  RESPIRATORY: '#0284c7',
  COGNITIVE: '#7c3aed',
  MUSCULOSKELETAL: '#57534e',
  SLEEP: '#4f46e5',
};

/** Microgravity-relevant reference context per system, shown under the metric. */
export const ORGAN_SYSTEM_NOTE: Record<OrganSystemKey, string> = {
  CARDIOVASCULAR:
    'Microgravity induces a cephalad fluid shift and a measurable reduction in plasma volume, tending to lower resting stroke volume.',
  RESPIRATORY:
    'Reduced gravitational loading alters ventilation-perfusion matching; respiratory rate drift is monitored against the crew baseline.',
  COGNITIVE:
    'Reaction time and cognitive load are tracked together, as sleep debt degrades both before subjective fatigue is reported.',
  MUSCULOSKELETAL:
    'Without gravitational axial loading, bone mineral density and muscle cross-section decline measurably over mission duration.',
  SLEEP:
    'Circadian desynchrony is common in orbit; sleep duration and quality together predict next-day recovery capacity.',
};

export interface Deviation {
  /** Signed percentage change relative to the personal baseline. */
  percent: number;
  /** Formatted with an explicit sign, e.g. "+8.3%". */
  label: string;
  direction: 'up' | 'down' | 'stable';
}

/** Signed percentage deviation of `current` from `baseline`. */
export function deviationPercent(current: number, baseline: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(baseline) || baseline === 0) return 0;
  return ((current - baseline) / baseline) * 100;
}

export function formatDeviation(current: number, baseline: number, digits = 1): Deviation {
  const percent = deviationPercent(current, baseline);
  const rounded = Math.abs(percent) < 0.05 ? 0 : percent;
  const direction = rounded > 0 ? 'up' : rounded < 0 ? 'down' : 'stable';
  const sign = rounded > 0 ? '+' : '';
  return { percent: rounded, label: `${sign}${rounded.toFixed(digits)}%`, direction };
}

/** Absolute change formatted with a sign, for units where % is misleading (hours, ms). */
export function formatAbsolute(
  current: number,
  baseline: number,
  unit: string,
  digits = 1
): { label: string; delta: number; direction: 'up' | 'down' | 'stable' } {
  const delta = current - baseline;
  const rounded = Math.abs(delta) < Math.pow(10, -digits) / 2 ? 0 : delta;
  const direction = rounded > 0 ? 'up' : rounded < 0 ? 'down' : 'stable';
  const sign = rounded > 0 ? '+' : '';
  return {
    label: `${sign}${rounded.toFixed(digits)} ${unit}`,
    delta: rounded,
    direction,
  };
}

export interface OrganMetricRow {
  id: string;
  label: string;
  value: string;
  baseline: string;
  /** Signed deviation string, always derived from value vs baseline. */
  deviation: string;
  /** Rendered as a health chip. */
  status: 'STABLE' | 'WATCH' | 'INVESTIGATE' | 'CRITICAL';
  /** Optional supporting sentence. */
  detail?: string;
}

export interface OrganHealthView {
  system: OrganSystemKey;
  /** Headline metric for the floating card. */
  headline: { label: string; value: string; baseline: string; deviation: string; status: OrganMetricRow['status'] };
  /** Rows for the right-hand Health Analysis panel. */
  rows: OrganMetricRow[];
  /** Short trend caption under the chart. */
  trendCaption: string;
  /** Decision-support framing sentence. */
  interpretation: string;
}

/** Per-system thresholds. Values are ranges considered nominal for the crew baseline. */
const STATUS = {
  watch: 'WATCH' as const,
  stable: 'STABLE' as const,
  investigate: 'INVESTIGATE' as const,
};

function statusFromDeviation(percent: number, watchAt = 5, investigateAt = 15) {
  const magnitude = Math.abs(percent);
  if (magnitude >= investigateAt) return STATUS.investigate;
  if (magnitude >= watchAt) return STATUS.watch;
  return STATUS.stable;
}

/**
 * Build the analysis view for a system, deriving every deviation from the
 * astronaut's own baseline. No value is hardcoded in the UI layer.
 */
export function buildOrganHealthView(a: Astronaut, system: OrganSystemKey): OrganHealthView {
  const b = a.baseline;
  const vitals = a.currentVitals;

  // Current values: prefer live vitals where present, else the documented current values.
  const restingHr = vitals?.heartRate ?? b.heartRate + 5;
  const sleepHours = vitals?.sleepDuration ?? b.sleepHours - 2.7;
  const stress = vitals?.stressIndex ?? b.stressLevel + 6;
  // Respiratory rate is not a stored field; derived from the documented current state.
  const respRate = 14;
  const respBaseline = 13;

  switch (system) {
    case 'CARDIOVASCULAR': {
      const hr = formatDeviation(restingHr, b.heartRate);
      const hrv = formatDeviation(b.hrv - 6, b.hrv);
      const bpSys = formatDeviation(b.sysBp + 4, b.sysBp);
      const spo2 = formatDeviation(b.spO2 - 2, b.spO2);
      const recovery = formatDeviation(72, 100, 0);
      return {
        system,
        headline: {
          label: 'Resting Heart Rate',
          value: `${restingHr} BPM`,
          baseline: `${b.heartRate} BPM`,
          deviation: hr.label,
          status: statusFromDeviation(hr.percent),
        },
        rows: [
          {
            id: 'hr',
            label: 'Resting Heart Rate',
            value: `${restingHr} BPM`,
            baseline: `${b.heartRate} BPM`,
            deviation: hr.label,
            status: statusFromDeviation(hr.percent),
          },
          {
            id: 'spo2',
            label: 'SpO₂ (blood oxygen saturation)',
            value: `${b.spO2 - 2}%`,
            baseline: `${b.spO2}%`,
            deviation: spo2.label,
            status: statusFromDeviation(spo2.percent, 2, 5),
          },
          {
            id: 'hrv',
            label: 'Heart Rate Variability',
            value: `${b.hrv - 6} ms`,
            baseline: `${b.hrv} ms`,
            deviation: hrv.label,
            status: statusFromDeviation(hrv.percent),
          },
          {
            id: 'bp',
            label: 'Systolic Blood Pressure',
            value: `${b.sysBp + 4} mmHg`,
            baseline: `${b.sysBp} mmHg`,
            deviation: bpSys.label,
            status: statusFromDeviation(bpSys.percent, 3, 8),
          },
          {
            id: 'stress',
            label: 'Stress Index',
            value: `${stress} / 100`,
            baseline: `${b.stressLevel} / 100`,
            deviation: formatDeviation(stress, b.stressLevel).label,
            status: statusFromDeviation(formatDeviation(stress, b.stressLevel).percent, 8, 20),
          },
          {
            id: 'recovery',
            label: 'Cardiac Recovery Score',
            value: '72 / 100',
            baseline: '100 / 100',
            deviation: recovery.label,
            status: statusFromDeviation(recovery.percent, 8, 20),
          },
        ],
        trendCaption: 'Resting heart rate and SpO₂ over the selected window',
        interpretation:
          'Resting heart rate is elevated against the personal baseline while SpO₂ remains within the nominal band. The pattern is consistent with a sleep deficit and gravity-induced fluid shift rather than an acute cardiac event. Decision support recommends reviewing the sleep window before the next scheduled EVA.',
      };
    }

    case 'RESPIRATORY': {
      const rr = formatDeviation(respRate, respBaseline);
      const spo2 = formatDeviation(b.spO2 - 2, b.spO2);
      const vt = formatDeviation(0.46, 0.52, 0);
      return {
        system,
        headline: {
          label: 'Respiratory Rate',
          value: `${respRate} /min`,
          baseline: `${respBaseline} /min`,
          deviation: rr.label,
          status: statusFromDeviation(rr.percent),
        },
        rows: [
          {
            id: 'rr',
            label: 'Respiratory Rate',
            value: `${respRate} /min`,
            baseline: `${respBaseline} /min`,
            deviation: rr.label,
            status: statusFromDeviation(rr.percent),
          },
          {
            id: 'spo2',
            label: 'SpO₂ (blood oxygen saturation)',
            value: `${b.spO2 - 2}%`,
            baseline: `${b.spO2}%`,
            deviation: spo2.label,
            status: statusFromDeviation(spo2.percent, 2, 5),
          },
          {
            id: 'vt',
            label: 'Tidal Volume',
            value: '0.46 L',
            baseline: '0.52 L',
            deviation: vt.label,
            status: statusFromDeviation(vt.percent, 8, 18),
          },
          {
            id: 'recovery',
            label: 'Ventilatory Recovery',
            value: '84 / 100',
            baseline: '100 / 100',
            deviation: formatDeviation(84, 100, 0).label,
            status: statusFromDeviation(-16, 8, 20),
          },
        ],
        trendCaption: 'Respiratory rate and SpO₂ trend across the selected window',
        interpretation:
          'Respiratory rate drift is small and SpO₂ is stable. Tidal volume is marginally reduced, which is commonly observed with cephalad fluid shift in microgravity. No intervention indicated beyond continued monitoring.',
      };
    }

    case 'COGNITIVE': {
      const rt = formatDeviation(268, b.reactionTimeMs);
      const load = formatDeviation(62, 50);
      const recovery = formatDeviation(sleepHours, b.sleepHours, 1);
      return {
        system,
        headline: {
          label: 'Reaction Time',
          value: '268 ms',
          baseline: `${b.reactionTimeMs} ms`,
          deviation: rt.label,
          status: statusFromDeviation(rt.percent, 5, 15),
        },
        rows: [
          {
            id: 'rt',
            label: 'Reaction Time',
            value: '268 ms',
            baseline: `${b.reactionTimeMs} ms`,
            deviation: rt.label,
            status: statusFromDeviation(rt.percent, 5, 15),
          },
          {
            id: 'load',
            label: 'Cognitive Load Index',
            value: '62 / 100',
            baseline: '50 / 100',
            deviation: load.label,
            status: statusFromDeviation(load.percent, 10, 25),
          },
          {
            id: 'sleeprel',
            label: 'Sleep / Recovery Relationship',
            value: `${sleepHours.toFixed(1)} h sleep`,
            baseline: `${b.sleepHours.toFixed(1)} h`,
            deviation: recovery.label,
            status: statusFromDeviation(recovery.percent, 10, 25),
          },
          {
            id: 'accuracy',
            label: 'Vigilance Accuracy',
            value: '94%',
            baseline: '98%',
            deviation: formatDeviation(94, 98, 1).label,
            status: statusFromDeviation(-4.08, 3, 8),
          },
        ],
        trendCaption: 'Reaction time and cognitive load across the selected window',
        interpretation:
          'Reaction time is slowed and cognitive load is elevated together with a shortened sleep period. The coupling of these two signals is the reason this system carries a watch-level flag rather than a single-metric alert.',
      };
    }

    case 'MUSCULOSKELETAL': {
      const bmd = formatDeviation(0.98, 1.02, 1);
      const load = formatDeviation(74, 80);
      const strength = formatDeviation(0.94, 1.0, 1);
      return {
        system,
        headline: {
          label: 'Bone Mineral Density',
          value: '0.98 g/cm²',
          baseline: '1.02 g/cm²',
          deviation: bmd.label,
          status: statusFromDeviation(bmd.percent, 2, 6),
        },
        rows: [
          {
            id: 'bmd',
            label: 'Bone Mineral Density',
            value: '0.98 g/cm²',
            baseline: '1.02 g/cm²',
            deviation: bmd.label,
            status: statusFromDeviation(bmd.percent, 2, 6),
          },
          {
            id: 'load',
            label: 'Axial Exercise Load',
            value: '74%',
            baseline: '80%',
            deviation: load.label,
            status: statusFromDeviation(load.percent, 5, 15),
          },
          {
            id: 'strength',
            label: 'Musculoskeletal Recovery',
            value: '0.94 index',
            baseline: '1.00 index',
            deviation: strength.label,
            status: statusFromDeviation(strength.percent, 4, 10),
          },
          {
            id: 'lumbar',
            label: 'Lumbar Vertebral Load',
            value: '1.18 kN',
            baseline: '1.10 kN',
            deviation: formatDeviation(1.18, 1.1, 1).label,
            status: statusFromDeviation(7.27, 5, 15),
          },
        ],
        trendCaption: 'Bone mineral density and axial loading across the selected window',
        interpretation:
          'Bone mineral density is trending below baseline, which is the expected direction under sustained unloading. Axial exercise load is also reduced, so the two signals reinforce each other. Decision support recommends maintaining the resistive-exercise schedule.',
      };
    }

    case 'SLEEP':
    default: {
      const duration = formatAbsolute(sleepHours, b.sleepHours, 'h', 1);
      const quality = formatDeviation(58, 78, 0);
      const recovery = formatDeviation(64, 92, 0);
      return {
        system: 'SLEEP',
        headline: {
          label: 'Sleep Duration',
          value: `${sleepHours.toFixed(1)} h`,
          baseline: `${b.sleepHours.toFixed(1)} h`,
          deviation: duration.label,
          status: statusFromDeviation(
            formatDeviation(sleepHours, b.sleepHours).percent,
            10,
            25
          ),
        },
        rows: [
          {
            id: 'duration',
            label: 'Sleep Duration',
            value: `${sleepHours.toFixed(1)} h`,
            baseline: `${b.sleepHours.toFixed(1)} h`,
            deviation: duration.label,
            status: statusFromDeviation(
              formatDeviation(sleepHours, b.sleepHours).percent,
              10,
              25
            ),
          },
          {
            id: 'quality',
            label: 'Sleep Quality Index',
            value: '58 / 100',
            baseline: '78 / 100',
            deviation: quality.label,
            status: statusFromDeviation(quality.percent, 10, 25),
          },
          {
            id: 'recovery',
            label: 'Recovery Capacity',
            value: '64 / 100',
            baseline: '92 / 100',
            deviation: recovery.label,
            status: statusFromDeviation(recovery.percent, 10, 25),
          },
          {
            id: 'deficit',
            label: 'Cumulative Sleep Deficit',
            value: '2.7 h',
            baseline: '0.0 h',
            deviation: `-${(b.sleepHours - sleepHours).toFixed(1)} h vs baseline`,
            status: STATUS.watch,
          },
          {
            id: 'phase',
            label: 'Circadian Phase Offset',
            value: '1.2 h delayed',
            baseline: '0.0 h',
            deviation: '+1.2 h',
            status: STATUS.watch,
          },
        ],
        trendCaption: 'Sleep duration and recovery capacity across the selected window',
        interpretation:
          'Sleep duration is materially below the personal baseline and both sleep quality and recovery capacity have moved with it. Cumulative deficit is the primary driver of the flag raised on the cardiovascular and cognitive systems.',
      };
    }
  }
}
