import { useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Check, RotateCcw, X } from 'lucide-react';
import type { Card, SwipeAction } from '../types';
import type { Store } from '../lib/useStore';
import SwipeCard, { type SwipeCardHandle } from './SwipeCard';
import SwipeCoach from './SwipeCoach';

interface Props {
  store: Store;
  queue: Card[];
  onComplete: (learned: number) => void;
  onExit: () => void;
  showCoach?: boolean;
  onCoachSeen?: () => void;
}

export default function Deck({ store, queue, onComplete, onExit, showCoach, onCoachSeen }: Props) {
  const [index, setIndex] = useState(0);
  const [learned, setLearned] = useState(0);
  const [coach, setCoach] = useState(!!showCoach);
  const activeCard = useRef<SwipeCardHandle>(null);
  const total = queue.length;
  const card = queue[index];

  function dismissCoach() {
    setCoach(false);
    onCoachSeen?.();
  }

  // route button taps through the card so it flings off-screen, then resolves
  function act(action: SwipeAction) {
    if (activeCard.current) activeCard.current.fling(action);
    else resolve(action);
  }

  const top3 = useMemo(() => queue.slice(index, index + 3).reverse(), [queue, index]);

  function resolve(action: SwipeAction) {
    if (!card) return;
    if (coach) dismissCoach();
    store.recordSwipe(card, action);
    if (action === 'known') setLearned((n) => n + 1);
    const next = index + 1;
    if (next >= total) {
      onComplete(action === 'known' ? learned + 1 : learned);
    } else {
      setIndex(next);
    }
  }

  if (!card) return null;

  return (
    <div className="mx-auto flex h-full w-full max-w-md flex-col px-5">
      {/* session header */}
      <div className="flex items-center justify-between py-5">
        <button
          onClick={onExit}
          className="font-body text-[13px] text-faint transition-colors hover:text-white"
        >
          ← Exit
        </button>
        <div className="font-body text-[12px] tracking-wider text-muted">
          {index + 1} <span className="text-white/20">/</span> {total}
        </div>
        <div className="font-body text-[12px] text-emerald-400">{learned} learned</div>
      </div>

      {/* progress bar */}
      <div className="mb-6 h-[3px] w-full overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-indigo transition-all duration-300"
          style={{ width: `${(index / total) * 100}%` }}
        />
      </div>

      {/* card stack */}
      <div className="relative flex-1">
        {coach && <SwipeCoach onDismiss={dismissCoach} />}
        <AnimatePresence>
          {top3.map((c, i) => {
            const depth = top3.length - 1 - i; // 0 = top
            const isTop = c.id === card.id;
            return (
              <div
                key={c.id}
                className="absolute inset-0"
                style={{
                  transform: `scale(${1 - depth * 0.04}) translateY(${depth * 10}px)`,
                  zIndex: 10 - depth,
                  opacity: depth > 1 ? 0 : 1,
                  transition: 'transform 0.2s ease, opacity 0.2s ease',
                  pointerEvents: isTop ? 'auto' : 'none',
                }}
              >
                <SwipeCard
                  ref={isTop ? activeCard : undefined}
                  card={c}
                  active={isTop}
                  bookmarked={!!store.progress.cards[c.id]?.bookmarked}
                  onResolve={resolve}
                  onBookmark={() => store.toggleBookmark(c)}
                />
              </div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* action buttons */}
      <div className="flex items-center justify-center gap-5 py-7">
        <button
          onClick={() => act('review')}
          className="press flex h-14 w-14 items-center justify-center rounded-full border border-rose-400/30 bg-rose-400/5 text-rose-400 transition-all hover:scale-105 hover:bg-rose-400/15"
          aria-label="Review again"
        >
          <X size={22} />
        </button>
        <button
          onClick={() => act('skip')}
          className="press flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-faint transition-all hover:scale-105 hover:text-white"
          aria-label="Skip"
        >
          <RotateCcw size={16} />
        </button>
        <button
          onClick={() => act('known')}
          className="press flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/5 text-emerald-400 transition-all hover:scale-105 hover:bg-emerald-400/15"
          aria-label="Got it"
        >
          <Check size={22} />
        </button>
      </div>
      <p className="pb-5 text-center font-body text-[11px] text-faint">
        Swipe right · got it  ·  left · review  ·  up · bookmark  ·  tap · flip
      </p>
    </div>
  );
}
