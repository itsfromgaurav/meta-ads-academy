import { ChevronLeft, Play, Bookmark } from 'lucide-react';
import type { Card } from '../types';
import type { Store } from '../lib/useStore';
import { typeMeta } from '../lib/ui';

interface Props {
  store: Store;
  onBack: () => void;
  onStudy: (cards: Card[]) => void;
}

export default function Bookmarks({ store, onBack, onStudy }: Props) {
  const { bookmarks } = store;

  return (
    <div className="mx-auto w-full max-w-md px-5 pb-16">
      <div className="flex items-center gap-2 py-5">
        <button onClick={onBack} className="text-faint transition-colors hover:text-white">
          <ChevronLeft size={20} />
        </button>
        <h2 className="font-display text-[20px] font-medium text-white">Saved cards</h2>
      </div>

      {bookmarks.length === 0 ? (
        <div className="mt-20 flex flex-col items-center text-center">
          <Bookmark size={28} className="mb-3 text-faint" />
          <p className="font-body text-[14px] text-zinc-400">No saved cards yet.</p>
          <p className="mt-1 font-body text-[12px] text-faint">
            Swipe a card up — or tap the bookmark icon — to save it here.
          </p>
        </div>
      ) : (
        <>
          <button
            onClick={() => onStudy(bookmarks)}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-full bg-indigo py-2.5 font-body text-[13px] font-medium text-white transition-colors hover:bg-indigo-deep"
          >
            <Play size={14} /> Review all {bookmarks.length}
          </button>
          <div className="space-y-1.5">
            {bookmarks.map((c: Card) => {
              const meta = typeMeta(c.type);
              return (
                <div
                  key={c.id}
                  className="rounded-[2px] border border-white/6 bg-surface px-4 py-3"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-body text-[10px] uppercase tracking-wider" style={{ color: meta.color }}>
                      {meta.label}
                    </span>
                    <span className="font-body text-[10px] text-faint">· {c.moduleTitle}</span>
                  </div>
                  <div className="font-body text-[14px] text-zinc-100">{c.title}</div>
                  <div className="mt-1 font-body text-[12px] leading-relaxed text-faint line-clamp-2">{c.front}</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
