import { MODULE_ORDER } from './course';

export type DrillKind = 'mcq' | 'multi' | 'order';

export interface Drill {
  id: string;
  kind: DrillKind;
  scenario: string;
  question: string;
  options: string[];
  answer: number | number[]; // mcq: index | multi: indexes | order: [] (options already in order)
  explanation: string;
  difficulty: 1 | 2 | 3;
  domain: string;
  moduleTitle: string;
}

interface RawDrills {
  domain: string;
  module_title: string;
  drills: Omit<Drill, 'domain' | 'moduleTitle'>[];
}

const files = import.meta.glob('./drills/*.json', { eager: true }) as Record<
  string,
  { default: RawDrills }
>;

const byDomain: Record<string, Drill[]> = {};
const titleByDomain: Record<string, string> = {};

for (const path in files) {
  const raw = files[path].default;
  if (!raw || !Array.isArray(raw.drills)) continue;
  titleByDomain[raw.domain] = raw.module_title;
  byDomain[raw.domain] = raw.drills.map((d) => ({
    ...d,
    domain: raw.domain,
    moduleTitle: raw.module_title,
  }));
}

export function drillsFor(domain: string): Drill[] {
  return byDomain[domain] ?? [];
}

export function hasDrills(domain: string): boolean {
  return (byDomain[domain]?.length ?? 0) > 0;
}

export const drillDomains = [
  ...MODULE_ORDER.filter((d) => byDomain[d]),
  ...Object.keys(byDomain).filter((d) => !MODULE_ORDER.includes(d)),
];

export const allDrills: Drill[] = drillDomains.flatMap((d) => byDomain[d]);

/** Grade an answer for a drill. Pure. */
export function gradeDrill(drill: Drill, response: number[] | number): boolean {
  if (drill.kind === 'mcq') {
    return response === drill.answer;
  }
  if (drill.kind === 'multi') {
    const want = (drill.answer as number[]).slice().sort();
    const got = (response as number[]).slice().sort();
    return want.length === got.length && want.every((v, i) => v === got[i]);
  }
  // order: response is the array of original indexes in the user's chosen order;
  // correct when it equals [0,1,2,...] (options are stored in correct order).
  const resp = response as number[];
  return resp.length === drill.options.length && resp.every((v, i) => v === i);
}
