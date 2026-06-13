import type { Card, CardProgress, Progress, SwipeAction } from '../types';

// Leitner box intervals in days. Box 0 = re-show same day.
const INTERVALS_DAYS = [0, 1, 2, 4, 7, 15];
const DAY_MS = 24 * 60 * 60 * 1000;

export function isoDay(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

export function getCardProgress(p: Progress, id: string): CardProgress | undefined {
  return p.cards[id];
}

/** Apply a swipe to one card and return the next CardProgress. Pure. */
export function applySwipe(
  prev: CardProgress | undefined,
  action: SwipeAction,
  now: number,
): CardProgress {
  const base: CardProgress =
    prev ?? { box: 0, due: 0, status: 'new', bookmarked: false, seen: 0, lastSeen: 0 };

  if (action === 'skip') {
    // bookmark toggle is handled separately; skip just records a view without scheduling
    return { ...base, seen: base.seen + 1, lastSeen: now };
  }

  let box = base.box;
  if (action === 'known') box = Math.min(INTERVALS_DAYS.length - 1, box + 1);
  else box = Math.max(0, box - 1); // review -> demote

  const intervalDays = INTERVALS_DAYS[box];
  const due = now + intervalDays * DAY_MS;
  const status: CardProgress['status'] =
    action === 'known' ? (box >= 2 ? 'known' : 'learning') : 'learning';

  return { ...base, box, due, status, seen: base.seen + 1, lastSeen: now };
}

/** Is a card due for (re)review right now? */
export function isDue(cp: CardProgress | undefined, now: number): boolean {
  if (!cp || cp.status === 'new') return false;
  return cp.due <= now;
}

export interface SessionOptions {
  goal: number;
  now: number;
}

/**
 * Build today's session deck:
 *  1. due review cards (in due order),
 *  2. then brand-new cards in course order,
 *  up to `goal`. Returns the ordered card list.
 */
export function buildSession(cards: Card[], p: Progress, opts: SessionOptions): Card[] {
  const { goal, now } = opts;

  const due: Card[] = [];
  const fresh: Card[] = [];
  for (const c of cards) {
    const cp = p.cards[c.id];
    if (!cp || cp.status === 'new') fresh.push(c);
    else if (cp.due <= now) due.push(c);
  }

  due.sort((a, b) => (p.cards[a.id]!.due - p.cards[b.id]!.due));
  fresh.sort((a, b) => a.globalIndex - b.globalIndex);

  return [...due, ...fresh].slice(0, Math.max(1, goal));
}

/** Count how many cards are available to study right now. */
export function availableCount(cards: Card[], p: Progress, now: number): { due: number; fresh: number } {
  let due = 0;
  let fresh = 0;
  for (const c of cards) {
    const cp = p.cards[c.id];
    if (!cp || cp.status === 'new') fresh++;
    else if (cp.due <= now) due++;
  }
  return { due, fresh };
}

/** Update streak after completing study on a given day. Pure. */
export function bumpStreak(streak: Progress['streak'], now: number): Progress['streak'] {
  const today = isoDay(now);
  if (streak.lastDay === today) return streak; // already counted today
  const yesterday = isoDay(now - DAY_MS);
  const count = streak.lastDay === yesterday ? streak.count + 1 : 1;
  return { count, lastDay: today };
}

export function masteryStats(cards: Card[], p: Progress) {
  let known = 0;
  let learning = 0;
  let neww = 0;
  for (const c of cards) {
    const cp = p.cards[c.id];
    if (!cp || cp.status === 'new') neww++;
    else if (cp.status === 'known') known++;
    else learning++;
  }
  const total = cards.length || 1;
  return { known, learning, neww, total, pct: Math.round(((known + learning) / total) * 100) };
}
