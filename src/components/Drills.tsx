import { useMemo, useState } from 'react';
import { ChevronLeft, Check, X, ArrowUp, ArrowDown, Lightbulb, Trophy } from 'lucide-react';
import type { Drill } from '../data/drills';
import { gradeDrill } from '../data/drills';
import type { Store } from '../lib/useStore';

interface Props {
  store: Store;
  domain: string;
  title: string;
  drills: Drill[];
  onBack: () => void;
}

// deterministic shuffle seeded by id (stable across renders)
function seededOrder(n: number, seedStr: string): number[] {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    h = (Math.imul(h, 48271) + 1) >>> 0;
    const j = h % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // avoid the already-correct identity order for order-drills
  if (arr.every((v, i) => v === i) && n > 1) [arr[0], arr[1]] = [arr[1], arr[0]];
  return arr;
}

export default function Drills({ store, title, drills, onBack }: Props) {
  const [i, setI] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const drill = drills[i];

  if (!drill) {
    return (
      <div className="mx-auto w-full max-w-md px-5 py-20 text-center">
        <p className="font-body text-zinc-400">No drills for this module yet.</p>
        <button onClick={onBack} className="mt-4 font-body text-[13px] text-indigo-soft">
          ← Back
        </button>
      </div>
    );
  }

  function next(wasCorrect: boolean) {
    store.recordDrill(drill.id, wasCorrect);
    if (wasCorrect) setCorrectCount((n) => n + 1);
    if (i + 1 >= drills.length) setDone(true);
    else setI(i + 1);
  }

  if (done) {
    const pct = Math.round((correctCount / drills.length) * 100);
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 text-center">
        <Trophy size={40} className="mb-5 text-amber-300" />
        <h2 className="font-display text-[32px] font-medium text-white">Drills complete</h2>
        <p className="mt-2 font-body text-[14px] text-zinc-400">
          {title} · scored <span className="text-emerald-400">{correctCount}</span> / {drills.length} ({pct}%)
        </p>
        <button
          onClick={onBack}
          className="mt-8 rounded-full bg-white px-6 py-3 font-body text-[14px] font-medium text-black transition-colors hover:bg-zinc-200"
        >
          Back to modules
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md px-5 pb-16">
      <div className="flex items-center justify-between py-5">
        <button onClick={onBack} className="text-faint transition-colors hover:text-white">
          <ChevronLeft size={20} />
        </button>
        <div className="font-body text-[12px] text-muted">
          {i + 1} <span className="text-white/20">/</span> {drills.length}
        </div>
        <div className="font-body text-[12px] text-emerald-400">{correctCount} correct</div>
      </div>

      <div className="mb-5 h-[3px] w-full overflow-hidden rounded-full bg-white/8">
        <div className="h-full rounded-full bg-indigo transition-all" style={{ width: `${(i / drills.length) * 100}%` }} />
      </div>

      <div className="mb-1 font-body text-[11px] uppercase tracking-[0.18em] text-faint">
        Apply · {title}
      </div>

      <DrillCard key={drill.id} drill={drill} onNext={next} />
    </div>
  );
}

