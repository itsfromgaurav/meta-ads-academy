import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { Cloud, LogIn } from 'lucide-react';

/**
 * Floating top-right auth control. Signed out -> a "Sync" sign-in button.
 * Signed in -> a "synced" pill + Clerk's UserButton (avatar / account menu).
 */
export default function AuthBar() {
  return (
    <div className="fixed right-4 top-4 z-50 flex items-center gap-2">
      <SignedOut>
        <SignInButton mode="modal">
          <button className="flex items-center gap-1.5 rounded-full border border-white/15 bg-ink/80 px-3 py-1.5 font-body text-[12px] text-zinc-200 backdrop-blur transition-colors hover:border-indigo/60 hover:text-white">
            <LogIn size={13} /> Sync progress
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <span className="flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/8 px-2.5 py-1 font-body text-[11px] text-emerald-300">
          <Cloud size={12} /> Synced
        </span>
        <UserButton
          appearance={{
            elements: { avatarBox: 'h-7 w-7' },
          }}
        />
      </SignedIn>
    </div>
  );
}
