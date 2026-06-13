import type { Card, Course, Module } from '../types';

// Learning order — the Facebook Flight Plan sequence.
export const MODULE_ORDER: string[] = [
  'strategy_mindset',
  'account_setup',
  'pixel_tracking',
  'audiences_targeting',
  'funnels_offers',
  'campaign_objectives',
  'adset_structure_budget',
  'ad_copy',
  'hooks_messaging',
  'creative_design',
  'video_ads',
  'boosted_posts',
  'reporting_optimization',
  'scaling',
  'troubleshooting',
];

interface RawModule {
  domain: string;
  module_title: string;
  cards: Omit<Card, 'domain' | 'moduleTitle' | 'moduleIndex' | 'globalIndex'>[];
}

// Eagerly import every card JSON. New files are picked up automatically.
const files = import.meta.glob('./cards/*.json', { eager: true }) as Record<
  string,
  { default: RawModule }
>;

const rawByDomain: Record<string, RawModule> = {};
for (const path in files) {
  const mod = files[path].default;
  if (mod && Array.isArray(mod.cards)) rawByDomain[mod.domain] = mod;
}

function buildCourse(): Course {
  const modules: Module[] = [];
  const cards: Card[] = [];
  const byId: Record<string, Card> = {};

  // Known order first, then any extra domains not in the list.
  const domains = [
    ...MODULE_ORDER.filter((d) => rawByDomain[d]),
    ...Object.keys(rawByDomain).filter((d) => !MODULE_ORDER.includes(d)),
  ];

  domains.forEach((domain, moduleIndex) => {
    const raw = rawByDomain[domain];
    const moduleCards: Card[] = raw.cards.map((c) => {
      const card: Card = {
        ...c,
        domain,
        moduleTitle: raw.module_title,
        moduleIndex,
        globalIndex: 0, // set below
      };
      return card;
    });
    modules.push({ domain, title: raw.module_title, index: moduleIndex, cards: moduleCards });
    cards.push(...moduleCards);
  });

  cards.forEach((c, i) => {
    c.globalIndex = i;
    byId[c.id] = c;
  });

  return { modules, cards, byId };
}

export const course: Course = buildCourse();
