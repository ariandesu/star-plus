import { Astronaut, HealthMetricDetail, AnalysisSignal, AlertItem, EnvironmentTelemetry, TimelineEvent, DailyScheduleItem } from '../types';

export const DEMO_USERS = [
  {
    username: 'astronaut01',
    password: 'demo123',
    role: 'astronaut' as const,
    name: 'CDR Maya Chen',
    title: 'Commander / Pilot',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  {
    username: 'medical01',
    password: 'demo123',
    role: 'medical' as const,
    name: 'Dr. Sarah Jenkins',
    title: 'Flight Medical Officer (FMO)',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
  },
  {
    username: 'control01',
    password: 'demo123',
    role: 'mission-control' as const,
    name: 'Flight Director Marcus Vance',
    title: 'Lead Mission Control Director',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  }
];

export const MOCK_ASTRONAUTS: Astronaut[] = [
  {
    id: 'maya-chen',
    name: 'CDR Maya Chen',
    role: 'Commander / Pilot',
    mission: 'Artemis VIII - Lunar Surface Ops',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    age: 38,
    gender: 'Female',
    status: 'WATCH',
    missionDay: 147,
    currentVitals: {
      heartRate: 74,
      sleepDuration: 4.8,
      stressIndex: 54
    },
    baseline: {
      heartRate: 60,
      hrv: 58,
      sysBp: 118,
      diaBp: 76,
      spO2: 98,
      sleepHours: 7.5,
      stressLevel: 22,
      reactionTimeMs: 210,
      exerciseScore: 92,
    }
  },
  {
    id: 'alex-carter',
    name: 'Dr. Alex Carter',
    role: 'Flight Engineer / Specialist',
    mission: 'Artemis VIII - Lunar Surface Ops',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    age: 41,
    gender: 'Male',
    status: 'STABLE',
    missionDay: 147,
    currentVitals: {
      heartRate: 62,
      sleepDuration: 7.6,
      stressIndex: 18
    },
    baseline: {
      heartRate: 58,
      hrv: 62,
      sysBp: 116,
      diaBp: 74,
      spO2: 98.5,
      sleepHours: 7.8,
      stressLevel: 18,
      reactionTimeMs: 205,
      exerciseScore: 95,
    }
  },
  {
    id: 'ryan-patel',
    name: 'Lt. Ryan Patel',
    role: 'Payload Specialist',
    mission: 'Artemis VIII - Lunar Surface Ops',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    age: 35,
    gender: 'Male',
    status: 'STABLE',
    missionDay: 147,
    currentVitals: {
      heartRate: 62,
      sleepDuration: 7.6,
      stressIndex: 18
    },
    baseline: {
      heartRate: 64,
      hrv: 54,
      sysBp: 120,
      diaBp: 78,
      spO2: 98,
      sleepHours: 7.2,
      stressLevel: 25,
      reactionTimeMs: 218,
      exerciseScore: 88,
    }
  },
  {
    id: 'lina-park',
    name: 'Dr. Lina Park',
    role: 'Geology & Habitat Specialist',
    mission: 'Artemis VIII - Lunar Surface Ops',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    age: 36,
    gender: 'Female',
    status: 'STABLE',
    missionDay: 147,
    currentVitals: {
      heartRate: 62,
      sleepDuration: 7.6,
      stressIndex: 18
    },
    baseline: {
      heartRate: 62,
      hrv: 56,
      sysBp: 117,
      diaBp: 75,
      spO2: 98.2,
      sleepHours: 7.6,
      stressLevel: 20,
      reactionTimeMs: 212,
      exerciseScore: 90,
    }
  }
];

export const MAYA_HEALTH_METRICS: Record<string, HealthMetricDetail> = {
  heartRate: {
    id: 'heartRate',
    name: 'Resting Heart Rate',
    currentValue: 74,
    unit: 'bpm',
    baselineValue: 60,
    deviationPercent: 23.3,
    status: 'WATCH',
    trend: 'up',
    description: 'Resting HR elevated above historical 30-day baseline due to cumulative fatigue and EVA stress.',
    history24h: [
      { timestamp: '00:00', day: 147, value: 68, baseline: 60 },
      { timestamp: '04:00', day: 147, value: 72, baseline: 60 },
      { timestamp: '08:00', day: 147, value: 75, baseline: 60 },
      { timestamp: '12:00', day: 147, value: 77, baseline: 60 },
      { timestamp: '16:00', day: 147, value: 74, baseline: 60 },
      { timestamp: '20:00', day: 147, value: 74, baseline: 60 },
    ],
    history7d: [
      { timestamp: 'Day 141', day: 141, value: 60, baseline: 60 },
      { timestamp: 'Day 142', day: 142, value: 61, baseline: 60 },
      { timestamp: 'Day 143', day: 143, value: 62, baseline: 60 },
      { timestamp: 'Day 144', day: 144, value: 65, baseline: 60 },
      { timestamp: 'Day 145', day: 145, value: 69, baseline: 60 },
      { timestamp: 'Day 146', day: 146, value: 72, baseline: 60 },
      { timestamp: 'Day 147', day: 147, value: 74, baseline: 60 },
    ],
    history30d: Array.from({ length: 30 }, (_, i) => ({
      timestamp: `Day ${118 + i}`,
      day: 118 + i,
      value: i < 24 ? 59 + Math.floor(Math.sin(i) * 2) : 60 + Math.floor((i - 23) * 2.2),
      baseline: 60
    }))
  },

  sleep: {
    id: 'sleep',
    name: 'Sleep Duration & Quality',
    currentValue: 4.8,
    unit: 'hrs',
    baselineValue: 7.5,
    deviationPercent: -36.0,
    status: 'WATCH',
    trend: 'down',
    description: '3 consecutive nights of fragmented sleep (<5h), reducing REM recovery phase by 42%.',
    history24h: [
      { timestamp: 'Night 1', day: 145, value: 5.2, baseline: 7.5 },
      { timestamp: 'Night 2', day: 146, value: 4.9, baseline: 7.5 },
      { timestamp: 'Night 3', day: 147, value: 4.8, baseline: 7.5 },
    ],
    history7d: [
      { timestamp: 'Day 141', day: 141, value: 7.6, baseline: 7.5 },
      { timestamp: 'Day 142', day: 142, value: 7.4, baseline: 7.5 },
      { timestamp: 'Day 143', day: 143, value: 7.1, baseline: 7.5 },
      { timestamp: 'Day 144', day: 144, value: 6.2, baseline: 7.5 },
      { timestamp: 'Day 145', day: 145, value: 5.2, baseline: 7.5 },
      { timestamp: 'Day 146', day: 146, value: 4.9, baseline: 7.5 },
      { timestamp: 'Day 147', day: 147, value: 4.8, baseline: 7.5 },
    ],
    history30d: Array.from({ length: 30 }, (_, i) => ({
      timestamp: `Day ${118 + i}`,
      day: 118 + i,
      value: i < 24 ? 7.4 + Number((Math.sin(i) * 0.3).toFixed(1)) : Number((7.5 - (i - 23) * 0.45).toFixed(1)),
      baseline: 7.5
    }))
  },

  hrv: {
    id: 'hrv',
    name: 'Heart Rate Variability (HRV)',
    currentValue: 39,
    unit: 'ms',
    baselineValue: 58,
    deviationPercent: -32.7,
    status: 'WATCH',
    trend: 'down',
    description: 'Sympathetic nervous system dominance detected, signaling reduced autonomic recovery.',
    history24h: [
      { timestamp: '00:00', day: 147, value: 44, baseline: 58 },
      { timestamp: '06:00', day: 147, value: 41, baseline: 58 },
      { timestamp: '12:00', day: 147, value: 38, baseline: 58 },
      { timestamp: '18:00', day: 147, value: 39, baseline: 58 },
    ],
    history7d: [
      { timestamp: 'Day 141', day: 141, value: 58, baseline: 58 },
      { timestamp: 'Day 142', day: 142, value: 57, baseline: 58 },
      { timestamp: 'Day 143', day: 143, value: 53, baseline: 58 },
      { timestamp: 'Day 144', day: 144, value: 49, baseline: 58 },
      { timestamp: 'Day 145', day: 145, value: 44, baseline: 58 },
      { timestamp: 'Day 146', day: 146, value: 41, baseline: 58 },
      { timestamp: 'Day 147', day: 147, value: 39, baseline: 58 },
    ],
    history30d: Array.from({ length: 30 }, (_, i) => ({
      timestamp: `Day ${118 + i}`,
      day: 118 + i,
      value: i < 24 ? 58 + Math.floor(Math.sin(i) * 3) : 58 - Math.floor((i - 23) * 3.1),
      baseline: 58
    }))
  },

  stress: {
    id: 'stress',
    name: 'Physiological Stress Index',
    currentValue: 54,
    unit: '/100',
    baselineValue: 22,
    deviationPercent: 145.4,
    status: 'WATCH',
    trend: 'up',
    description: 'Elevated cortisol markers and galvanic skin response recorded during orbital logistics.',
    history24h: [
      { timestamp: '00:00', day: 147, value: 35, baseline: 22 },
      { timestamp: '06:00', day: 147, value: 48, baseline: 22 },
      { timestamp: '12:00', day: 147, value: 58, baseline: 22 },
      { timestamp: '18:00', day: 147, value: 54, baseline: 22 },
    ],
    history7d: [
      { timestamp: 'Day 141', day: 141, value: 21, baseline: 22 },
      { timestamp: 'Day 142', day: 142, value: 23, baseline: 22 },
      { timestamp: 'Day 143', day: 143, value: 29, baseline: 22 },
      { timestamp: 'Day 144', day: 144, value: 38, baseline: 22 },
      { timestamp: 'Day 145', day: 145, value: 46, baseline: 22 },
      { timestamp: 'Day 146', day: 146, value: 51, baseline: 22 },
      { timestamp: 'Day 147', day: 147, value: 54, baseline: 22 },
    ],
    history30d: Array.from({ length: 30 }, (_, i) => ({
      timestamp: `Day ${118 + i}`,
      day: 118 + i,
      value: i < 24 ? 22 + Math.floor(Math.sin(i) * 3) : 22 + Math.floor((i - 23) * 5.3),
      baseline: 22
    }))
  },

  cognitive: {
    id: 'cognitive',
    name: 'Cognitive Reaction Time',
    currentValue: 265,
    unit: 'ms',
    baselineValue: 210,
    deviationPercent: 26.2,
    status: 'WATCH',
    trend: 'up',
    description: 'Psychomotor Vigilance Task (PVT) performance shows +55ms latency and 2 attentional lapses.',
    history24h: [
      { timestamp: '06:00', day: 147, value: 255, baseline: 210 },
      { timestamp: '14:00', day: 147, value: 270, baseline: 210 },
      { timestamp: '20:00', day: 147, value: 265, baseline: 210 },
    ],
    history7d: [
      { timestamp: 'Day 141', day: 141, value: 208, baseline: 210 },
      { timestamp: 'Day 142', day: 142, value: 212, baseline: 210 },
      { timestamp: 'Day 143', day: 143, value: 220, baseline: 210 },
      { timestamp: 'Day 144', day: 144, value: 235, baseline: 210 },
      { timestamp: 'Day 145', day: 145, value: 250, baseline: 210 },
      { timestamp: 'Day 146', day: 146, value: 260, baseline: 210 },
      { timestamp: 'Day 147', day: 147, value: 265, baseline: 210 },
    ],
    history30d: Array.from({ length: 30 }, (_, i) => ({
      timestamp: `Day ${118 + i}`,
      day: 118 + i,
      value: i < 24 ? 210 + Math.floor(Math.sin(i) * 4) : 210 + Math.floor((i - 23) * 9.1),
      baseline: 210
    }))
  },

  spO2: {
    id: 'spO2',
    name: 'Blood Oxygen Saturation (SpO2)',
    currentValue: 97.5,
    unit: '%',
    baselineValue: 98.0,
    deviationPercent: -0.5,
    status: 'STABLE',
    trend: 'stable',
    description: 'Capillary oxygen saturation remains well within normal habitat operating margins.',
    history24h: [
      { timestamp: '00:00', day: 147, value: 98.0, baseline: 98.0 },
      { timestamp: '08:00', day: 147, value: 97.5, baseline: 98.0 },
      { timestamp: '16:00', day: 147, value: 97.5, baseline: 98.0 },
    ],
    history7d: [
      { timestamp: 'Day 141', day: 141, value: 98.1, baseline: 98.0 },
      { timestamp: 'Day 142', day: 142, value: 98.0, baseline: 98.0 },
      { timestamp: 'Day 143', day: 143, value: 97.9, baseline: 98.0 },
      { timestamp: 'Day 144', day: 144, value: 97.8, baseline: 98.0 },
      { timestamp: 'Day 145', day: 145, value: 97.7, baseline: 98.0 },
      { timestamp: 'Day 146', day: 146, value: 97.6, baseline: 98.0 },
      { timestamp: 'Day 147', day: 147, value: 97.5, baseline: 98.0 },
    ],
    history30d: Array.from({ length: 30 }, (_, i) => ({
      timestamp: `Day ${118 + i}`,
      day: 118 + i,
      value: Number((98.0 + Math.sin(i) * 0.3).toFixed(1)),
      baseline: 98.0
    }))
  }
};

export const MAYA_ANALYSIS_SIGNAL: AnalysisSignal = {
  id: 'signal-maya-147',
  astronautId: 'maya-chen',
  astronautName: 'CDR Maya Chen',
  status: 'WATCH',
  timeWindowHours: 72,
  confidence: 'High',
  title: 'Multi-System Sleep Deficit & Autonomic Strain Signal',
  summary: 'Deterministic trend analysis across the 72-hour window indicates a compound WATCH status for CDR Maya Chen. Chronic sleep fragmentation (<5h for 3 consecutive nights) has driven significant sympathetic autonomic strain (+23.3% RHR, -32.7% HRV) and elevated cognitive reaction latency (+26.2%).',
  deviations: [
    { metric: 'Sleep Duration', baseline: '7.5 hrs/night', current: '4.8 hrs', deviationPercent: -36.0, direction: 'reduced' },
    { metric: 'Resting Heart Rate', baseline: '60 bpm', current: '74 bpm', deviationPercent: 23.3, direction: 'elevated' },
    { metric: 'Heart Rate Variability', baseline: '58 ms', current: '39 ms', deviationPercent: -32.7, direction: 'reduced' },
    { metric: 'Cognitive Reaction Time', baseline: '210 ms', current: '265 ms', deviationPercent: 26.2, direction: 'elevated' },
    { metric: 'Stress Index', baseline: '22 / 100', current: '54 / 100', deviationPercent: 145.4, direction: 'elevated' },
  ],
  possibleContributingFactors: [
    'Cumulative high-intensity EVA procedure prep over Days 144-146',
    'Cabin Deck 2 thermal fluctuation (+1.8°C above nominal baseline)',
    'Circadian phase shift due to altered orbital communications window',
    'Sustained high cortisol response from manual payload docking operations'
  ],
  recommendedActions: [
    { id: 'act-1', action: 'Prescribe mandatory 90-minute restorative sleep protocol before EVA-2', category: 'Sleep', isCompleted: false },
    { id: 'act-2', action: 'Reduce EVA checklist item workload by 20% for upcoming lunar surface walk', category: 'Workload', isCompleted: false },
    { id: 'act-3', action: 'Increase electrolyte hydration target to 2.8 L / day', category: 'Medical', isCompleted: true, completedAt: '10:15 UTC', completedByRole: 'medical' },
    { id: 'act-4', action: 'Conduct follow-up Psychomotor Vigilance Task (PVT) in 4 hours', category: 'Cognitive', isCompleted: false },
  ],
  timestamp: 'Mission Day 147 — 08:30 UTC'
};

export const MOCK_ENVIRONMENT: EnvironmentTelemetry = {
  co2: {
    current: 0.38,
    unit: '%',
    baseline: 0.30,
    min: 0.20,
    max: 0.50,
    status: 'WATCH',
    history: [
      { timestamp: '00:00', day: 147, value: 0.31, baseline: 0.30 },
      { timestamp: '06:00', day: 147, value: 0.34, baseline: 0.30 },
      { timestamp: '12:00', day: 147, value: 0.39, baseline: 0.30 },
      { timestamp: '18:00', day: 147, value: 0.38, baseline: 0.30 },
    ]
  },
  temperature: {
    current: 23.4,
    unit: '°C',
    baseline: 21.5,
    min: 19.0,
    max: 25.0,
    status: 'WATCH',
    history: [
      { timestamp: '00:00', day: 147, value: 21.6, baseline: 21.5 },
      { timestamp: '06:00', day: 147, value: 22.8, baseline: 21.5 },
      { timestamp: '12:00', day: 147, value: 23.9, baseline: 21.5 },
      { timestamp: '18:00', day: 147, value: 23.4, baseline: 21.5 },
    ]
  },
  humidity: {
    current: 46.2,
    unit: '%',
    baseline: 45.0,
    min: 35.0,
    max: 55.0,
    status: 'STABLE',
    history: [
      { timestamp: '00:00', day: 147, value: 45.1, baseline: 45.0 },
      { timestamp: '06:00', day: 147, value: 45.8, baseline: 45.0 },
      { timestamp: '12:00', day: 147, value: 46.5, baseline: 45.0 },
      { timestamp: '18:00', day: 147, value: 46.2, baseline: 45.0 },
    ]
  },
  radiation: {
    current: 0.42,
    unit: 'mSv/day',
    baseline: 0.35,
    min: 0.10,
    max: 0.80,
    status: 'STABLE',
    history: [
      { timestamp: '00:00', day: 147, value: 0.36, baseline: 0.35 },
      { timestamp: '06:00', day: 147, value: 0.39, baseline: 0.35 },
      { timestamp: '12:00', day: 147, value: 0.44, baseline: 0.35 },
      { timestamp: '18:00', day: 147, value: 0.42, baseline: 0.35 },
    ]
  },
  pressure: {
    current: 101.3,
    unit: 'kPa',
    baseline: 101.3,
    min: 98.0,
    max: 104.0,
    status: 'STABLE',
    history: [
      { timestamp: '00:00', day: 147, value: 101.3, baseline: 101.3 },
      { timestamp: '06:00', day: 147, value: 101.3, baseline: 101.3 },
      { timestamp: '12:00', day: 147, value: 101.3, baseline: 101.3 },
      { timestamp: '18:00', day: 147, value: 101.3, baseline: 101.3 },
    ]
  },
  oxygen: {
    current: 21.2,
    unit: '%',
    baseline: 21.0,
    min: 19.5,
    max: 23.5,
    status: 'STABLE',
    history: [
      { timestamp: '00:00', day: 147, value: 21.0, baseline: 21.0 },
      { timestamp: '06:00', day: 147, value: 21.1, baseline: 21.0 },
      { timestamp: '12:00', day: 147, value: 21.3, baseline: 21.0 },
      { timestamp: '18:00', day: 147, value: 21.2, baseline: 21.0 },
    ]
  }
};

export const MOCK_ALERTS: AlertItem[] = [
  {
    id: 'alt-01',
    astronautId: 'maya-chen',
    astronautName: 'CDR Maya Chen',
    title: 'Elevated Rest HR & Cognitive Latency (WATCH Signal)',
    severity: 'WARNING',
    category: 'Health',
    timestamp: '08:30 UTC',
    status: 'ACTIVE',
    description: '72-hour trend analysis flagged +23.3% RHR elevation and +55ms reaction time shift.',
    location: 'Habitat Module Deck 1'
  },
  {
    id: 'alt-02',
    title: 'Habitat CO2 Scrub Loop B Mild Elevation',
    severity: 'WARNING',
    category: 'Environment',
    timestamp: '07:15 UTC',
    status: 'ACKNOWLEDGED',
    acknowledgedBy: 'Flight Director Vance',
    acknowledgedAt: '07:22 UTC',
    description: 'Cabin CO2 partial pressure rose to 0.38% due to filter canister switchover.',
    location: 'Environmental Control Module'
  },
  {
    id: 'alt-03',
    astronautId: 'maya-chen',
    astronautName: 'CDR Maya Chen',
    title: 'Sleep Deficit Accumulation (>8h below 3-day target)',
    severity: 'WARNING',
    category: 'Sleep',
    timestamp: '06:00 UTC',
    status: 'ACTIVE',
    description: 'Night 3 sleep logged at 4.8 hrs. Automatic restorative rest recommendation generated.',
    location: 'Crew Quarters A'
  },
  {
    id: 'alt-04',
    title: 'Solar Particle Event (SPE) Baseline Nominal',
    severity: 'INFO',
    category: 'Radiation',
    timestamp: '04:00 UTC',
    status: 'RESOLVED',
    description: 'Dosimeter telemetry confirmed galactic cosmic ray levels within nominal safety envelope.',
    location: 'Outer Shell Sensor Array'
  }
];

export const MOCK_TIMELINE: TimelineEvent[] = [
  {
    id: 'time-01',
    day: 1,
    date: '2026-05-01',
    title: 'Mission Artemis VIII Launch',
    category: 'Launch',
    description: 'Trans-lunar injection successfully executed from Kennedy Space Center LC-39B.',
    status: 'COMPLETED'
  },
  {
    id: 'time-02',
    day: 42,
    date: '2026-06-11',
    title: 'Lunar Surface Touchdown & Base Alpha Entry',
    category: 'Milestone',
    description: 'Starship HLS landed safely at Shackleton Crater rim habitat site.',
    status: 'COMPLETED'
  },
  {
    id: 'time-03',
    day: 120,
    date: '2026-08-28',
    title: 'Mid-Mission Comprehensive Health Audit',
    category: 'Medical',
    description: 'Full cardiovascular ultrasound and bone density bio-analytics complete across crew.',
    status: 'COMPLETED'
  },
  {
    id: 'time-04',
    day: 147,
    date: '2026-09-24',
    title: 'Current Mission Day — CDR Maya Chen WATCH Status',
    category: 'Current',
    description: 'Active monitoring for sleep deficit recovery and EVA-2 preparation optimization.',
    status: 'IN_PROGRESS',
    details: 'FMO intervention protocol active. Recommended 90-min sleep extension and hydration protocol.'
  },
  {
    id: 'time-05',
    day: 152,
    date: '2026-09-29',
    title: 'Planned Lunar Surface EVA Excursion 2',
    category: 'Milestone',
    description: '6-hour geological sample collection at Connecting Ridge South site.',
    status: 'UPCOMING'
  },
  {
    id: 'time-06',
    day: 180,
    date: '2026-10-27',
    title: 'Base Alpha De-servicing & Earth Return Departure',
    category: 'Milestone',
    description: 'Scheduled departure for trans-Earth return trajectory.',
    status: 'UPCOMING'
  }
];

export const MOCK_TODAY_FOCUS = [
  { id: 'f1', task: 'Complete 2-hour microgravity workout (Treadmill + ARED)', completed: false, category: 'FITNESS' },
  { id: 'f2', task: 'Submit morning HRV & cognitive alertness test', completed: true, category: 'COGNITIVE' },
  { id: 'f3', task: 'Log daily hydration (target 2.4L minimum)', completed: false, category: 'NUTRITION' },
  { id: 'f4', task: 'Review Flight Medical Officer rest & EVA adjustment guidance', completed: true, category: 'MEDICAL' }
];

export const MAYA_DAILY_SCHEDULE: DailyScheduleItem[] = [

  { id: 'sch-1', time: '06:00 - 07:00', title: 'Wake & Biomarker Telemetry Sync', category: 'Medical Check', duration: '60 min', isCompleted: true },
  { id: 'sch-2', time: '07:00 - 07:45', title: 'Nutritional Breakfast & Hydration Protocol', category: 'Meal', duration: '45 min', isCompleted: true },
  { id: 'sch-3', time: '08:00 - 09:30', title: 'Prescribed Restorative Sleep Window (FMO Recommended)', category: 'Sleep', duration: '90 min', isCompleted: false },
  { id: 'sch-4', time: '10:00 - 12:30', title: 'Habitat System Diagnostics & Life Support Inspection', category: 'Work', duration: '150 min', isCompleted: false },
  { id: 'sch-5', time: '13:00 - 15:00', title: 'Aerobic & ARED Ergometer Physical Countermeasure', category: 'Exercise', duration: '120 min', isCompleted: false },
  { id: 'sch-6', time: '15:30 - 17:00', title: 'EVA Suit Checkout & Mobility Test', category: 'Work', duration: '90 min', isCompleted: false },
  { id: 'sch-7', time: '17:30 - 18:30', title: 'Daily Medical Debrief with Dr. Sarah Jenkins', category: 'Medical Check', duration: '60 min', isCompleted: false },
  { id: 'sch-8', time: '21:30 - 06:00', title: 'Scheduled Sleep Phase (8.5 Hours)', category: 'Rest', duration: '510 min', isCompleted: false },
];
