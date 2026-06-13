// Campaign Simulator — a deterministic, rules-based "paper trading" engine for
// Meta ads. No real spend, no API. Given a campaign config it produces a
// plausible 7-day result plus framework-cited coaching, so learners can practice
// cause -> effect risk-free. Calibrated loosely to INR lead-gen economics.

export type Objective = 'awareness' | 'traffic' | 'engagement' | 'leads' | 'sales';
export type Audience = 'narrow' | 'balanced' | 'broad';
export type Targeting = 'tight' | 'loose';

export interface CampaignConfig {
  goal: 'leads' | 'sales'; // what the learner actually wants
  objective: Objective; // what they picked in the simulator
  audience: Audience;
  targeting: Targeting; // did they tune age/interests to the buyer?
  budgetPerDay: number; // INR/day
  offerStrength: number; // 1..5  (offer + landing page match)
  hookQuality: number; // 1..5
  creativeQuality: number; // 1..5
  creativeCount: number; // 1..6  (more = slower fatigue)
  audienceNetwork: boolean; // including AN junk placements?
  targetCPL: number; // INR — the learner's goal cost per result
}

export interface DayResult {
  day: number;
  spend: number;
  impressions: number;
  reach: number;
  frequency: number;
  ctr: number; // %
  leads: number;
  cpl: number; // INR (Infinity-safe -> 0 leads => null shown as —)
}

export interface CoachNote {
  level: 'good' | 'warn' | 'bad';
  msg: string;
  ref: string; // module/framework reference
}

export interface SimResult {
  days: DayResult[];
  totals: {
    spend: number;
    impressions: number;
    reach: number;
    frequency: number;
    ctr: number;
    leads: number;
    cpl: number;
    cpm: number;
  };
  status: 'learning' | 'limited' | 'optimized';
  score: number; // 0..100
  grade: string; // letter
  coach: CoachNote[];
}

