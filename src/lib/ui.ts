import type { CardType } from '../types';

export interface TypeMeta {
  label: string;
  color: string; // text/border accent
  bg: string; // chip background
}

export const TYPE_META: Record<string, TypeMeta> = {
  framework: { label: 'Framework', color: '#818CF8', bg: 'rgba(129,140,248,0.12)' },
  process_steps: { label: 'Process', color: '#818CF8', bg: 'rgba(129,140,248,0.12)' },
  tactic: { label: 'Tactic', color: '#34D399', bg: 'rgba(52,211,153,0.12)' },
  checklist: { label: 'Checklist', color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
  benchmark: { label: 'Benchmark', color: '#FBBF24', bg: 'rgba(251,191,36,0.12)' },
  metric_benchmark: { label: 'Benchmark', color: '#FBBF24', bg: 'rgba(251,191,36,0.12)' },
  template: { label: 'Template', color: '#F472B6', bg: 'rgba(244,114,182,0.12)' },
  template_copy: { label: 'Template', color: '#F472B6', bg: 'rgba(244,114,182,0.12)' },
  pitfall: { label: 'Pitfall', color: '#FB7185', bg: 'rgba(251,113,133,0.12)' },
  concept: { label: 'Concept', color: '#9CA3AF', bg: 'rgba(156,163,175,0.12)' },
};

export function typeMeta(t: CardType | string): TypeMeta {
  return TYPE_META[t] ?? TYPE_META.concept;
}

export const DIFFICULTY_LABEL: Record<number, string> = {
  1: 'Beginner',
  2: 'Intermediate',
  3: 'Advanced',
};
