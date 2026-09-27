export type Role = 'astronaut' | 'medical' | 'mission-control';

export interface UserSession {
  username: string;
  role: Role;
  name: string;
  title: string;
  avatarUrl?: string;
  isAuthenticated: boolean;
  password?: string;
  age?: number;
  gender?: string;
  theme?: 'light' | 'dark';
}

export type HealthStatus = 'STABLE' | 'WATCH' | 'INVESTIGATE' | 'CRITICAL';

export interface Astronaut {
  id: string;
  name: string;
  role: string;
  mission: string;
  avatarUrl: string;
  age: number;
  gender: string;
  status: HealthStatus;
  missionDay: number;
  currentVitals?: {
    heartRate: number;
    sleepDuration: number;
    stressIndex: number;
  };
  baseline: {
    heartRate: number;
    hrv: number;
    sysBp: number;
    diaBp: number;
    spO2: number;
    sleepHours: number;
    stressLevel: number;
    reactionTimeMs: number;
    exerciseScore: number;
  };
}

export interface MetricPoint {
  timestamp: string;
  day: number;
  value: number;
  baseline?: number;
}

export interface HealthMetricDetail {
  id: string;
  name: string;
  currentValue: number | string;
  unit: string;
  baselineValue: number | string;
  deviationPercent: number;
  status: HealthStatus;
  trend: 'up' | 'down' | 'stable';
  history24h: MetricPoint[];
  history7d: MetricPoint[];
  history30d: MetricPoint[];
  description: string;
}

export interface HealthDomainScore {
  domain: 'Cardiovascular' | 'Sleep & Recovery' | 'Fitness & Musculoskeletal' | 'Cognitive & Neuro' | 'Environmental Exposure';
  score: number; // 0-100
  status: HealthStatus;
  deviationPercent: number;
}

export interface AnalysisSignal {
  id: string;
  astronautId: string;
  astronautName: string;
  status: HealthStatus;
  timeWindowHours: number;
  confidence: 'High' | 'Moderate' | 'Low';
  title: string;
  summary: string;
  deviations: {
    metric: string;
    baseline: string;
    current: string;
    deviationPercent: number;
    direction: 'elevated' | 'reduced';
  }[];
  possibleContributingFactors: string[];
  recommendedActions: RecommendedAction[];
  timestamp: string;
}

export interface RecommendedAction {
  id: string;
  action: string;
  category: 'Sleep' | 'Workload' | 'Exercise' | 'Cognitive' | 'Medical';
  isCompleted: boolean;
  completedAt?: string;
  completedByRole?: Role;
}

export interface AlertItem {
  id: string;
  astronautId?: string;
  astronautName?: string;
  title: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  category: 'Health' | 'Environment' | 'Sleep' | 'Radiation';
  timestamp: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  description: string;
  location?: string;
}

export interface EnvironmentTelemetry {
  co2: { current: number; unit: string; baseline: number; min: number; max: number; status: HealthStatus; history: MetricPoint[] };
  temperature: { current: number; unit: string; baseline: number; min: number; max: number; status: HealthStatus; history: MetricPoint[] };
  humidity: { current: number; unit: string; baseline: number; min: number; max: number; status: HealthStatus; history: MetricPoint[] };
  radiation: { current: number; unit: string; baseline: number; min: number; max: number; status: HealthStatus; history: MetricPoint[] };
  pressure: { current: number; unit: string; baseline: number; min: number; max: number; status: HealthStatus; history: MetricPoint[] };
  oxygen: { current: number; unit: string; baseline: number; min: number; max: number; status: HealthStatus; history: MetricPoint[] };
}

export interface TimelineEvent {
  id: string;
  day: number;
  date: string;
  title: string;
  category: 'Launch' | 'Milestone' | 'Medical' | 'Telemetry' | 'Current';
  description: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING';
  details?: string;
}

export interface DailyScheduleItem {
  id: string;
  time: string;
  title: string;
  category: 'Exercise' | 'Medical Check' | 'Work' | 'Meal' | 'Rest' | 'Sleep';
  duration: string;
  isCompleted: boolean;
}

export interface InterventionLog {
  id: string;
  timestamp: string;
  astronautName: string;
  action: string;
  role: string;
  status: 'Completed' | 'Pending';
  notes?: string;
}
