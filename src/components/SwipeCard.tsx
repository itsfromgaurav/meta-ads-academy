import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from 'framer-motion';
import { Bookmark, RotateCw } from 'lucide-react';
import type { Card, SwipeAction } from '../types';
import { typeMeta, DIFFICULTY_LABEL } from '../lib/ui';

interface Props {
  card: Card;
  active: boolean;
  bookmarked: boolean;
  onResolve: (action: SwipeAction) => void;
  onBookmark: () => void;
}

export interface SwipeCardHandle {
  fling: (action: SwipeAction) => void;
}

const SWIPE_X = 110; // px threshold
const SWIPE_UP = 130;
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const SwipeCard = forwardRef<SwipeCardHandle, Props>(function SwipeCard(
  { card, active, bookmarked, onResolve, onBookmark },
  ref,
) {
  const [flipped, setFlipped] = useState(false);
  const reduce = useReducedMotion();
  const leaving = useRef(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-260, 260], [-16, 16]);
  const knownOpacity = useTransform(x, [20, SWIPE_X], [0, 1]);
  const reviewOpacity = useTransform(x, [-SWIPE_X, -20], [1, 0]);
  const meta = typeMeta(card.type);

  // fling the card off-screen in the decision's direction, then resolve
  function fling(action: SwipeAction) {
    if (leaving.current) return;
    leaving.current = true;
    if (reduce) {
      onResolve(action);
      return;
    }
    if (action === 'skip') {
      animate(y, -560, { duration: 0.24, ease: EASE_OUT_EXPO }).then(() => onResolve(action));
      return;
    }
    const dx = action === 'known' ? 560 : -560;
    animate(y, 40, { duration: 0.24, ease: EASE_OUT_EXPO });
    animate(x, dx, { duration: 0.24, ease: EASE_OUT_EXPO }).then(() => onResolve(action));
  }

  useImperativeHandle(ref, () => ({ fling }));

  function handleDragEnd(_: unknown, info: PanInfo) {
    const { offset } = info;
    if (offset.x > SWIPE_X) return fling('known');
    if (offset.x < -SWIPE_X) return fling('review');
    if (offset.y < -SWIPE_UP) {
      onBookmark();
      return;
    }
  }

  const bullets = card.back.includes('\n-')
    ? card.back.split('\n').filter((l) => l.trim())
    : null;

  return (
    <motion.div
      data-testid={active ? 'swipe-card' : undefined}
      className="absolute inset-0 no-select"
      style={{ x, y, rotate }}
      drag={active}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
      onTap={() => active && setFlipped((f) => !f)}
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="shell h-full w-full">
        <div className="relative flex h-full w-full flex-col bg-ink rounded-[2px] overflow-hidden">
          {/* decision overlays */}
          <motion.div
            style={{ opacity: knownOpacity }}
            className="pointer-events-none absolute right-4 top-4 z-20 rotate-6 rounded-[2px] border-2 border-emerald-400 px-3 py-1 text-xs font-display font-bold uppercase tracking-widest text-emerald-400"
          >
            Got it
          </motion.div>
          <motion.div
            style={{ opacity: reviewOpacity }}
            className="pointer-events-none absolute left-4 top-4 z-20 -rotate-6 rounded-[2px] border-2 border-rose-400 px-3 py-1 text-xs font-display font-bold uppercase tracking-widest text-rose-400"
          >
            Review
          </motion.div>

          {/* header */}
          <div className="flex items-center justify-between px-7 pt-7">
            <span
              className="rounded-[2px] px-2 py-1 font-body text-[11px] font-medium uppercase tracking-wider"
              style={{ color: meta.color, background: meta.bg }}
            >
              {meta.label}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmark();
              }}
              className="rounded-full p-1 text-faint transition-colors hover:text-indigo-soft"
              aria-label="Bookmark"
            >
              <Bookmark size={16} fill={bookmarked ? '#818CF8' : 'transparent'} color={bookmarked ? '#818CF8' : 'currentColor'} />
            </button>
          </div>

          {/* body */}
          <div className="flex flex-1 flex-col px-7 pb-6 pt-5">
            <div className="mb-3 font-body text-[11px] uppercase tracking-[0.18em] text-faint">
              {card.moduleTitle}
            </div>
            <h2 className="font-display text-[26px] font-medium leading-[1.12] tracking-tight text-white">
              {card.title}
            </h2>

            {!flipped ? (
              <div className="mt-5 flex flex-1 flex-col justify-center">
                <p className="font-body text-[17px] font-light leading-relaxed text-zinc-300">
                  {card.front}
                </p>
              </div>
            ) : (
              <div className="mt-4 flex-1 overflow-y-auto pr-1 animate-floatup">
                {bullets ? (
                  <ul className="space-y-2">
                    {bullets.map((b, i) => {
                      const clean = b.replace(/^[-•]\s*/, '');
                      const isLead = !b.trim().startsWith('-');
                      return isLead ? (
                        <p key={i} className="font-body text-[15px] leading-relaxed text-zinc-200">
                          {clean}
                        </p>
                      ) : (
                        <li key={i} className="flex gap-2 font-body text-[14px] leading-relaxed text-zinc-300">
                          <span className="mt-[7px] h-1 w-1 flex-none rounded-full bg-indigo-soft" />
                          <span>{clean}</span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="font-body text-[15px] leading-relaxed text-zinc-200">{card.back}</p>
                )}
                {card.example && (
                  <div className="mt-4 border-l-2 border-indigo/40 pl-3 font-body text-[13px] italic leading-relaxed text-zinc-400">
                    {card.example}
                  </div>
                )}
              </div>
            )}

            {/* footer */}
            <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
              <div className="flex items-center gap-2 font-body text-[11px] text-faint">
                <span>{DIFFICULTY_LABEL[card.difficulty]}</span>
                {card.chapter && <span className="text-white/15">·</span>}
                {card.chapter && <span>{card.chapter}</span>}
              </div>
              <div className="flex items-center gap-1.5 font-body text-[11px] text-faint">
                <RotateCw size={12} />
                <span>{flipped ? 'Tap to flip back' : 'Tap to reveal'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default SwipeCard;
