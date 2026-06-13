import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import './index.css';
import App from './App.tsx';

// Cloud sync is optional: it turns on only when a Clerk key is configured.
// Without the key the app runs exactly as before (progress in localStorage).
const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    {clerkKey ? (
      <ClerkProvider publishableKey={clerkKey} afterSignOutUrl="/">
        <App syncEnabled />
      </ClerkProvider>
    ) : (
      <App />
    )}
  </StrictMode>,
);
