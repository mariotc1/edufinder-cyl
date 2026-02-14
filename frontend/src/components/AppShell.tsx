'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import ConditionalFooter from './ConditionalFooter';
import ComparisonTray from './ComparisonTray';
import ScrollToTop from './ScrollToTop';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Check if current route is an admin route
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <>
      {/* Navbar is hidden on admin pages */}
      {!isAdmin && <Navbar />}
      
      {/* Main container padding is removed on admin pages to allow full control by AdminLayout */}
      <main className={isAdmin ? 'min-h-screen' : 'pt-20 min-h-screen'}>
        {children}
      </main>
      
      {/* Footer, Tray, and ScrollToTop are also managed here */}
      {!isAdmin && <ConditionalFooter />}
      <ComparisonTray />
      <ScrollToTop />
    </>
  );
}
