import { describe, it, expect } from 'vitest';
import { mergeProgress, encodeProgress, decodeProgress } from './sync';
import { defaultProgress } from './storage';
import type { Progress } from '../types';

function withCard(p: Progress, id: string, box: number, status: Progress['cards'][string]['status'], extra: Partial<Progress['cards'][string]> = {}): Progress {
  return {
    ...p,
    cards: { ...p.cards, [id]: { box, due: 0, status, bookmarked: false, seen: box, lastSeen: box, ...extra } },
  };
}

describe('encode/decode progress', () => {
  it('round-trips a progress object', () => {
    let p = defaultProgress();
    p = withCard(p, 'a', 2, 'known');
    p.streak = { count: 5, lastDay: '2026-06-10' };
    const back = decodeProgress(encodeProgress(p));
    expect(back).toEqual(p);
  });

  it('returns null on garbage', () => {
    expect(decodeProgress('not-valid')).toBeNull();
    expect(decodeProgress(undefined)).toBeNull();
  });

  it('compresses to a reasonably small string', () => {
    let p = defaultProgress();
    for (let i = 0; i < 150; i++) p = withCard(p, `card-${i}`, 2, 'known');
    const enc = encodeProgress(p);
    expect(enc.length).toBeLessThan(8000); // fits Clerk metadata budget
  });
});

describe('mergeProgress', () => {
  it('keeps the more-advanced card state', () => {
    const local = withCard(defaultProgress(), 'a', 1, 'learning');
    const cloud = withCard(defaultProgress(), 'a', 3, 'known');
    const m = mergeProgress(local, cloud);
    expect(m.cards['a'].box).toBe(3);
    expect(m.cards['a'].status).toBe('known');
  });

  it('unions cards from both sides', () => {
    const local = withCard(defaultProgress(), 'a', 1, 'learning');
    const cloud = withCard(defaultProgress(), 'b', 2, 'known');
    const m = mergeProgress(local, cloud);
    expect(Object.keys(m.cards).sort()).toEqual(['a', 'b']);
  });

  it('ORs bookmarks across devices', () => {
    const local = withCard(defaultProgress(), 'a', 1, 'learning', { bookmarked: true });
    const cloud = withCard(defaultProgress(), 'a', 1, 'learning', { bookmarked: false });
    expect(mergeProgress(local, cloud).cards['a'].bookmarked).toBe(true);
  });

  it('takes the higher streak', () => {
    const local = { ...defaultProgress(), streak: { count: 2, lastDay: '2026-06-09' } };
    const cloud = { ...defaultProgress(), streak: { count: 7, lastDay: '2026-06-12' } };
    expect(mergeProgress(local, cloud).streak.count).toBe(7);
  });

  it('merges drill results and dedupes sims', () => {
    const local: Progress = { ...defaultProgress(), drills: { d1: { correct: false, attempts: 2 } }, sims: [{ id: 's1', ts: 1, score: 50, grade: 'D', cpl: 100, leads: 5, note: 'x' }] };
    const cloud: Progress = { ...defaultProgress(), drills: { d1: { correct: true, attempts: 1 } }, sims: [{ id: 's1', ts: 1, score: 50, grade: 'D', cpl: 100, leads: 5, note: 'x' }, { id: 's2', ts: 2, score: 80, grade: 'B', cpl: 60, leads: 9, note: 'y' }] };
    const m = mergeProgress(local, cloud);
    expect(m.drills['d1']).toEqual({ correct: true, attempts: 2 });
    expect(m.sims.map((s) => s.id).sort()).toEqual(['s1', 's2']);
  });

  it('is order-independent for card state', () => {
    const a = withCard(defaultProgress(), 'a', 1, 'learning');
    const b = withCard(defaultProgress(), 'a', 3, 'known');
    expect(mergeProgress(a, b).cards['a'].box).toBe(mergeProgress(b, a).cards['a'].box);
  });
});