// --- tiny deterministic PRNG (mulberry32) so runs are reproducible -----------
function seedFrom(cfg: CampaignConfig): number {
  const s = JSON.stringify(cfg);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

// Base CPM (INR) by audience breadth — broader pools deliver cheaper impressions.
const CPM_BASE: Record<Audience, number> = { narrow: 230, balanced: 150, broad: 115 };

export function simulate(cfg: CampaignConfig): SimResult {
  const rng = mulberry32(seedFrom(cfg));
  const jitter = (pct: number) => 1 + (rng() * 2 - 1) * pct;

  // --- CPM: audience + Audience Network drag + objective effect ---
  let cpm = CPM_BASE[cfg.audience];
  if (cfg.audienceNetwork) cpm *= 0.9; // AN is cheap impressions...
  if (cfg.objective === 'awareness') cpm *= 0.8;
  if (cfg.objective === 'sales' || cfg.objective === 'leads') cpm *= 1.12; // optimizing for conversions costs more per impression

  // --- CTR (%): driven by hook + creative quality; AN inflates junk clicks ---
  let ctr0 = 1.2 + cfg.hookQuality * 0.55 + cfg.creativeQuality * 0.35; // ~1.9%..~5.7%
  if (cfg.audienceNetwork) ctr0 += 1.4; // junk taps, won't convert
  if (cfg.audience === 'narrow') ctr0 += 0.3;

  // --- CVR (click -> result %): offer + targeting + objective match ---
  const objectiveMatch =
    (cfg.goal === 'leads' && cfg.objective === 'leads') ||
    (cfg.goal === 'sales' && cfg.objective === 'sales');
  let cvr = 0.6 + cfg.offerStrength * 1.15; // ~1.75%..~6.35%
  if (cfg.targeting === 'tight') cvr *= 1.2;
  else cvr *= 0.82;
  if (objectiveMatch) cvr *= 1.25;
  else cvr *= 0.5; // wrong objective tanks results
  if (cfg.audienceNetwork) cvr *= 0.6; // junk clicks dilute

  // --- fatigue: how fast CTR decays over the week ---
  // more creatives + broader audience = slower decay
  const fatiguePerDay =
    (0.085 - cfg.creativeCount * 0.012) *
    (cfg.audience === 'narrow' ? 1.4 : cfg.audience === 'balanced' ? 1.0 : 0.8);

  // --- reach pool (audiences saturate) ---
  const reachPool =
    cfg.audience === 'narrow' ? 90_000 : cfg.audience === 'balanced' ? 450_000 : 2_400_000;

  const days: DayResult[] = [];
  let cumReach = 0;
  for (let d = 1; d <= 7; d++) {
    const spend = cfg.budgetPerDay;
    const ctr = clamp(ctr0 * (1 - fatiguePerDay * (d - 1)), 0.3, 12) * jitter(0.04);
    const dayCpm = cpm * jitter(0.05);
    const impressions = Math.round((spend / dayCpm) * 1000);
    // new reach shrinks as the audience saturates
    const saturation = clamp(1 - cumReach / reachPool, 0.12, 1);
    const newReach = Math.round(impressions * (0.62 * saturation));
    cumReach = Math.min(reachPool, cumReach + newReach);
    const frequency = +(impressions === 0 ? 0 : (impressions / Math.max(1, newReach))).toFixed(2);
    const clicks = impressions * (ctr / 100);
    const leads = Math.max(0, Math.round(clicks * (cvr / 100)));
    const cpl = leads > 0 ? +(spend / leads).toFixed(0) : 0;
    days.push({
      day: d,
      spend: Math.round(spend),
      impressions,
      reach: newReach,
      frequency,
      ctr: +ctr.toFixed(2),
      leads,
      cpl,
    });
  }

  const sum = (k: keyof DayResult) => days.reduce((s, x) => s + (x[k] as number), 0);
  const totSpend = sum('spend');
  const totImpr = sum('impressions');
  const totReach = sum('reach');
  const totLeads = sum('leads');
  const totals = {
    spend: totSpend,
    impressions: totImpr,
    reach: totReach,
    frequency: +(totImpr / Math.max(1, totReach)).toFixed(2),
    ctr: +((days.reduce((s, x) => s + x.ctr, 0) / days.length)).toFixed(2),
    leads: totLeads,
    cpl: totLeads > 0 ? +(totSpend / totLeads).toFixed(0) : 0,
    cpm: +((totSpend / Math.max(1, totImpr)) * 1000).toFixed(0),
  };

  const status: SimResult['status'] =
    totLeads < 10 ? 'learning' : totLeads < 25 ? 'limited' : 'optimized';

  const coach = buildCoaching(cfg, totals, days);
  const { score, grade } = scoreRun(cfg, totals, days, coach);

  return { days, totals, status, score, grade, coach };
}

function buildCoaching(
  cfg: CampaignConfig,
  totals: SimResult['totals'],
  days: DayResult[],
): CoachNote[] {
  const notes: CoachNote[] = [];
  const objectiveMatch =
    (cfg.goal === 'leads' && cfg.objective === 'leads') ||
    (cfg.goal === 'sales' && cfg.objective === 'sales');

  if (!objectiveMatch) {
    notes.push({
      level: 'bad',
      msg: `You want ${cfg.goal}, but optimized for "${cfg.objective}". Meta delivers to people likely to do the action you choose — pick the matching conversion objective.`,
      ref: 'Campaign Objectives · choose by outcome',
    });
  }
  if (cfg.audienceNetwork) {
    notes.push({
      level: 'bad',
      msg: 'Audience Network is inflating CTR with junk taps that rarely convert — exclude it (you saw this on the Dog Story account).',
      ref: 'Ad Sets & Budget · placements',
    });
  }
  if (cfg.creativeCount <= 1) {
    notes.push({
      level: 'warn',
      msg: `Single creative — CTR slides from ${days[0].ctr}% to ${days[6].ctr}% over the week. Add 3-4 variants so one fatiguing ad can't sink the set.`,
      ref: 'Creative & Design · fatigue',
    });
  }
  if (cfg.offerStrength <= 2) {
    notes.push({
      level: 'warn',
      msg: 'Weak offer/landing match: clicks come in but conversions lag. Validate the message before scaling (cheap clicks ≠ profit).',
      ref: 'Funnels & Offers · validate first',
    });
  }
  if (cfg.targeting === 'loose') {
    notes.push({
      level: 'warn',
      msg: 'Loose targeting wastes spend on non-buyers — tighten age/interests to the people who actually convert.',
      ref: 'Audiences & Targeting · BCOP',
    });
  }
  if (totals.frequency >= 3) {
    notes.push({
      level: 'warn',
      msg: `Frequency hit ${totals.frequency} — the audience is seeing it too often. Broaden the audience or refresh creative.`,
      ref: 'Reporting & Optimization · frequency',
    });
  }
  if (cfg.hookQuality >= 4 && cfg.creativeQuality >= 4) {
    notes.push({
      level: 'good',
      msg: 'Strong hook + creative — that high CTR is doing the heavy lifting. Protect it with fresh variants as it ages.',
      ref: 'Hooks & Messaging',
    });
  }
  if (totals.cpl > 0 && totals.cpl <= cfg.targetCPL) {
    notes.push({
      level: 'good',
      msg: `CPL ₹${totals.cpl} is at or under your ₹${cfg.targetCPL} target — once it clears the learning phase you can start the Five-Tier scaling system.`,
      ref: 'Scaling · pre-scale readiness',
    });
  } else if (totals.cpl > cfg.targetCPL) {
    notes.push({
      level: 'bad',
      msg: `CPL ₹${totals.cpl || '—'} is above your ₹${cfg.targetCPL} target. Fix the weakest lever above before adding budget.`,
      ref: 'Troubleshooting · high CPA',
    });
  }
  return notes;
}

function scoreRun(
  cfg: CampaignConfig,
  totals: SimResult['totals'],
  days: DayResult[],
  coach: CoachNote[],
): { score: number; grade: string } {
  let score = 50;
  // result efficiency vs target
  if (totals.cpl > 0) {
    const ratio = cfg.targetCPL / totals.cpl; // >1 means beating target
    score += clamp((ratio - 1) * 45, -35, 35);
  } else {
    score -= 30; // zero conversions
  }
  // volume
  score += clamp(totals.leads * 0.6, 0, 15);
  // creative diversity
  score += clamp((cfg.creativeCount - 1) * 3, 0, 12);
  // frequency health
  if (totals.frequency < 2.2) score += 5;
  if (totals.frequency >= 3) score -= 8;
  // penalties from bad coaching notes
  score -= coach.filter((c) => c.level === 'bad').length * 7;
  score += coach.filter((c) => c.level === 'good').length * 3;
  // ctr decay penalty
  const decay = days[0].ctr > 0 ? (days[0].ctr - days[6].ctr) / days[0].ctr : 0;
  if (decay > 0.4) score -= 6;

  score = Math.round(clamp(score, 0, 100));
  const grade =
    score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 68 ? 'C' : score >= 55 ? 'D' : 'F';
  return { score, grade };
}

// A starting scenario modeled on the real "A Dog Story" campaign.
export const DOG_STORY_PRESET: CampaignConfig = {
  goal: 'leads',
  objective: 'leads',
  audience: 'broad',
  targeting: 'loose',
  budgetPerDay: 400,
  offerStrength: 3,
  hookQuality: 4,
  creativeQuality: 3,
  creativeCount: 1,
  audienceNetwork: true,
  targetCPL: 180,
};

export const DEFAULT_CONFIG: CampaignConfig = {
  goal: 'leads',
  objective: 'leads',
  audience: 'balanced',
  targeting: 'tight',
  budgetPerDay: 500,
  offerStrength: 3,
  hookQuality: 3,
  creativeQuality: 3,
  creativeCount: 3,
  audienceNetwork: false,
  targetCPL: 200,
};
