export type CardType =
  | 'framework'
  | 'process_steps'
  | 'tactic'
  | 'checklist'
  | 'benchmark'
  | 'metric_benchmark'
  | 'template'
  | 'template_copy'
  | 'pitfall'
  | 'concept';

export interface Card {
  id: string;
  type: CardType;
  title: string;
  front: string;
  back: string;
  example?: string;
  tags: string[];
  difficulty: 1 | 2 | 3;
  chapter?: string;
  // injected at load time:
  domain: string;
  moduleTitle: string;
  moduleIndex: number;
  globalIndex: number;
}

export interface Module {
  domain: string;
  title: string;
  index: number;
  cards: Card[];
}

export interface Course {
  modules: Module[];
  cards: Card[];
  byId: Record<string, Card>;
}

export type SwipeAction = 'known' | 'review' | 'skip';

export interface CardProgress {
  box: number; // Leitner box 0..5
  due: number; // epoch ms when next due
  status: 'new' | 'learning' | 'known';
  bookmarked: boolean;
  seen: number; // times seen
  lastSeen: number;
}

export interface DrillResult {
  correct: boolean;
  attempts: number;
}

export interface SimRun {
  id: string;
  ts: number;
  score: number;
  grade: string;
  cpl: number;
  leads: number;
  note: string; // short headline of the config
}

export interface Progress {
  cards: Record<string, CardProgress>;
  streak: { count: number; lastDay: string };
  dailyGoal: number;
  history: Record<string, number>; // ISO day -> cards learned
  drills: Record<string, DrillResult>; // drillId -> result
  sims: SimRun[]; // saved simulator runs (newest first)
  version: number;
}
