import { describe, it, expect } from 'vitest';
import { allDrills, drillDomains, gradeDrill, drillsFor, type Drill } from './drills';

describe('drills data integrity', () => {
  it('loads drills for all 15 modules', () => {
    expect(drillDomains.length).toBe(15);
    expect(allDrills.length).toBeGreaterThan(80);
  });

  it('every drill is well-formed', () => {
    for (const d of allDrills) {
      expect(d.id, 'id').toBeTruthy();
      expect(['mcq', 'multi', 'order']).toContain(d.kind);
      expect(d.scenario && d.question, `text for ${d.id}`).toBeTruthy();
      expect(d.options.length, `options for ${d.id}`).toBeGreaterThanOrEqual(2);
      expect(d.explanation, `explanation for ${d.id}`).toBeTruthy();
      if (d.kind === 'mcq') {
        expect(typeof d.answer, `mcq answer for ${d.id}`).toBe('number');
        expect(d.answer as number).toBeLessThan(d.options.length);
      }
      if (d.kind === 'multi') {
        expect(Array.isArray(d.answer), `multi answer for ${d.id}`).toBe(true);
        for (const a of d.answer as number[]) expect(a).toBeLessThan(d.options.length);
      }
    }
  });

  it('has globally unique drill ids', () => {
    const ids = allDrills.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('drillsFor returns the right module', () => {
    const some = drillsFor(drillDomains[0]);
    expect(some.length).toBeGreaterThan(0);
    expect(some.every((d) => d.domain === drillDomains[0])).toBe(true);
  });
});

describe('gradeDrill', () => {
  it('grades mcq correctly', () => {
    const d: Drill = {
      id: 'x', kind: 'mcq', scenario: '', question: '', options: ['a', 'b', 'c'],
      answer: 1, explanation: '', difficulty: 1, domain: 'd', moduleTitle: 'm',
    };
    expect(gradeDrill(d, 1)).toBe(true);
    expect(gradeDrill(d, 0)).toBe(false);
  });

  it('grades multi regardless of selection order', () => {
    const d: Drill = {
      id: 'x', kind: 'multi', scenario: '', question: '', options: ['a', 'b', 'c', 'd'],
      answer: [1, 3], explanation: '', difficulty: 1, domain: 'd', moduleTitle: 'm',
    };
    expect(gradeDrill(d, [3, 1])).toBe(true);
    expect(gradeDrill(d, [1])).toBe(false);
    expect(gradeDrill(d, [1, 2, 3])).toBe(false);
  });

  it('grades order — correct only when sequence is identity', () => {
    const d: Drill = {
      id: 'x', kind: 'order', scenario: '', question: '', options: ['s1', 's2', 's3'],
      answer: [], explanation: '', difficulty: 1, domain: 'd', moduleTitle: 'm',
    };
    expect(gradeDrill(d, [0, 1, 2])).toBe(true);
    expect(gradeDrill(d, [1, 0, 2])).toBe(false);
  });
});
