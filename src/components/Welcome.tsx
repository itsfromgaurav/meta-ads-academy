import { motion } from 'framer-motion';
import { Layers, Dumbbell, FlaskConical, Flame, ChevronRight } from 'lucide-react';

interface Props {
  onStart: () => void;
  onSkip: () => void;
  cardCount: number;
}

const MODES = [
  { icon: Layers, title: 'Swipe to learn', desc: 'Flip a card, get the lesson. Right = got it, left = review.' },
  { icon: Dumbbell, title: 'Apply in drills', desc: 'Real scenarios that make you use what you learned.' },
  { icon: FlaskConical, title: 'Paper-trade campaigns', desc: 'Build a mock campaign and get coached — no real spend.' },
];

export default function Welcome({ onStart, onSkip, cardCount }: Props) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" onClick={onSkip} />
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        className="relative w-full max-w-sm"
      >
        <div className="shell">
          <div className="dotfield rounded-[2px] bg-ink p-7">
            <div className="mb-2 font-body text-[11px] uppercase tracking-[0.22em] text-indigo-soft">
              Welcome 👋
            </div>
            <h2 className="font-display text-[28px] font-medium leading-[1.08] tracking-tight text-white">
              Learn Meta ads in
              <br />2 minutes a day.
            </h2>
            <p className="mt-3 font-body text-[13px] leading-relaxed text-zinc-400">
              {cardCount} bite-size cards, drills, and a campaign simulator — distilled from a
              400-page playbook. Three ways to learn:
            </p>

            <div className="mt-5 space-y-3">
              {MODES.map((m) => (
                <div key={m.title} className="flex gap-3">
                  <div className="flex h-9 w-9 flex-none items-center justify-center rounded-[2px] border border-indigo/25 bg-indigo/10 text-indigo-soft">
                    <m.icon size={16} />
                  </div>
                  <div>
                    <div className="font-body text-[14px] font-medium text-zinc-100">{m.title}</div>
                    <div className="font-body text-[12px] leading-snug text-faint">{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-2 rounded-[2px] border border-white/8 bg-surface px-3 py-2.5">
              <Flame size={15} className="flex-none text-rose-400" />
              <p className="font-body text-[12px] leading-snug text-zinc-300">
                Come back daily — the right cards resurface automatically and your streak grows.
              </p>
            </div>

            <button
              onClick={onStart}
              className="group mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 font-body text-[14px] font-medium text-black transition-colors hover:bg-zinc-200"
            >
              Start learning
              <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={onSkip}
              className="mt-2 w-full py-2 font-body text-[12px] text-faint transition-colors hover:text-zinc-300"
            >
              I&apos;ll explore on my own
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
