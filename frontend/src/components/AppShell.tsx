'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import ConditionalFooter from './ConditionalFooter';
import ComparisonTray from './ComparisonTray';
import ScrollToTop from './ScrollToTop';
import OnboardingTour from './onboarding/OnboardingTour';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <>
      {/* Top navbar — only on desktop (hidden on mobile via Navbar itself) */}
      {!isAdmin && <Navbar />}

      {/* Bottom navigation — only on mobile, never on admin */}
      {!isAdmin && <BottomNav />}

      {/*
        Padding strategy:
        - Desktop (md+): pt-20 for the top navbar
        - Mobile (<md): no top padding (no top navbar) + bottom padding for the bottom nav via .mobile-bottom-safe
        - Admin: no padding (AdminLayout controls its own layout)
      */}
      <main
        className={isAdmin ? 'min-h-screen' : 'md:pt-20 min-h-screen mobile-bottom-safe mobile-safe-top'}
      >
        {children}
      </main>

      {!isAdmin && <ConditionalFooter />}
      <ComparisonTray />
      <ScrollToTop />
      <OnboardingTour />
    </>
  );
}
