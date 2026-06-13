import { useState } from 'react';
import type { Card } from './types';
import { useStore, now } from './lib/useStore';
import { buildSession } from './lib/srs';
import Home from './components/Home';
import Deck from './components/Deck';
import Complete from './components/Complete';
import Browse from './components/Browse';
import Bookmarks from './components/Bookmarks';
import Simulator from './components/Simulator';
import Drills from './components/Drills';
import AuthBar from './components/AuthBar';
import CloudSync from './components/CloudSync';
import { drillsFor } from './data/drills';

type View = 'home' | 'session' | 'complete' | 'browse' | 'bookmarks' | 'simulator' | 'drills';

export default function App({ syncEnabled = false }: { syncEnabled?: boolean }) {
  const store = useStore();
  const [view, setView] = useState<View>('home');
  const [queue, setQueue] = useState<Card[]>([]);
  const [result, setResult] = useState({ learned: 0, reviewed: 0 });
  const [drillModule, setDrillModule] = useState<{ domain: string; title: string } | null>(null);

  function openDrills(domain: string, title: string) {
    setDrillModule({ domain, title });
    setView('drills');
  }

  function startDaily() {
    const q = buildSession(store.course.cards, store.progress, {
      goal: store.progress.dailyGoal,
      now: now(),
    });
    if (q.length === 0) return;
    setQueue(q);
    setResult({ learned: 0, reviewed: 0 });
    setView('session');
  }

  function startCustom(cards: Card[]) {
    if (cards.length === 0) return;
    setQueue(cards.slice());
    setResult({ learned: 0, reviewed: 0 });
    setView('session');
  }

  function handleComplete(learned: number) {
    setResult({ learned, reviewed: queue.length - learned });
    setView('complete');
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink">
      {/* ambient breathing dot field */}
      <div className="pointer-events-none fixed inset-0 dotfield animate-breathe opacity-40" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-64 bg-gradient-to-b from-indigo/10 to-transparent" />

      {syncEnabled && <AuthBar />}
      {syncEnabled && <CloudSync store={store} />}

      <div className="relative z-10 min-h-screen">
        {view === 'home' && (
          <Home
            store={store}
            onStart={startDaily}
            onBrowse={() => setView('browse')}
            onBookmarks={() => setView('bookmarks')}
            onSimulator={() => setView('simulator')}
            onDrills={openDrills}
          />
        )}
        {view === 'session' && (
          <div className="h-screen">
            <Deck store={store} queue={queue} onComplete={handleComplete} onExit={() => setView('home')} />
          </div>
        )}
        {view === 'complete' && (
          <div className="h-screen">
            <Complete
              store={store}
              learned={result.learned}
              reviewed={result.reviewed}
              onHome={() => setView('home')}
              onMore={startDaily}
            />
          </div>
        )}
        {view === 'browse' && (
          <Browse store={store} onBack={() => setView('home')} onStudy={startCustom} onDrills={openDrills} />
        )}
        {view === 'bookmarks' && (
          <Bookmarks store={store} onBack={() => setView('home')} onStudy={startCustom} />
        )}
        {view === 'simulator' && <Simulator store={store} onBack={() => setView('home')} />}
        {view === 'drills' && drillModule && (
          <Drills
            store={store}
            domain={drillModule.domain}
            title={drillModule.title}
            drills={drillsFor(drillModule.domain)}
            onBack={() => setView('browse')}
          />
        )}
      </div>
    </div>
  );
}
