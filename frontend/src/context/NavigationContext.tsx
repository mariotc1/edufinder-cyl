'use client';

import { createContext, useContext, useRef, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type NavDirection = 'push' | 'pop' | 'tab';

const NavigationContext = createContext<NavDirection>('tab');

const routeDepth = (path: string): number =>
  path.split('/').filter(Boolean).length;

// Routes considered "same level" — switching between them is always a tab transition
const TAB_ROOTS = new Set(['/', '/mapa', '/favoritos', '/perfil', '/comparador', '/login', '/registro']);

function classify(from: string, to: string): NavDirection {
  const fromTab = TAB_ROOTS.has(from) || [...TAB_ROOTS].some(r => r !== '/' && from.startsWith(r) && routeDepth(from) === routeDepth(r));
  const toTab   = TAB_ROOTS.has(to)   || [...TAB_ROOTS].some(r => r !== '/' && to.startsWith(r)   && routeDepth(to)   === routeDepth(r));

  if (fromTab && toTab) return 'tab';

  const depthFrom = routeDepth(from);
  const depthTo   = routeDepth(to);

  if (depthTo > depthFrom) return 'push';
  if (depthTo < depthFrom) return 'pop';
  return 'tab';
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevRef  = useRef(pathname);
  const [direction, setDirection] = useState<NavDirection>('tab');

  useEffect(() => {
    const prev = prevRef.current;
    if (prev === pathname) return;
    setDirection(classify(prev, pathname));
    prevRef.current = pathname;
  }, [pathname]);

  return (
    <NavigationContext.Provider value={direction}>
      {children}
    </NavigationContext.Provider>
  );
}

export const useNavDirection = () => useContext(NavigationContext);
