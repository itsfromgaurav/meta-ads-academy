import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import type { Store } from '../lib/useStore';
import { decodeProgress, encodeProgress, mergeProgress } from '../lib/sync';

/**
 * Invisible component. When a Clerk user is signed in it:
 *  1. merges their cloud progress (stored in Clerk unsafeMetadata) with the
 *     local progress on this device, and hydrates the store with the union;
 *  2. writes progress back to the cloud (debounced) whenever it changes.
 * Signed out, it does nothing — localStorage keeps working as before.
 */
export default function CloudSync({ store }: { store: Store }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const syncedUser = useRef<string | null>(null);
  const lastWritten = useRef<string>('');
  const ready = useRef(false);

  function write(enc: string) {
    if (!user) return;
    const meta = (user.unsafeMetadata ?? {}) as Record<string, unknown>;
    lastWritten.current = enc;
    user.update({ unsafeMetadata: { ...meta, progress: enc } }).catch((e) => {
      console.warn('[sync] could not save progress to cloud:', e);
    });
  }

  // one-time merge when a user signs in
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) {
      ready.current = false;
      return;
    }
    if (syncedUser.current === user.id) return;
    syncedUser.current = user.id;
    ready.current = false;

    const cloudStr = (user.unsafeMetadata as Record<string, unknown> | undefined)?.progress as
      | string
      | undefined;
    const cloud = decodeProgress(cloudStr);
    const merged = cloud ? mergeProgress(store.progress, cloud) : store.progress;
    store.hydrate(merged);
    write(encodeProgress(merged));
    ready.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, user?.id]);

  // debounced push on any progress change
  useEffect(() => {
    if (!ready.current || !isSignedIn || !user) return;
    const enc = encodeProgress(store.progress);
    if (enc === lastWritten.current) return;
    const t = setTimeout(() => write(enc), 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.progress, isSignedIn, user?.id]);

  return null;
}
