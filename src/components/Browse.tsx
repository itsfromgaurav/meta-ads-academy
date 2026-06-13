import { useMemo, useState } from 'react';
import { ChevronLeft, Play, Search, Dumbbell } from 'lucide-react';
import type { Card } from '../types';
import type { Store } from '../lib/useStore';
import { masteryStats } from '../lib/srs';
import { typeMeta } from '../lib/ui';
import { hasDrills } from '../data/drills';

interface Props {
  store: Store;
  onBack: () => void;
  onStudy: (cards: Card[]) => void;
  onDrills: (domain: string, title: string) => void;
}

export default function Browse({ store, onBack, onStudy, onDrills }: Props) {
  const { course, progress } = store;
  const [openModule, setOpenModule] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return course.cards.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.front.toLowerCase().includes(q) ||
        c.back.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [query, course.cards]);

  return (
    <div className="mx-auto w-full max-w-md px-5 pb-16">
      <div className="flex items-center gap-2 py-5">
        <button onClick={onBack} className="text-faint transition-colors hover:text-white">
          <ChevronLeft size={20} />
        </button>
        <h2 className="font-display text-[20px] font-medium text-white">Browse the curriculum</h2>
      </div>

      {/* search */}
      <div className="mb-5 flex items-center gap-2 rounded-[2px] border border-white/8 bg-surface px-3 py-2.5">
        <Search size={15} className="text-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search cards, tags, frameworks…"
          className="w-full bg-transparent font-body text-[14px] text-white placeholder:text-faint focus:outline-none"
        />
      </div>

      {filtered ? (
        <div>
          <div className="mb-3 font-body text-[11px] uppercase tracking-wider text-faint">
            {filtered.length} result{filtered.length !== 1 && 's'}
          </div>
          {filtered.length > 0 && (
            <button
              onClick={() => onStudy(filtered)}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-full bg-indigo py-2.5 font-body text-[13px] font-medium text-white transition-colors hover:bg-indigo-deep"
            >
              <Play size={14} /> Study these {filtered.length}
            </button>
          )}
          <div className="space-y-1.5">
            {filtered.map((c) => (
              <CardRow key={c.id} card={c} />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {course.modules.map((m) => {
            const st = masteryStats(m.cards, progress);
            const open = openModule === m.domain;
            return (
              <div key={m.domain} className="overflow-hidden rounded-[2px] border border-white/6 bg-surface">
                <button
                  onClick={() => setOpenModule(open ? null : m.domain)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <span className="font-display text-[13px] tabular-nums text-faint">
                    {String(m.index + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-body text-[14px] text-zinc-100">{m.title}</div>
                    <div className="font-body text-[11px] text-faint">
                      {m.cards.length} cards · {st.pct}% mastered
                    </div>
                  </div>
                </button>
                {open && (
                  <div className="border-t border-white/5 px-4 py-3">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => onStudy(m.cards)}
                        className="flex items-center gap-2 rounded-full bg-indigo px-4 py-1.5 font-body text-[12px] font-medium text-white transition-colors hover:bg-indigo-deep"
                      >
                        <Play size={13} /> Study this module
                      </button>
                      {hasDrills(m.domain) && (
                        <button
                          onClick={() => onDrills(m.domain, m.title)}
                          className="flex items-center gap-2 rounded-full border border-indigo/40 px-4 py-1.5 font-body text-[12px] font-medium text-indigo-soft transition-colors hover:bg-indigo/12"
                        >
                          <Dumbbell size={13} /> Apply (drills)
                        </button>
                      )}
                    </div>
                    <div className="space-y-1">
                      {m.cards.map((c) => (
                        <CardRow key={c.id} card={c} compact />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CardRow({ card, compact }: { card: Card; compact?: boolean }) {
  const meta = typeMeta(card.type);
  return (
    <div
      className={`flex items-center gap-2.5 rounded-[2px] ${
        compact ? '' : 'border border-white/5 bg-surface'
      } px-2.5 py-2`}
    >
      <span className="h-1.5 w-1.5 flex-none rounded-full" style={{ background: meta.color }} />
      <span className="min-w-0 flex-1 truncate font-body text-[13px] text-zinc-300">{card.title}</span>
      <span className="flex-none font-body text-[10px] uppercase tracking-wider" style={{ color: meta.color }}>
        {meta.label}
      </span>
    </div>
  );
}
