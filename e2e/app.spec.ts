import { test, expect } from '@playwright/test';

// Each Playwright test runs in a fresh browser context, so localStorage starts
// empty. By default we mark first-run onboarding as already seen so these tests
// exercise the core app directly; the dedicated onboarding test below opts back in.
const ONB_KEY = 'meta-ads-academy:onboarding:v1';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    (k) => localStorage.setItem(k, JSON.stringify({ welcomeSeen: true, swipeCoachSeen: true })),
    ONB_KEY,
  );
});

test('first-run onboarding: welcome → first session → gesture coach', async ({ page }) => {
  // opt back into onboarding (runs after the beforeEach script, so it wins)
  await page.addInitScript(
    (k) => localStorage.setItem(k, JSON.stringify({ welcomeSeen: false, swipeCoachSeen: false })),
    ONB_KEY,
  );
  await page.goto('/');

  // welcome modal greets a new user
  await expect(page.getByText(/Learn Meta ads in/i)).toBeVisible();
  await page.getByRole('button', { name: /Start learning/i }).first().click();

  // drops straight into a session with the gesture coach
  await expect(page.getByText(/How it works/i)).toBeVisible();
  await page.getByRole('button', { name: /start swiping/i }).click();
  await expect(page.getByText(/How it works/i)).toBeHidden();

  // and it's remembered
  const seen = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) || '{}'), ONB_KEY);
  expect(seen).toEqual({ welcomeSeen: true, swipeCoachSeen: true });
});

test('home renders the hero and curriculum', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Learn Facebook/i })).toBeVisible();
  await expect(page.getByText(/THE CURRICULUM/i)).toBeVisible();
  await expect(page.getByText(/15 MODULES/i)).toBeVisible();
});

test('daily goal selector changes the session size', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '6', exact: true }).click();
  const goal = await page.evaluate(() => {
    const raw = localStorage.getItem('meta-ads-academy:v1');
    return raw ? JSON.parse(raw).dailyGoal : null;
  });
  expect(goal).toBe(6);
});

test('full study flow: start, flip, learn, persist', async ({ page }) => {
  await page.goto('/');

  // start a session — the top card shows a "Tap to reveal" hint
  await page.getByRole('button', { name: /Start learning/i }).click();
  await expect(page.getByText(/Tap to reveal/i).first()).toBeVisible();

  // tap the card to flip to the lesson
  await page.getByTestId('swipe-card').click({ position: { x: 140, y: 150 } });
  await expect(page.getByText(/Tap to flip back/i).first()).toBeVisible();

  // mark the card as known
  await page.getByRole('button', { name: 'Got it' }).click();
  await expect(page.getByText(/1 learned/i)).toBeVisible();

  // exit to home and confirm the streak persisted to localStorage
  await page.getByRole('button', { name: /Exit/i }).click();
  await expect(page.getByText('DAY STREAK')).toBeVisible();
  const streak = await page.evaluate(() => {
    const raw = localStorage.getItem('meta-ads-academy:v1');
    return raw ? JSON.parse(raw).streak.count : 0;
  });
  expect(streak).toBe(1);

  // reload — progress survives
  await page.reload();
  await expect(page.getByText('DAY STREAK')).toBeVisible();
  const after = await page.evaluate(() => {
    const raw = localStorage.getItem('meta-ads-academy:v1');
    return raw ? Object.keys(JSON.parse(raw).cards).length : 0;
  });
  expect(after).toBeGreaterThanOrEqual(1);
});

test('browse view lists modules and supports search', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Browse modules/i }).click();
  await expect(page.getByText(/Strategy & Mindset/i)).toBeVisible();
  await page.getByPlaceholder(/Search cards/i).fill('lookalike');
  await expect(page.getByText(/results?/i)).toBeVisible();
});

test('campaign simulator runs and coaches', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Campaign Simulator/i }).click();

  // load the Dog Story preset (single creative + audience network = known problems)
  await page.getByRole('button', { name: /Dog Story/i }).click();
  await page.getByRole('button', { name: /Launch \(simulated\)/i }).click();

  // a grade/score + coaching appears
  await expect(page.getByText(/\/100/)).toBeVisible();
  await expect(page.getByText('Coach', { exact: true })).toBeVisible();
  await expect(page.getByText(/Audience Network is inflating/i)).toBeVisible(); // coach caught the junk placement

  // the run is saved to history
  await expect(page.getByText(/Run history/i)).toBeVisible();
});

test('apply drills: answer a challenge and get feedback', async ({ page }) => {
  await page.goto('/');
  // open drills for the first module via its Apply button
  await page.getByRole('button', { name: /Apply/i }).first().click();
  await expect(page.getByText(/Apply ·/i)).toBeVisible();

  // select the first answer option (mcq/multi), then check -> explanation shows
  const opt = page.getByTestId('drill-option').first();
  if (await opt.count()) await opt.click();
  await page.getByRole('button', { name: 'Check answer' }).click();
  // post-submit: explanation + a Continue button appear (unambiguous signals)
  await expect(page.getByRole('button', { name: /Continue/i })).toBeVisible();
  await expect(page.getByText(/Not quite|^Correct$/)).toBeVisible();
});
