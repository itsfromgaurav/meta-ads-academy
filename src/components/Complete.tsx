import { motion } from 'framer-motion';
import { Flame, Check } from 'lucide-react';
import type { Store } from '../lib/useStore';

interface Props {
  store: Store;
  learned: number;
  reviewed: number;
  onHome: () => void;
  onMore: () => void;
}

export default function Complete({ store, learned, reviewed, onHome, onMore }: Props) {
  const { progress, available } = store;
  const remaining = available.due + available.fresh;

  return (
    <div className="mx-auto flex h-full w-full max-w-md flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
      >
        <Check size={36} />
      </motion.div>

      <h2 className="font-display text-[34px] font-medium leading-tight text-white">Session complete</h2>
      <p className="mt-2 font-body text-[14px] text-zinc-400">
        You learned <span className="text-emerald-400">{learned}</span> and flagged{' '}
        <span className="text-rose-400">{reviewed}</span> for review.
      </p>

      <div className="mt-7 flex items-center gap-2 rounded-full border border-rose-400/25 bg-rose-400/8 px-4 py-2 font-body text-[13px] text-rose-300">
        <Flame size={15} /> {progress.streak.count}-day streak
      </div>

      <div className="mt-10 flex w-full flex-col gap-2">
        {remaining > 0 && (
          <button
            onClick={onMore}
            className="w-full rounded-full bg-white py-3 font-body text-[14px] font-medium text-black transition-colors hover:bg-zinc-200"
          >
            Keep going · {Math.min(progress.dailyGoal, remaining)} more
          </button>
        )}
        <button
          onClick={onHome}
          className="w-full rounded-full border border-white/12 py-3 font-body text-[14px] text-zinc-200 transition-colors hover:border-white/30"
        >
          Back home
        </button>
      </div>
    </div>
  );
}
