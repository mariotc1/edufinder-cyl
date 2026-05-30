'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MapPin, Heart, UserCircle2, Download, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFavoritesAnimation } from '@/context/FavoritesAnimationContext';
import { usePWA } from '@/components/PWAProvider';
import { motion, AnimatePresence } from 'framer-motion';

export default function BottomNav() {
  const { user } = useAuth();
  const { favoritesPulse } = useFavoritesAnimation();
  const { isInstallable, isInstalled, isIOS, installApp, showIOSInstallGuide } = usePWA();
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href) ?? false;
  };

  return (
    <nav
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/96 backdrop-blur-xl border-t border-neutral-100 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
    >
      {/* PWA install strip — se muestra encima de las pestañas cuando la app es instalable */}
      <AnimatePresence>
        {(isInstallable || isIOS) && !isInstalled && (
          <motion.button
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={isIOS ? showIOSInstallGuide : installApp}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#223945] to-blue-600 text-white text-xs font-semibold overflow-hidden"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>Instala EduFinder para mejor experiencia</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Tab bar */}
      <div className="flex h-16">
        {user ? (
          <>
            <Tab
              href="/"
              label="Inicio"
              active={isActive('/')}
              icon={<Home className="w-[22px] h-[22px]" />}
            />
            <Tab
              href="/mapa"
              label="Mapa"
              active={isActive('/mapa')}
              icon={<MapPin className="w-[22px] h-[22px]" />}
              dataTour="map-mobile"
            />
            <Tab
              href="/favoritos"
              label="Favoritos"
              active={isActive('/favoritos')}
              dataTour="favorites-mobile"
              icon={
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
              }
              pulse={favoritesPulse}
            />
            {user.role === 'admin' && (
              <Tab
                href="/admin"
                label="Admin"
                active={isActive('/admin')}
                icon={<ShieldCheck className="w-[22px] h-[22px]" />}
              />
            )}
            {/* Profile tab con avatar */}
            <ProfileTab
              href="/perfil"
              label="Perfil"
              active={isActive('/perfil')}
              name={user.name}
              avatar={user.foto_perfil ?? null}
            />
          </>
        ) : (
          <>
            <Tab
              href="/"
              label="Inicio"
              active={isActive('/')}
              icon={<Home className="w-[22px] h-[22px]" />}
            />
            <Tab
              href="/mapa"
              label="Mapa"
              active={isActive('/mapa')}
              icon={<MapPin className="w-[22px] h-[22px]" />}
              dataTour="map-mobile"
            />
            {/* Un único tab de acceso — estándar profesional (Twitter, Spotify, etc.) */}
            <AccountTab active={isActive('/login') || isActive('/registro')} />
          </>
        )}
      </div>
    </nav>
  );
}

// ── Tab estándar ─────────────────────────────────────────────────
function Tab({
  href,
  label,
  active,
  icon,
  dataTour,
  pulse,
}: {
  href: string;
  label: string;
  active: boolean;
  icon: React.ReactNode;
  dataTour?: string;
  pulse?: boolean;
}) {
  return (
    <Link
      href={href}
      data-tour={dataTour}
      className="flex-1 flex flex-col items-center justify-center gap-1 relative select-none"
    >
      {/* Indicador activo — barra en la parte superior */}
      <AnimatePresence>
        {active && (
          <motion.span
            key="bar"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="absolute top-0 w-8 h-[3px] rounded-b-full bg-[#223945]"
          />
        )}
      </AnimatePresence>

      {/* Icono con escala animada al pulsar */}
      <motion.div
        animate={pulse ? { scale: [1, 1.3, 1] } : active ? { scale: [1, 1.08, 1] } : {}}
        transition={{ duration: 0.25 }}
        className={`transition-colors duration-200 ${
          active ? 'text-[#223945]' : 'text-neutral-400'
        }`}
      >
        {icon}
      </motion.div>

      <span
        className={`text-[10px] leading-none transition-all duration-200 ${
          active ? 'font-bold text-[#223945]' : 'font-medium text-neutral-400'
        }`}
      >
        {label}
      </span>
    </Link>
  );
}

// ── Tab de perfil con avatar ──────────────────────────────────────
function ProfileTab({
  href,
  label,
  active,
  name,
  avatar,
}: {
  href: string;
  label: string;
  active: boolean;
  name: string;
  avatar: string | null;
}) {
  return (
    <Link href={href} className="flex-1 flex flex-col items-center justify-center gap-1 relative select-none">
      <AnimatePresence>
        {active && (
          <motion.span
            key="bar"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="absolute top-0 w-8 h-[3px] rounded-b-full bg-[#223945]"
          />
        )}
      </AnimatePresence>

      {/* Avatar o inicial */}
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className={`w-6 h-6 rounded-full object-cover transition-all duration-200 ${
            active ? 'ring-2 ring-[#223945] ring-offset-[1.5px]' : 'ring-1 ring-neutral-200'
          }`}
        />
      ) : (
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-200 ${
            active
              ? 'bg-[#223945] text-white'
              : 'bg-neutral-200 text-neutral-500'
          }`}
        >
          {name.charAt(0).toUpperCase()}
        </div>
      )}

      <span
        className={`text-[10px] leading-none transition-all duration-200 ${
          active ? 'font-bold text-[#223945]' : 'font-medium text-neutral-400'
        }`}
      >
        {label}
      </span>
    </Link>
  );
}

// ── Tab de acceso único (no autenticado) — estándar profesional ──
function AccountTab({ active }: { active: boolean }) {
  return (
    <Link href="/login" className="flex-1 flex flex-col items-center justify-center gap-1 relative select-none">
      <AnimatePresence>
        {active && (
          <motion.span
            key="bar"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-0 w-8 h-[3px] rounded-b-full bg-[#223945]"
          />
        )}
      </AnimatePresence>

      <div className={`w-10 h-[28px] rounded-xl flex items-center justify-center transition-all duration-200 ${
        active
          ? 'bg-[#223945] shadow-sm'
          : 'bg-gradient-to-r from-[#223945] to-blue-600 shadow-sm shadow-blue-900/20'
      }`}>
        <UserCircle2 className="w-4 h-4 text-white" />
      </div>

      <span className={`text-[10px] leading-none font-bold ${active ? 'text-[#223945]' : 'text-[#223945]/80'}`}>
        Acceder
      </span>
    </Link>
  );
}
