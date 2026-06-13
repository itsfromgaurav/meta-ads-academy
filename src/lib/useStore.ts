import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Card, Progress, SwipeAction } from '../types';
import { course } from '../data/course';
import { clearProgress, defaultProgress, loadProgress, saveProgress } from './storage';
import { applySwipe, availableCount, bumpStreak, isoDay, masteryStats } from './srs';

export function now(): number {
  return Date.now();
}

export function useStore() {
  const [progress, setProgress] = useState<Progress>(() => loadProgress());

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const recordSwipe = useCallback((card: Card, action: SwipeAction) => {
    setProgress((p) => {
      const t = now();
      const next = applySwipe(p.cards[card.id], action, t);
      const learnedNow = action === 'known' && next.status !== 'new';
      const today = isoDay(t);
      const history = { ...p.history };
      if (learnedNow) history[today] = (history[today] ?? 0) + 1;
      const streak = action !== 'skip' ? bumpStreak(p.streak, t) : p.streak;
      return { ...p, cards: { ...p.cards, [card.id]: next }, history, streak };
    });
  }, []);

  const toggleBookmark = useCallback((card: Card) => {
    setProgress((p) => {
      const cur = p.cards[card.id] ?? {
        box: 0,
        due: 0,
        status: 'new' as const,
        bookmarked: false,
        seen: 0,
        lastSeen: 0,
      };
      return {
        ...p,
        cards: { ...p.cards, [card.id]: { ...cur, bookmarked: !cur.bookmarked } },
      };
    });
  }, []);

  const setDailyGoal = useCallback((goal: number) => {
    setProgress((p) => ({ ...p, dailyGoal: goal }));
  }, []);

  const recordDrill = useCallback((drillId: string, correct: boolean) => {
    setProgress((p) => {
      const prev = p.drills[drillId];
      return {
        ...p,
        drills: {
          ...p.drills,
          [drillId]: { correct: correct || !!prev?.correct, attempts: (prev?.attempts ?? 0) + 1 },
        },
      };
    });
  }, []);

  const saveSim = useCallback((run: import('../types').SimRun) => {
    setProgress((p) => ({ ...p, sims: [run, ...p.sims].slice(0, 20) }));
  }, []);

  const reset = useCallback(() => {
    clearProgress();
    setProgress(defaultProgress());
  }, []);

  const available = useMemo(
    () => availableCount(course.cards, progress, now()),
    [progress],
  );

  const mastery = useMemo(() => masteryStats(course.cards, progress), [progress]);

  const bookmarks = useMemo(
    () => course.cards.filter((c) => progress.cards[c.id]?.bookmarked),
    [progress],
  );

  return {
    course,
    progress,
    available,
    mastery,
    bookmarks,
    recordSwipe,
    toggleBookmark,
    setDailyGoal,
    recordDrill,
    saveSim,
    reset,
  };
}

export type Store = ReturnType<typeof useStore>;
