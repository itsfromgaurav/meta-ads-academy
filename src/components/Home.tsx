import { useMemo } from 'react';
import { Flame, BookOpen, Bookmark, Sparkles, ChevronRight, FlaskConical, Dumbbell } from 'lucide-react';
import type { Store } from '../lib/useStore';
import { masteryStats } from '../lib/srs';
import { hasDrills } from '../data/drills';

interface Props {
  store: Store;
  onStart: () => void;
  onBrowse: () => void;
  onBookmarks: () => void;
  onSimulator: () => void;
  onDrills: (domain: string, title: string) => void;
}

const GOALS = [6, 12, 20];

export default function Home({ store, onStart, onBrowse, onBookmarks, onSimulator, onDrills }: Props) {
  const { course, progress, available, mastery, bookmarks } = store;
  const studyCount = Math.min(progress.dailyGoal, available.due + available.fresh);

  const moduleStats = useMemo(
    () =>
      course.modules.map((m) => ({
        ...m,
        stats: masteryStats(m.cards, progress),
      })),
    [course.modules, progress],
  );

  return (
    <div className="mx-auto w-full max-w-md px-5 pb-16">
      {/* hero */}
      <header className="pt-12 pb-8">
        <div className="mb-3 flex items-center gap-2 font-body text-[11px] uppercase tracking-[0.22em] text-indigo-soft">
          <Sparkles size={13} /> Meta Ads Academy
        </div>
        <h1 className="font-display text-[44px] font-medium leading-[0.98] tracking-tight text-white">
          Learn Facebook
          <br />
          ads, one swipe
          <br />
          at a time.
        </h1>
        <p className="mt-4 max-w-xs font-body text-[14px] font-light leading-relaxed text-zinc-400">
          {course.cards.length} bite-size cards distilled from the Ultimate Guide to Facebook
          Advertising — corrected for {new Date().getFullYear()}.
        </p>
      </header>

      {/* stat row */}
      <div className="mb-5 grid grid-cols-3 gap-2">
        <Stat icon={<Flame size={15} />} value={progress.streak.count} label="day streak" accent="#FB7185" />
        <Stat icon={<BookOpen size={15} />} value={`${mastery.pct}%`} label="mastered" accent="#34D399" />
        <Stat icon={<Bookmark size={15} />} value={bookmarks.length} label="saved" accent="#818CF8" />
      </div>

      {/* daily session card */}
      <div className="shell mb-4">
        <div className="dotfield rounded-[2px] bg-ink/95 p-6">
          <div className="mb-1 font-body text-[11px] uppercase tracking-[0.18em] text-faint">
            Today&apos;s session
          </div>
          <div className="mb-4 flex items-baseline gap-2">
            <span className="font-display text-[40px] font-medium leading-none text-white">{studyCount}</span>
            <span className="font-body text-[13px] text-muted">cards</span>
            {available.due > 0 && (
              <span className="ml-auto rounded-[2px] bg-amber-400/12 px-2 py-1 font-body text-[11px] text-amber-300">
                {available.due} due for review
              </span>
            )}
          </div>

          <div className="mb-5 flex items-center gap-2">
            <span className="font-body text-[11px] text-faint">Daily goal</span>
            {GOALS.map((g) => (
              <button
                key={g}
                onClick={() => store.setDailyGoal(g)}
                className={`rounded-[2px] px-2.5 py-1 font-body text-[12px] transition-colors ${
                  progress.dailyGoal === g
                    ? 'bg-indigo text-white'
                    : 'bg-white/5 text-muted hover:bg-white/10'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <button
            onClick={onStart}
            disabled={studyCount === 0}
            className="group flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 font-body text-[14px] font-medium text-black transition-all hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {studyCount === 0 ? 'All caught up — come back tomorrow' : "Start learning"}
            {studyCount > 0 && <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />}
          </button>
        </div>
      </div>

      {/* practice — paper trading sandbox */}
      <button
        onClick={onSimulator}
        className="group mb-3 flex w-full items-center gap-4 rounded-[2px] border border-indigo/30 bg-indigo/8 px-5 py-4 text-left transition-colors hover:bg-indigo/14"
      >
        <FlaskConical size={22} className="flex-none text-indigo-soft" />
        <div className="flex-1">
          <div className="font-display text-[16px] font-medium text-white">Campaign Simulator</div>
          <div className="font-body text-[12px] text-zinc-400">
            Paper-trade a campaign risk-free — build, launch, get coached.
          </div>
        </div>
        <ChevronRight size={16} className="text-indigo-soft transition-transform group-hover:translate-x-0.5" />
      </button>

      {/* secondary actions */}
      <div className="mb-8 grid grid-cols-2 gap-2">
        <button
          onClick={onBrowse}
          className="flex items-center justify-between rounded-[2px] border border-white/8 bg-surface px-4 py-3 font-body text-[13px] text-zinc-300 transition-colors hover:border-white/20"
        >
          Browse modules <ChevronRight size={15} className="text-faint" />
        </button>
        <button
          onClick={onBookmarks}
          className="flex items-center justify-between rounded-[2px] border border-white/8 bg-surface px-4 py-3 font-body text-[13px] text-zinc-300 transition-colors hover:border-white/20"
        >
          Saved cards <ChevronRight size={15} className="text-faint" />
        </button>
      </div>

      {/* module progress */}
      <div className="mb-3 font-body text-[11px] uppercase tracking-[0.18em] text-faint">
        The curriculum · {course.modules.length} modules
      </div>
      <div className="space-y-1.5">
        {moduleStats.map((m) => (
          <div
            key={m.domain}
            className="flex items-center gap-3 rounded-[2px] border border-white/5 bg-surface px-4 py-3 transition-colors hover:border-white/15"
          >
            <button onClick={onBrowse} className="flex min-w-0 flex-1 items-center gap-3 text-left">
              <span className="font-display text-[13px] tabular-nums text-faint">
                {String(m.index + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-body text-[14px] text-zinc-200">{m.title}</div>
                <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full bg-white/8">
                  <div className="h-full rounded-full bg-indigo/70" style={{ width: `${m.stats.pct}%` }} />
                </div>
              </div>
            </button>
            {hasDrills(m.domain) && (
              <button
                onClick={() => onDrills(m.domain, m.title)}
                title="Apply drills"
                className="flex flex-none items-center gap-1 rounded-[2px] border border-indigo/30 px-2 py-1.5 font-body text-[11px] text-indigo-soft transition-colors hover:bg-indigo/12"
              >
                <Dumbbell size={12} /> Apply
              </button>
            )}
          </div>
        ))}
      </div>

      <footer className="mt-10 flex items-center justify-between border-t border-white/5 pt-5 font-body text-[11px] text-faint">
        <span>{mastery.known} known · {mastery.learning} learning · {mastery.neww} new</span>
        <button onClick={store.reset} className="transition-colors hover:text-rose-400">
          Reset progress
        </button>
      </footer>
    </div>
  );
}

function Stat({ icon, value, label, accent }: { icon: React.ReactNode; value: React.ReactNode; label: string; accent: string }) {
  return (
    <div className="rounded-[2px] border border-white/6 bg-surface px-3 py-3">
      <div className="mb-1.5" style={{ color: accent }}>
        {icon}
      </div>
      <div className="font-display text-[22px] font-medium leading-none text-white">{value}</div>
      <div className="mt-1 font-body text-[10px] uppercase tracking-wider text-faint">{label}</div>
    </div>
  );
}
