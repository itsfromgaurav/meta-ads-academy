import { describe, it, expect } from 'vitest';
import { course, MODULE_ORDER } from './course';

const VALID_TYPES = new Set([
  'framework',
  'process_steps',
  'tactic',
  'checklist',
  'benchmark',
  'metric_benchmark',
  'template',
  'template_copy',
  'pitfall',
  'concept',
]);

describe('course data integrity', () => {
  it('loads a substantial number of cards', () => {
    expect(course.cards.length).toBeGreaterThan(300);
  });

  it('loads all 15 modules', () => {
    expect(course.modules.length).toBe(15);
  });

  it('orders modules by the Flight Plan sequence', () => {
    const domains = course.modules.map((m) => m.domain);
    const expected = MODULE_ORDER.filter((d) => domains.includes(d));
    expect(domains).toEqual(expected);
  });

  it('every card has the required fields and valid values', () => {
    for (const c of course.cards) {
      expect(c.id, 'id').toBeTruthy();
      expect(c.title, `title for ${c.id}`).toBeTruthy();
      expect(c.front, `front for ${c.id}`).toBeTruthy();
      expect(c.back, `back for ${c.id}`).toBeTruthy();
      expect(VALID_TYPES.has(c.type), `type "${c.type}" for ${c.id}`).toBe(true);
      expect([1, 2, 3], `difficulty for ${c.id}`).toContain(c.difficulty);
      expect(Array.isArray(c.tags), `tags for ${c.id}`).toBe(true);
    }
  });

  it('has globally unique card ids', () => {
    const ids = course.cards.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('assigns a contiguous globalIndex', () => {
    course.cards.forEach((c, i) => expect(c.globalIndex).toBe(i));
    expect(course.byId[course.cards[0].id]).toBe(course.cards[0]);
  });
});
