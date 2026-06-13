import { describe, it, expect } from 'vitest';
import {
  simulate,
  DEFAULT_CONFIG,
  DOG_STORY_PRESET,
  type CampaignConfig,
} from './simulator';

describe('campaign simulator', () => {
  it('is deterministic — same config gives same result', () => {
    const a = simulate(DEFAULT_CONFIG);
    const b = simulate(DEFAULT_CONFIG);
    expect(a).toEqual(b);
  });

  it('produces a 7-day series with spend each day', () => {
    const r = simulate(DEFAULT_CONFIG);
    expect(r.days).toHaveLength(7);
    expect(r.days.every((d) => d.spend === DEFAULT_CONFIG.budgetPerDay)).toBe(true);
    expect(r.totals.spend).toBe(DEFAULT_CONFIG.budgetPerDay * 7);
  });

  it('penalises an objective that does not match the goal', () => {
    const matched = simulate({ ...DEFAULT_CONFIG, goal: 'leads', objective: 'leads' });
    const mismatched = simulate({ ...DEFAULT_CONFIG, goal: 'leads', objective: 'awareness' });
    expect(mismatched.totals.leads).toBeLessThan(matched.totals.leads);
    expect(mismatched.coach.some((c) => c.level === 'bad')).toBe(true);
  });

  it('flags Audience Network as a junk-traffic problem', () => {
    const r = simulate({ ...DEFAULT_CONFIG, audienceNetwork: true });
    expect(r.coach.some((c) => /Audience Network/i.test(c.msg))).toBe(true);
  });

  it('shows CTR decay (fatigue) worse with a single creative', () => {
    const single = simulate({ ...DEFAULT_CONFIG, creativeCount: 1 });
    const many = simulate({ ...DEFAULT_CONFIG, creativeCount: 6 });
    const decay = (r: ReturnType<typeof simulate>) =>
      (r.days[0].ctr - r.days[6].ctr) / r.days[0].ctr;
    expect(decay(single)).toBeGreaterThan(decay(many));
    expect(single.coach.some((c) => /single creative/i.test(c.msg))).toBe(true);
  });

  it('rewards a strong campaign with a higher score than a weak one', () => {
    const strong: CampaignConfig = {
      ...DEFAULT_CONFIG,
      offerStrength: 5,
      hookQuality: 5,
      creativeQuality: 5,
      creativeCount: 5,
      targeting: 'tight',
      audienceNetwork: false,
    };
    const weak: CampaignConfig = {
      ...DEFAULT_CONFIG,
      offerStrength: 1,
      hookQuality: 1,
      creativeQuality: 1,
      creativeCount: 1,
      targeting: 'loose',
      audienceNetwork: true,
      objective: 'awareness',
    };
    expect(simulate(strong).score).toBeGreaterThan(simulate(weak).score);
    expect(simulate(strong).score).toBeGreaterThanOrEqual(0);
    expect(simulate(strong).score).toBeLessThanOrEqual(100);
  });

  it('keeps score within 0..100 for the Dog Story preset and grades it', () => {
    const r = simulate(DOG_STORY_PRESET);
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
    expect('ABCDF').toContain(r.grade);
  });
});
