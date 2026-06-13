import { dark } from '@clerk/themes';

// Make Clerk's sign-in modal / user menu match the app's design system
// (#07 indigo-card: ink #05050A, indigo #6366F1, Space Grotesk + Geist, 2px radius,
// white pill primary buttons).
export const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: '#6366F1',
    colorBackground: '#0B0B12',
    colorText: '#FFFFFF',
    colorTextSecondary: '#9CA3AF',
    colorInputBackground: '#05050A',
    colorInputText: '#FFFFFF',
    colorDanger: '#FB7185',
    colorSuccess: '#34D399',
    colorWarning: '#FBBF24',
    fontFamily: '"Geist Sans", system-ui, sans-serif',
    fontFamilyButtons: '"Geist Sans", system-ui, sans-serif',
    borderRadius: '2px',
  },
  elements: {
    card: 'bg-surface border border-white/10 shadow-lift',
    headerTitle: 'font-display tracking-tight',
    headerSubtitle: 'text-faint',
    socialButtonsBlockButton: 'border-white/12 bg-ink hover:bg-white/5',
    socialButtonsBlockButtonText: 'font-body',
    dividerLine: 'bg-white/10',
    dividerText: 'text-faint',
    formFieldLabel: 'text-muted font-body',
    formFieldInput: 'bg-ink border-white/12 focus:border-indigo',
    formButtonPrimary:
      'bg-white text-black hover:bg-zinc-200 rounded-full normal-case font-medium shadow-none',
    footerActionText: 'text-faint',
    footerActionLink: 'text-indigo-soft hover:text-indigo',
    identityPreviewEditButton: 'text-indigo-soft',
    formResendCodeLink: 'text-indigo-soft',
    userButtonPopoverCard: 'bg-surface border border-white/10',
    userButtonPopoverActionButton: 'hover:bg-white/5',
  },
};
