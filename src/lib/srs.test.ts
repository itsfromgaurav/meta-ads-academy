import { describe, it, expect } from 'vitest';
import { applySwipe, isDue, buildSession, bumpStreak, masteryStats, isoDay } from './srs';
import { defaultProgress } from './storage';
import type { Card, Progress } from '../types';

const DAY = 24 * 60 * 60 * 1000;
const T0 = 1_700_000_000_000; // fixed epoch

function mkCard(id: string, globalIndex: number): Card {
  return {
    id,
    type: 'concept',
    title: id,
    front: 'f',
    back: 'b',
    tags: [],
    difficulty: 1,
    domain: 'd',
    moduleTitle: 'm',
    moduleIndex: 0,
    globalIndex,
  };
}

describe('applySwipe', () => {
  it('promotes box and schedules future due on "known"', () => {
    const cp = applySwipe(undefined, 'known', T0);
    expect(cp.box).toBe(1);
    expect(cp.due).toBe(T0 + 1 * DAY);
    expect(cp.seen).toBe(1);
    expect(cp.status).toBe('learning');
  });

  it('reaches "known" status at box >= 2', () => {
    let cp = applySwipe(undefined, 'known', T0); // box1
    cp = applySwipe(cp, 'known', T0); // box2
    expect(cp.box).toBe(2);
    expect(cp.status).toBe('known');
  });

  it('demotes box on "review" but never below 0', () => {
    let cp = applySwipe(undefined, 'known', T0); // box1
    cp = applySwipe(cp, 'review', T0); // box0
    expect(cp.box).toBe(0);
    cp = applySwipe(cp, 'review', T0); // stays 0
    expect(cp.box).toBe(0);
    expect(cp.status).toBe('learning');
  });

  it('caps box at the max interval', () => {
    let cp = applySwipe(undefined, 'known', T0);
    for (let i = 0; i < 10; i++) cp = applySwipe(cp, 'known', T0);
    expect(cp.box).toBe(5); // INTERVALS length - 1
  });

  it('"skip" records a view without scheduling', () => {
    const cp = applySwipe(undefined, 'skip', T0);
    expect(cp.seen).toBe(1);
    expect(cp.status).toBe('new');
    expect(cp.due).toBe(0);
  });
});

describe('isDue', () => {
  it('new cards are never "due" (they are fresh, not review)', () => {
    expect(isDue(undefined, T0)).toBe(false);
  });
  it('a learning card is due once its time passes', () => {
    const cp = applySwipe(undefined, 'known', T0); // due T0 + 1 day
    expect(isDue(cp, T0 + DAY - 1)).toBe(false);
    expect(isDue(cp, T0 + DAY)).toBe(true);
  });
});

describe('buildSession', () => {
  const cards = [mkCard('a', 0), mkCard('b', 1), mkCard('c', 2), mkCard('d', 3)];

  it('returns fresh cards in course order when nothing studied', () => {
    const p = defaultProgress();
    const q = buildSession(cards, p, { goal: 2, now: T0 });
    expect(q.map((c) => c.id)).toEqual(['a', 'b']);
  });

  it('prioritises due review cards before fresh ones', () => {
    const p: Progress = defaultProgress();
    // 'c' was learned yesterday and is now due
    p.cards['c'] = { box: 1, due: T0 - DAY, status: 'learning', bookmarked: false, seen: 1, lastSeen: T0 - DAY };
    const q = buildSession(cards, p, { goal: 3, now: T0 });
    expect(q[0].id).toBe('c'); // due first
    expect(q.slice(1).map((c) => c.id)).toEqual(['a', 'b']); // then fresh in order
  });

  it('respects the goal limit', () => {
    const p = defaultProgress();
    expect(buildSession(cards, p, { goal: 1, now: T0 })).toHaveLength(1);
  });
});

describe('bumpStreak', () => {
  it('starts a streak at 1', () => {
    const s = bumpStreak({ count: 0, lastDay: '' }, T0);
    expect(s.count).toBe(1);
    expect(s.lastDay).toBe(isoDay(T0));
  });
  it('does not double-count the same day', () => {
    const s1 = bumpStreak({ count: 3, lastDay: isoDay(T0) }, T0);
    expect(s1.count).toBe(3);
  });
  it('increments when studied on consecutive days', () => {
    const s = bumpStreak({ count: 3, lastDay: isoDay(T0 - DAY) }, T0);
    expect(s.count).toBe(4);
  });
  it('resets when a day was missed', () => {
    const s = bumpStreak({ count: 9, lastDay: isoDay(T0 - 3 * DAY) }, T0);
    expect(s.count).toBe(1);
  });
});

describe('masteryStats', () => {
  it('counts known / learning / new correctly', () => {
    const cards = [mkCard('a', 0), mkCard('b', 1), mkCard('c', 2)];
    const p = defaultProgress();
    p.cards['a'] = { box: 3, due: T0, status: 'known', bookmarked: false, seen: 2, lastSeen: T0 };
    p.cards['b'] = { box: 1, due: T0, status: 'learning', bookmarked: false, seen: 1, lastSeen: T0 };
    const st = masteryStats(cards, p);
    expect(st.known).toBe(1);
    expect(st.learning).toBe(1);
    expect(st.neww).toBe(1);
    expect(st.pct).toBe(67);
  });
});
