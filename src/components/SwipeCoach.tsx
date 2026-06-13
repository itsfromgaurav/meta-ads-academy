import { motion } from 'framer-motion';
import { Hand, ArrowRight, ArrowLeft, ArrowUp } from 'lucide-react';

interface Props {
  onDismiss: () => void;
}

const HINTS = [
  { icon: Hand, label: 'Tap the card', desc: 'flip it to reveal the lesson', tone: 'text-indigo-soft' },
  { icon: ArrowRight, label: 'Swipe right', desc: 'got it — mark as learned', tone: 'text-emerald-400' },
  { icon: ArrowLeft, label: 'Swipe left', desc: "review again — you'll see it sooner", tone: 'text-rose-400' },
  { icon: ArrowUp, label: 'Swipe up', desc: 'save it to your bookmarks', tone: 'text-indigo-soft' },
];

export default function SwipeCoach({ onDismiss }: Props) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 rounded-[2px] bg-ink/85 backdrop-blur-[2px]" onClick={onDismiss} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="relative mx-5 w-full max-w-xs"
      >
        <div className="rounded-[2px] border border-white/10 bg-surface p-5">
          <div className="mb-4 font-display text-[16px] font-medium text-white">How it works</div>
          <div className="space-y-3">
            {HINTS.map((h) => (
              <div key={h.label} className="flex items-center gap-3">
                <div className={`flex h-8 w-8 flex-none items-center justify-center rounded-full border border-white/10 bg-ink ${h.tone}`}>
                  <h.icon size={15} />
                </div>
                <div className="font-body text-[13px] leading-tight">
                  <span className="font-medium text-zinc-100">{h.label}</span>
                  <span className="text-faint"> — {h.desc}</span>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={onDismiss}
            className="mt-5 w-full rounded-full bg-white py-2.5 font-body text-[13px] font-medium text-black transition-colors hover:bg-zinc-200"
          >
            Got it — start swiping
          </button>
        </div>
      </motion.div>
    </div>
  );
}
