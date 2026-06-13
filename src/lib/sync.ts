import LZString from 'lz-string';
import type { CardProgress, Progress } from '../types';
import { defaultProgress } from './storage';

// --- compression for storing progress in Clerk user metadata (small size cap) ---
export function encodeProgress(p: Progress): string {
  return LZString.compressToBase64(JSON.stringify(p));
}

export function decodeProgress(s: string | undefined | null): Progress | null {
  if (!s) return null;
  try {
    const json = LZString.decompressFromBase64(s);
    if (!json) return null;
    const parsed = JSON.parse(json) as Progress;
    return { ...defaultProgress(), ...parsed };
  } catch {
    return null;
  }
}

const STATUS_RANK: Record<CardProgress['status'], number> = { new: 0, learning: 1, known: 2 };

function mergeCard(a: CardProgress, b: CardProgress): CardProgress {
  // keep the more-advanced study state; OR the bookmark; latest activity
  const primary = b.box > a.box ? b : a.box > b.box ? a : b.seen >= a.seen ? b : a;
  return {
    box: Math.max(a.box, b.box),
    due: primary.due,
    status: STATUS_RANK[a.status] >= STATUS_RANK[b.status] ? a.status : b.status,
    bookmarked: a.bookmarked || b.bookmarked,
    seen: Math.max(a.seen, b.seen),
    lastSeen: Math.max(a.lastSeen, b.lastSeen),
  };
}

/**
 * Merge two progress snapshots without losing data. Commutative on the parts
 * that matter, so syncing local <-> cloud in any order converges.
 */
export function mergeProgress(a: Progress, b: Progress): Progress {
  const cards: Progress['cards'] = { ...a.cards };
  for (const id in b.cards) {
    cards[id] = cards[id] ? mergeCard(cards[id], b.cards[id]) : b.cards[id];
  }

  const drills: Progress['drills'] = { ...a.drills };
  for (const id in b.drills) {
    const ex = drills[id];
    drills[id] = ex
      ? { correct: ex.correct || b.drills[id].correct, attempts: Math.max(ex.attempts, b.drills[id].attempts) }
      : b.drills[id];
  }

  const history: Progress['history'] = { ...a.history };
  for (const day in b.history) {
    history[day] = Math.max(history[day] ?? 0, b.history[day]);
  }

  const simsById = new Map<string, Progress['sims'][number]>();
  for (const s of [...a.sims, ...b.sims]) simsById.set(s.id, s);
  const sims = [...simsById.values()].sort((x, y) => y.ts - x.ts).slice(0, 20);

  // streak: higher count wins; keep the latest lastDay seen
  const streak =
    b.streak.count > a.streak.count
      ? b.streak
      : a.streak.count > b.streak.count
        ? a.streak
        : { count: a.streak.count, lastDay: a.streak.lastDay > b.streak.lastDay ? a.streak.lastDay : b.streak.lastDay };

  return {
    cards,
    drills,
    history,
    sims,
    streak,
    dailyGoal: a.dailyGoal, // keep this device's current preference
    version: Math.max(a.version, b.version),
  };
}
