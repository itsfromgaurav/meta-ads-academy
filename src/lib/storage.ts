import type { Progress } from '../types';

const KEY = 'meta-ads-academy:v1';

export function defaultProgress(): Progress {
  return {
    cards: {},
    streak: { count: 0, lastDay: '' },
    dailyGoal: 12,
    history: {},
    drills: {},
    sims: [],
    version: 1,
  };
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw) as Progress;
    return { ...defaultProgress(), ...parsed };
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

export function clearProgress(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
