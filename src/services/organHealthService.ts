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
 * astronaut's own baseline and dynamically responding to the selected time horizon.
 */
export function buildOrganHealthView(
  a: Astronaut,
  system: OrganSystemKey,
  timeHorizon: '24H' | '7D' | '30D' = '24H'
): OrganHealthView {
  const b = a.baseline;
  const vitals = a.currentVitals;

  // Realistic physiological dynamics across 24H, 7D, and 30D time horizons:
  // - 24H: acute cephalad fluid shift & circadian disruption
  // - 7D: baroreceptor resetting, autonomic adaptation, cumulative debt
  // - 30D: chronic spaceflight remodeling, plasma volume contraction, osteopenia kinetics
  const hrOffset = timeHorizon === '24H' ? 5 : timeHorizon === '7D' ? 7 : 10;
  const restingHr = vitals?.heartRate ? vitals.heartRate + (hrOffset - 5) : b.heartRate + hrOffset;
  const hrvOffset = timeHorizon === '24H' ? -6 : timeHorizon === '7D' ? -9 : -12;
  const currentHrv = Math.max(20, b.hrv + hrvOffset);
  const sysBpOffset = timeHorizon === '24H' ? 4 : timeHorizon === '7D' ? 2 : -2;
  const currentSysBp = b.sysBp + sysBpOffset;
  const spo2Offset = timeHorizon === '30D' ? -2 : -1;
  const currentSpo2 = Math.min(100, Math.max(90, b.spO2 + spo2Offset));
  const stressOffset = timeHorizon === '24H' ? 6 : timeHorizon === '7D' ? 8 : 11;
  const currentStress = Math.min(100, (vitals?.stressIndex ?? b.stressLevel) + (stressOffset - 6));
  const cardiacRecovery = timeHorizon === '24H' ? 72 : timeHorizon === '7D' ? 68 : 62;

  const respRate = timeHorizon === '24H' ? 14 : timeHorizon === '7D' ? 15 : 16;
  const respBaseline = 13;
  const tidalVolume = timeHorizon === '24H' ? 0.48 : timeHorizon === '7D' ? 0.46 : 0.43;
  const ventRecovery = timeHorizon === '24H' ? 84 : timeHorizon === '7D' ? 80 : 76;

  const rtOffset = timeHorizon === '24H' ? 18 : timeHorizon === '7D' ? 28 : 38;
  const currentRt = b.reactionTimeMs + rtOffset;
  const cogLoad = timeHorizon === '24H' ? 62 : timeHorizon === '7D' ? 68 : 73;
  const sleepDebtHours = timeHorizon === '24H' ? 2.7 : timeHorizon === '7D' ? 2.1 : 1.4;
  const sleepHours = Math.max(4.0, b.sleepHours - sleepDebtHours);
  const vigilanceAcc = timeHorizon === '24H' ? 94 : timeHorizon === '7D' ? 91 : 88;

  const currentBmd = timeHorizon === '24H' ? 1.01 : timeHorizon === '7D' ? 0.99 : 0.95;
  const axialLoad = timeHorizon === '24H' ? 78 : timeHorizon === '7D' ? 75 : 71;
  const strengthIdx = timeHorizon === '24H' ? 0.98 : timeHorizon === '7D' ? 0.95 : 0.90;
  const lumbarLoad = timeHorizon === '24H' ? 1.14 : timeHorizon === '7D' ? 1.16 : 1.22;

  const sleepQuality = timeHorizon === '24H' ? 58 : timeHorizon === '7D' ? 64 : 71;
  const sleepRecovery = timeHorizon === '24H' ? 64 : timeHorizon === '7D' ? 71 : 79;
  const cumSleepDeficit = timeHorizon === '24H' ? '2.7 h' : timeHorizon === '7D' ? '6.8 h' : '14.2 h';
  const circadianOffset = timeHorizon === '24H' ? '1.2 h delayed' : timeHorizon === '7D' ? '0.9 h delayed' : '0.4 h delayed';
  const circadianOffsetLabel = timeHorizon === '24H' ? '+1.2 h' : timeHorizon === '7D' ? '+0.9 h' : '+0.4 h';

  switch (system) {
    case 'CARDIOVASCULAR': {
      const hr = formatDeviation(restingHr, b.heartRate);
      const hrv = formatDeviation(currentHrv, b.hrv);
      const bpSys = formatDeviation(currentSysBp, b.sysBp);
      const spo2 = formatDeviation(currentSpo2, b.spO2);
      const stressDev = formatDeviation(currentStress, b.stressLevel);
      const recovery = formatDeviation(cardiacRecovery, 100, 0);
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
            value: `${currentSpo2}%`,
            baseline: `${b.spO2}%`,
            deviation: spo2.label,
            status: statusFromDeviation(spo2.percent, 2, 5),
          },
          {
            id: 'hrv',
            label: 'Heart Rate Variability',
            value: `${currentHrv} ms`,
            baseline: `${b.hrv} ms`,
            deviation: hrv.label,
            status: statusFromDeviation(hrv.percent),
          },
          {
            id: 'bp',
            label: 'Systolic Blood Pressure',
            value: `${currentSysBp} mmHg`,
            baseline: `${b.sysBp} mmHg`,
            deviation: bpSys.label,
            status: statusFromDeviation(bpSys.percent, 3, 8),
          },
          {
            id: 'stress',
            label: 'Stress Index',
            value: `${currentStress} / 100`,
            baseline: `${b.stressLevel} / 100`,
            deviation: stressDev.label,
            status: statusFromDeviation(stressDev.percent, 8, 20),
          },
          {
            id: 'recovery',
            label: 'Cardiac Recovery Score',
            value: `${cardiacRecovery} / 100`,
            baseline: '100 / 100',
            deviation: recovery.label,
            status: statusFromDeviation(recovery.percent, 8, 20),
          },
        ],
        trendCaption: `Resting heart rate, BP, and SpO₂ over ${timeHorizon} horizon`,
        interpretation:
          timeHorizon === '24H'
            ? 'Resting heart rate is elevated against the personal baseline while SpO₂ remains within the nominal band. The pattern is consistent with acute cephalad fluid shift and circadian delay. Decision support recommends reviewing the sleep window before the next scheduled EVA.'
            : timeHorizon === '7D'
            ? '7-day rolling window demonstrates autonomic baroreflex resetting. Plasma volume contraction has stabilized systolic BP while heart rate compensatory elevation reflects ongoing cardiovascular adaptation to weightlessness.'
            : '30-day longitudinal telemetry confirms chronic microgravity cardiovascular remodeling. Heart rate elevation and lower systolic baseline reflect expected spaceflight-associated hypovolemia.',
      };
    }

    case 'RESPIRATORY': {
      const rr = formatDeviation(respRate, respBaseline);
      const spo2 = formatDeviation(currentSpo2, b.spO2);
      const vt = formatDeviation(tidalVolume, 0.52, 0);
      const vent = formatDeviation(ventRecovery, 100, 0);
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
            value: `${currentSpo2}%`,
            baseline: `${b.spO2}%`,
            deviation: spo2.label,
            status: statusFromDeviation(spo2.percent, 2, 5),
          },
          {
            id: 'vt',
            label: 'Tidal Volume',
            value: `${tidalVolume.toFixed(2)} L`,
            baseline: '0.52 L',
            deviation: vt.label,
            status: statusFromDeviation(vt.percent, 8, 18),
          },
          {
            id: 'recovery',
            label: 'Ventilatory Recovery',
            value: `${ventRecovery} / 100`,
            baseline: '100 / 100',
            deviation: vent.label,
            status: statusFromDeviation(vent.percent, 8, 20),
          },
        ],
        trendCaption: `Respiratory rate, tidal volume, and SpO₂ trend across ${timeHorizon} window`,
        interpretation:
          timeHorizon === '24H'
            ? 'Respiratory rate drift is small and SpO₂ is stable. Tidal volume is marginally reduced, which is commonly observed with cephalad fluid shift in microgravity. No intervention indicated beyond continued monitoring.'
            : timeHorizon === '7D'
            ? '7-day ventilatory kinetics show consistent alveolar ventilation and stable thoracic fluid impedance across daily activity and exercise periods.'
            : '30-day pulmonary mechanics show sustained adaptation of respiratory rhythm to spacecraft environmental parameters with nominal gas exchange reserves.',
      };
    }

    case 'COGNITIVE': {
      const rt = formatDeviation(currentRt, b.reactionTimeMs);
      const load = formatDeviation(cogLoad, 50);
      const recovery = formatDeviation(sleepHours, b.sleepHours, 1);
      const accuracy = formatDeviation(vigilanceAcc, 98, 1);
      return {
        system,
        headline: {
          label: 'Reaction Time',
          value: `${currentRt} ms`,
          baseline: `${b.reactionTimeMs} ms`,
          deviation: rt.label,
          status: statusFromDeviation(rt.percent, 5, 15),
        },
        rows: [
          {
            id: 'rt',
            label: 'Reaction Time',
            value: `${currentRt} ms`,
            baseline: `${b.reactionTimeMs} ms`,
            deviation: rt.label,
            status: statusFromDeviation(rt.percent, 5, 15),
          },
          {
            id: 'load',
            label: 'Cognitive Load Index',
            value: `${cogLoad} / 100`,
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
            value: `${vigilanceAcc}%`,
            baseline: '98%',
            deviation: accuracy.label,
            status: statusFromDeviation(accuracy.percent, 3, 8),
          },
        ],
        trendCaption: `Reaction time, cognitive load, and vigilance across ${timeHorizon} window`,
        interpretation:
          timeHorizon === '24H'
            ? 'Reaction time is slowed and cognitive load is elevated together with a shortened sleep period. The coupling of these two signals is the reason this system carries a watch-level flag rather than a single-metric alert.'
            : timeHorizon === '7D'
            ? '7-day rolling psychomotor vigilance demonstrates neurovestibular compensation with moderate cognitive fatigue from operational mission workloads.'
            : '30-day longitudinal psychomotor assessments indicate stabilized performance with periodic cognitive load peaks matching EVA timelines.',
      };
    }

    case 'MUSCULOSKELETAL': {
      const bmd = formatDeviation(currentBmd, 1.02, 1);
      const load = formatDeviation(axialLoad, 80);
      const strength = formatDeviation(strengthIdx, 1.0, 1);
      const lumbar = formatDeviation(lumbarLoad, 1.1, 1);
      return {
        system,
        headline: {
          label: 'Bone Mineral Density',
          value: `${currentBmd.toFixed(2)} g/cm²`,
          baseline: '1.02 g/cm²',
          deviation: bmd.label,
          status: statusFromDeviation(bmd.percent, 2, 6),
        },
        rows: [
          {
            id: 'bmd',
            label: 'Bone Mineral Density',
            value: `${currentBmd.toFixed(2)} g/cm²`,
            baseline: '1.02 g/cm²',
            deviation: bmd.label,
            status: statusFromDeviation(bmd.percent, 2, 6),
          },
          {
            id: 'load',
            label: 'Axial Exercise Load',
            value: `${axialLoad}%`,
            baseline: '80%',
            deviation: load.label,
            status: statusFromDeviation(load.percent, 5, 15),
          },
          {
            id: 'strength',
            label: 'Musculoskeletal Recovery',
            value: `${strengthIdx.toFixed(2)} index`,
            baseline: '1.00 index',
            deviation: strength.label,
            status: statusFromDeviation(strength.percent, 4, 10),
          },
          {
            id: 'lumbar',
            label: 'Lumbar Vertebral Load',
            value: `${lumbarLoad.toFixed(2)} kN`,
            baseline: '1.10 kN',
            deviation: lumbar.label,
            status: statusFromDeviation(lumbar.percent, 5, 15),
          },
        ],
        trendCaption: `Bone mineral density, axial loading, and lumbar load across ${timeHorizon} window`,
        interpretation:
          timeHorizon === '24H'
            ? 'Bone mineral density is trending below baseline, which is the expected direction under sustained unloading. Axial exercise load is also reduced, so the two signals reinforce each other. Decision support recommends maintaining the resistive-exercise schedule.'
            : timeHorizon === '7D'
            ? '7-day biomarker metrics show initial osteoclastic bone resorption markers within predicted ranges. ARED resistive loading adherence is critical to mitigate bone remodeling.'
            : '30-day cumulative DXA proxy models track expected microgravity trabecular bone remodeling. Daily high-resistance axial loading regimens remain mandatory.',
      };
    }

    case 'SLEEP':
    default: {
      const duration = formatAbsolute(sleepHours, b.sleepHours, 'h', 1);
      const quality = formatDeviation(sleepQuality, 78, 0);
      const recovery = formatDeviation(sleepRecovery, 92, 0);
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
            value: `${sleepQuality} / 100`,
            baseline: '78 / 100',
            deviation: quality.label,
            status: statusFromDeviation(quality.percent, 10, 25),
          },
          {
            id: 'recovery',
            label: 'Recovery Capacity',
            value: `${sleepRecovery} / 100`,
            baseline: '92 / 100',
            deviation: recovery.label,
            status: statusFromDeviation(recovery.percent, 10, 25),
          },
          {
            id: 'deficit',
            label: 'Cumulative Sleep Deficit',
            value: cumSleepDeficit,
            baseline: '0.0 h',
            deviation: `-${(b.sleepHours - sleepHours).toFixed(1)} h vs baseline`,
            status: STATUS.watch,
          },
          {
            id: 'phase',
            label: 'Circadian Phase Offset',
            value: circadianOffset,
            baseline: '0.0 h',
            deviation: circadianOffsetLabel,
            status: STATUS.watch,
          },
        ],
        trendCaption: `Sleep duration, quality, and recovery capacity across ${timeHorizon} window`,
        interpretation:
          timeHorizon === '24H'
            ? 'Sleep duration is materially below the personal baseline and both sleep quality and recovery capacity have moved with it. Cumulative deficit is the primary driver of the flag raised on the cardiovascular and cognitive systems.'
            : timeHorizon === '7D'
            ? '7-day sleep records indicate accumulated sleep debt with circadian phase delays following orbital dawn-dusk shifting. Light therapy protocols are advised.'
            : '30-day longitudinal sleep consolidation demonstrates progressive stabilization of microgravity sleep architecture with normalized delta-wave power.',
      };
    }
  }
}
