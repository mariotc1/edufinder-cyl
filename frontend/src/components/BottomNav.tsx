'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MapPin, Heart, UserCircle2, Download, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFavoritesAnimation } from '@/context/FavoritesAnimationContext';
import { usePWA } from '@/components/PWAProvider';
import { motion, AnimatePresence } from 'framer-motion';

const TAB_STYLE: React.CSSProperties = { touchAction: 'manipulation' };
const BASE_CLASS = 'flex-1 h-full flex flex-col items-center justify-center relative';

// Barra de selección activa — degradado lineal, igual en todos los tabs
const ActiveBar = () => (
  <AnimatePresence>
    <motion.span
      key="bar"
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: 1 }}
      exit={{ scaleX: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      className="absolute top-0 w-8 h-[3px] rounded-b-full bg-gradient-to-r from-[#223945] to-blue-500"
    />
  </AnimatePresence>
);

export default function BottomNav() {
  const { user } = useAuth();
  const { favoritesPulse } = useFavoritesAnimation();
  const { isInstallable, isInstalled, isIOS, installApp, showIOSInstallGuide } = usePWA();
  const pathname = usePathname();
  const [stripDismissed, setStripDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-strip-dismissed');
    if (dismissed) {
      const weekInMs = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - parseInt(dismissed) < weekInMs) {
        setStripDismissed(true);
      }
    }
  }, []);

  const dismissStrip = () => {
    setStripDismissed(true);
    localStorage.setItem('pwa-strip-dismissed', Date.now().toString());
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href) ?? false;
  };

  const showInstallStrip = (isInstallable || isIOS) && !isInstalled && !stripDismissed;

  return (
    <nav
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', transform: 'translateZ(0)' }}
      className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-neutral-200 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]"
    >
      {/* Suelo blanco: cubre el hueco que aparece en Chrome iOS cuando la barra del navegador colapsa y el viewport crece */}
      <div aria-hidden="true" className="absolute left-0 right-0 bg-white pointer-events-none" style={{ top: '100%', height: '200px' }} />
      {/* PWA install strip */}
      <AnimatePresence>
        {showInstallStrip && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full flex items-center bg-gradient-to-r from-[#223945] to-blue-600 text-white overflow-hidden"
          >
            <button
              onClick={isInstallable ? installApp : showIOSInstallGuide}
              style={TAB_STYLE}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>Instala EduFinder para mejor experiencia</span>
            </button>
            <button
              onClick={dismissStrip}
              style={TAB_STYLE}
              className="pr-3 pl-1 py-2.5 opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex h-16">
        {user ? (
          <>
            <HomeTab active={isActive('/')} />
            <Tab href="/mapa" label="Mapa" active={isActive('/mapa')} dataTour="map-mobile">
              <MapPin className="w-[22px] h-[22px]" />
            </Tab>
            <Tab href="/favoritos" label="Favoritos" active={isActive('/favoritos')} scrollOnActive dataTour="favorites-mobile">
              <div className="relative">
                <Heart className="w-[22px] h-[22px]" />
                <AnimatePresence>
                  {favoritesPulse && (
                    <motion.span
                      key="dot"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"
                    />
                  )}
                </AnimatePresence>
              </div>
            </Tab>
            {user.role === 'admin' && (
              <Tab href="/admin" label="Admin" active={isActive('/admin')} scrollOnActive>
                <ShieldCheck className="w-[22px] h-[22px]" />
              </Tab>
            )}
            <ProfileTab href="/perfil" label="Perfil" active={isActive('/perfil')} name={user.name} avatar={user.foto_perfil ?? null} />
          </>
        ) : (
          <>
            <HomeTab active={isActive('/')} />
            <Tab href="/mapa" label="Mapa" active={isActive('/mapa')} dataTour="map-mobile">
              <MapPin className="w-[22px] h-[22px]" />
            </Tab>
            <AccountTab active={isActive('/login') || isActive('/registro')} />
          </>
        )}
      </div>
    </nav>
  );
}

