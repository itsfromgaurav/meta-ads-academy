import { useCallback, useState } from 'react';

const KEY = 'meta-ads-academy:onboarding:v1';

export interface OnboardingFlags {
  welcomeSeen: boolean;
  swipeCoachSeen: boolean;
}

function load(): OnboardingFlags {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { welcomeSeen: false, swipeCoachSeen: false, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return { welcomeSeen: false, swipeCoachSeen: false };
}

function save(flags: OnboardingFlags) {
  try {
    localStorage.setItem(KEY, JSON.stringify(flags));
  } catch {
    /* ignore */
  }
}

export function useOnboarding() {
  const [flags, setFlags] = useState<OnboardingFlags>(load);

  const mark = useCallback((key: keyof OnboardingFlags) => {
    setFlags((f) => {
      if (f[key]) return f;
      const next = { ...f, [key]: true };
      save(next);
      return next;
    });
  }, []);

  return {
    flags,
    dismissWelcome: useCallback(() => mark('welcomeSeen'), [mark]),
    dismissSwipeCoach: useCallback(() => mark('swipeCoachSeen'), [mark]),
  };
}