function DrillCard({ drill, onNext }: { drill: Drill; onNext: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<number[]>([]);
  const [order, setOrder] = useState<number[]>(() =>
    drill.kind === 'order' ? seededOrder(drill.options.length, drill.id) : [],
  );
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);

  const canSubmit = drill.kind === 'order' ? true : selected.length > 0;

  function submit() {
    const response = drill.kind === 'order' ? order : drill.kind === 'mcq' ? selected[0] : selected;
    const ok = gradeDrill(drill, response);
    setCorrect(ok);
    setSubmitted(true);
  }

  function toggle(idx: number) {
    if (submitted) return;
    if (drill.kind === 'mcq') setSelected([idx]);
    else setSelected((s) => (s.includes(idx) ? s.filter((x) => x !== idx) : [...s, idx]));
  }

  function move(pos: number, dir: -1 | 1) {
    if (submitted) return;
    const np = pos + dir;
    if (np < 0 || np >= order.length) return;
    const copy = order.slice();
    [copy[pos], copy[np]] = [copy[np], copy[pos]];
    setOrder(copy);
  }

  const correctSet = useMemo(() => {
    if (drill.kind === 'mcq') return new Set([drill.answer as number]);
    if (drill.kind === 'multi') return new Set(drill.answer as number[]);
    return new Set<number>();
  }, [drill]);

  return (
    <div className="shell">
      <div
        className={`rounded-[2px] bg-ink p-6 ${submitted && !correct ? 'animate-nudge' : ''}`}
      >
        <p className="font-body text-[14px] leading-relaxed text-zinc-300">{drill.scenario}</p>
        <h3 className="mt-3 font-display text-[19px] font-medium leading-snug text-white">{drill.question}</h3>

        <div className="mt-5 space-y-2">
          {drill.kind === 'order'
            ? order.map((optIdx, pos) => (
                <div
                  key={optIdx}
                  className={`flex items-center gap-2 rounded-[2px] border px-3 py-2.5 ${
                    submitted
                      ? optIdx === pos
                        ? 'border-emerald-400/40 bg-emerald-400/8'
                        : 'border-rose-400/40 bg-rose-400/8'
                      : 'border-white/10 bg-surface'
                  }`}
                >
                  <span className="font-display text-[12px] tabular-nums text-faint">{pos + 1}</span>
                  <span className="flex-1 font-body text-[13px] text-zinc-200">{drill.options[optIdx]}</span>
                  {!submitted && (
                    <span className="flex flex-col">
                      <button onClick={() => move(pos, -1)} className="text-faint hover:text-white">
                        <ArrowUp size={13} />
                      </button>
                      <button onClick={() => move(pos, 1)} className="text-faint hover:text-white">
                        <ArrowDown size={13} />
                      </button>
                    </span>
                  )}
                </div>
              ))
            : drill.options.map((opt, idx) => {
                const isSel = selected.includes(idx);
                const isRight = correctSet.has(idx);
                let cls = 'border-white/10 bg-surface';
                if (submitted) {
                  if (isRight) cls = 'border-emerald-400/50 bg-emerald-400/10';
                  else if (isSel) cls = 'border-rose-400/50 bg-rose-400/10';
                } else if (isSel) cls = 'border-indigo/60 bg-indigo/10';
                return (
                  <button
                    key={idx}
                    data-testid="drill-option"
                    onClick={() => toggle(idx)}
                    disabled={submitted}
                    className={`flex w-full items-center gap-3 rounded-[2px] border px-3 py-2.5 text-left transition-colors ${cls}`}
                  >
                    <span
                      className={`flex h-4 w-4 flex-none items-center justify-center rounded-full border ${
                        isSel ? 'border-indigo bg-indigo' : 'border-white/30'
                      } ${drill.kind === 'mcq' ? 'rounded-full' : 'rounded-[2px]'}`}
                    >
                      {submitted && isRight && <Check size={11} />}
                      {submitted && isSel && !isRight && <X size={11} />}
                    </span>
                    <span className="font-body text-[13px] text-zinc-200">{opt}</span>
                  </button>
                );
              })}
        </div>

        {submitted ? (
          <div className="mt-5">
            <div
              className={`mb-3 flex items-center gap-2 font-body text-[13px] font-medium ${
                correct ? 'text-emerald-400 animate-pop' : 'text-rose-400'
              }`}
            >
              {correct ? <Check size={16} /> : <X size={16} />} {correct ? 'Correct' : 'Not quite'}
            </div>
            <div className="flex gap-2 rounded-[2px] border-l-2 border-indigo/50 bg-indigo/5 p-3">
              <Lightbulb size={15} className="mt-0.5 flex-none text-indigo-soft" />
              <p className="font-body text-[13px] leading-relaxed text-zinc-300">{drill.explanation}</p>
            </div>
            <button
              onClick={() => onNext(correct)}
              className="press mt-4 w-full rounded-full bg-white py-2.5 font-body text-[14px] font-medium text-black transition-colors hover:bg-zinc-200"
            >
              Continue
            </button>
          </div>
        ) : (
          <button
            onClick={submit}
            disabled={!canSubmit}
            className="press mt-5 w-full rounded-full bg-indigo py-2.5 font-body text-[14px] font-medium text-white transition-colors hover:bg-indigo-deep disabled:cursor-not-allowed disabled:opacity-40"
          >
            Check answer
          </button>
        )}
      </div>
    </div>
  );
}
