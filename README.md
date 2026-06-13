# Meta Ads Academy 🐾

A **Tinder-swipeable, self-paced learning course** that teaches Facebook/Instagram advertising one card at a time — distilled from *Ultimate Guide to Facebook Advertising (3rd ed.)* and corrected for modern Meta.

**▶︎ Live demo: https://meta-ads-academy-green.vercel.app**

**441 bite-size cards · 117 apply drills · a campaign simulator · 15 modules · spaced repetition · daily streaks.**

## What it does

- **Swipe to learn.** Each card has a curiosity hook on the front; tap to flip to the lesson. **Swipe right** = got it, **left** = review again, **up** (or the bookmark icon) = save.
- **Daily sessions.** Pick a daily goal (6 / 12 / 20). The app serves due reviews first, then new cards in curriculum order.
- **Spaced repetition.** A Leitner box system (intervals 0→1→2→4→7→15 days) resurfaces cards right before you'd forget them. "Review" demotes, "got it" promotes.
- **Streaks & progress.** Day-streak counter, % mastered, per-module progress bars, and a saved-cards list.
- **Browse & search** the whole curriculum, or study any single module on demand.
- **100% local.** Progress is saved to `localStorage` — no backend, no login, no API keys.

### 🧪 Apply & practice (learn by doing)

- **Apply drills** — 117 scenario challenges (multiple-choice, multi-select, and put-the-steps-in-order) attached to each module. Pick an answer, get instant feedback with an explanation citing the exact framework. Tap **Apply** on any module.
- **Campaign Simulator** — a "paper trading" sandbox. Configure a mock campaign (objective · audience · budget · offer · hook · creative · placements), hit **Launch (simulated)**, and a deterministic engine returns a 7-day result (leads, CPL, CTR decay, frequency), a graded score, and a **coach** that flags issues against the frameworks — no real spend. Includes a real **Dog Story** preset and saved run history.

## The curriculum (Facebook Flight Plan order)

`Strategy & Mindset → Account Setup → Pixel & Tracking → Audiences & Targeting → Funnels & Offers → Campaign Objectives → Ad Sets & Budget → Ad Copy → Hooks & Messaging → Creative & Design → Video Ads → Boosted Posts → Reporting & Optimization → Scaling → Troubleshooting`

Cards preserve the source's named frameworks verbatim — UPSYD, EDIE, BCOP, the Five-Tier Scaling System, 13 Elements of Persuasive Copy, 7 Power Questions, A.P.B., and more.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # production build → dist/
npm run preview  # serve the build
```

## Tests

```bash
npm test         # 21 unit tests — SRS engine + course-data integrity (Vitest)
npm run test:e2e # 4 end-to-end tests — study flow, persistence, browse (Playwright)
```

> First E2E run: `npx playwright install chromium`.

## Tech

Vite · React + TypeScript · Tailwind CSS · Framer Motion (swipe gestures) · Vitest · Playwright.
Design system: **#07 indigo-card** — Space Grotesk + Geist, indigo `#6366F1` on near-black `#05050A`, gradient-border card shells, minimal 150ms motion.

## Project shape

```
src/
├── data/
│   ├── cards/*.json     # 15 modules of cards (the course content)
│   └── course.ts        # loads + orders cards into the curriculum
├── lib/
│   ├── srs.ts           # spaced-repetition engine (pure, unit-tested)
│   ├── storage.ts       # localStorage persistence
│   ├── useStore.ts      # React state + actions
│   └── ui.ts            # card-type styling
├── components/          # Home · Deck · SwipeCard · Complete · Browse · Bookmarks
└── App.tsx              # view router
```

## Attribution

Learning content is a transformative distillation of *Ultimate Guide to Facebook Advertising, 3rd ed.* (Perry Marshall, Keith Krance, Thomas Meloche, et al.). Buy the book to support the authors. Not affiliated with Meta Platforms, Inc.