// ── Inicio ──────────────────────────────────────────────────────
function HomeTab({ active }: { active: boolean }) {
  const content = (
    <>
      {active && <ActiveBar />}
      <div className="flex flex-col items-center gap-1">
        <Home className={`w-[22px] h-[22px] transition-colors duration-200 ${active ? 'text-[#223945]' : 'text-neutral-400'}`} />
        <span className={`text-[10px] leading-none transition-colors duration-200 ${active ? 'font-bold text-[#223945]' : 'font-medium text-neutral-400'}`}>
          Inicio
        </span>
      </div>
    </>
  );

  if (active) {
    return (
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={TAB_STYLE} className={BASE_CLASS}>
        {content}
      </button>
    );
  }
  return <Link href="/" style={TAB_STYLE} className={BASE_CLASS}>{content}</Link>;
}

// ── Tab genérico ─────────────────────────────────────────────────
function Tab({
  href, label, active, scrollOnActive, dataTour, children,
}: {
  href: string; label: string; active: boolean; scrollOnActive?: boolean; dataTour?: string; children: React.ReactNode;
}) {
  const content = (
    <>
      {active && <ActiveBar />}
      <div data-tour={dataTour} className="flex flex-col items-center gap-1 pointer-events-none">
        <span className={`transition-colors duration-200 ${active ? 'text-[#223945]' : 'text-neutral-400'}`}>
          {children}
        </span>
        <span className={`text-[10px] leading-none transition-colors duration-200 ${active ? 'font-bold text-[#223945]' : 'font-medium text-neutral-400'}`}>
          {label}
        </span>
      </div>
    </>
  );

  if (active && scrollOnActive) {
    return (
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={TAB_STYLE} className={BASE_CLASS}>
        {content}
      </button>
    );
  }
  return <Link href={href} style={TAB_STYLE} className={BASE_CLASS}>{content}</Link>;
}

// ── Tab perfil con avatar ────────────────────────────────────────
function ProfileTab({ href, label, active, name, avatar }: {
  href: string; label: string; active: boolean; name: string; avatar: string | null;
}) {
  const [imgError, setImgError] = useState(false);

  const content = (
    <>
      {active && <ActiveBar />}
      <div className="flex flex-col items-center gap-1">
        {avatar && !imgError ? (
          <img
            src={avatar}
            alt={name}
            className={`w-[22px] h-[22px] rounded-full object-cover transition-all duration-200 ${active ? 'ring-2 ring-[#223945] ring-offset-[1.5px]' : 'ring-1 ring-neutral-200'}`}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={`w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-200 ${active ? 'bg-[#223945] text-white' : 'bg-neutral-200 text-neutral-500'}`}>
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className={`text-[10px] leading-none transition-colors duration-200 ${active ? 'font-bold text-[#223945]' : 'font-medium text-neutral-400'}`}>
          {label}
        </span>
      </div>
    </>
  );

  if (active) {
    return (
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={TAB_STYLE} className={BASE_CLASS}>
        {content}
      </button>
    );
  }
  return <Link href={href} style={TAB_STYLE} className={BASE_CLASS}>{content}</Link>;
}

// ── Tab acceso (no autenticado) — sin pill, igual que el resto ──
function AccountTab({ active }: { active: boolean }) {
  return (
    <Link href="/login" style={TAB_STYLE} className={BASE_CLASS}>
      {active && <ActiveBar />}
      <div className="flex flex-col items-center gap-1">
        <UserCircle2 className={`w-[22px] h-[22px] transition-colors duration-200 ${active ? 'text-[#223945]' : 'text-neutral-400'}`} />
        <span className={`text-[10px] leading-none transition-colors duration-200 ${active ? 'font-bold text-[#223945]' : 'font-medium text-neutral-400'}`}>
          Acceder
        </span>
      </div>
    </Link>
  );
}

