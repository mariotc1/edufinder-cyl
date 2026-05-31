'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, ArrowLeft, LogOut, School, Settings } from 'lucide-react';
import AdminGuard from '@/components/auth/AdminGuard';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import LogoutConfirmationModal from '@/components/auth/LogoutConfirmationModal';

const NAV_ITEMS = [
  { name: 'Dashboard',     mobileLabel: 'Dashboard', href: '/admin',          icon: LayoutDashboard },
  { name: 'Usuarios',      mobileLabel: 'Usuarios',  href: '/admin/users',    icon: Users },
  { name: 'Centros',       mobileLabel: 'Centros',   href: '/admin/centros',  icon: School },
  { name: 'Configuración', mobileLabel: 'Config',    href: '/admin/settings', icon: Settings },
];

const TAB_STYLE: React.CSSProperties = { touchAction: 'manipulation' };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const isActive = (href: string) => pathname === href;

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    setShowLogoutModal(false);
    window.location.href = '/login';
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-brand-gradient font-sans text-slate-800">

        {/* ── MOBILE CHROME ─────────────────────────────────────────────── */}

        {/* White cover for notch / Dynamic Island safe area */}
        <div
          aria-hidden="true"
          className="md:hidden fixed top-0 left-0 right-0 bg-white z-[102]"
          style={{ height: 'env(safe-area-inset-top, 0px)', transform: 'translateZ(0)' }}
        />
        {/* Gradient accent line — appears just below the safe area */}
        <div
          aria-hidden="true"
          className="md:hidden fixed left-0 right-0 h-[3px] bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300 z-[102]"
          style={{ top: 'env(safe-area-inset-top, 0px)', transform: 'translateZ(0)' }}
        />

        {/* Mobile top bar */}
        <header
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 3px)', transform: 'translateZ(0)' }}
          className="md:hidden fixed top-0 left-0 right-0 z-[100] bg-white border-b border-neutral-200 shadow-sm"
        >
          <div className="h-14 flex items-center justify-between px-4">
            <div className="flex items-center gap-2.5">
              <Image
                src="/img/logo-edufinderCYL.png"
                alt="EduFinder CYL"
                width={34}
                height={34}
                className="rounded-xl"
                priority
              />
              <div className="flex flex-col">
                <span className="text-[15px] font-bold bg-gradient-to-r from-[#223945] via-blue-600 to-blue-400 bg-clip-text text-transparent leading-tight">
                  EduFinder CYL
                </span>
                <span className="text-[10px] text-neutral-500 font-medium leading-tight">
                  Panel Admin
                </span>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <Link
                href="/"
                className="p-2 text-neutral-500 hover:text-[#223945] hover:bg-neutral-100 rounded-xl transition-colors"
                title="Volver a la app"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile bottom tab navigation */}
        <nav
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', transform: 'translateZ(0)' }}
          className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-neutral-200 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]"
        >
          {/* White floor extending below the safe area (Chrome iOS gap fix) */}
          <div aria-hidden="true" className="absolute left-0 right-0 bg-white pointer-events-none" style={{ top: '100%', height: '200px' }} />
          <div className="flex h-16">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              const tabContent = (
                <>
                  {active && (
                    <motion.span
                      layoutId="adminActiveBar"
                      className="absolute top-0 w-8 h-[3px] rounded-b-full bg-gradient-to-r from-[#223945] to-blue-500"
                    />
                  )}
                  <div className="flex flex-col items-center gap-1 pointer-events-none">
                    <item.icon
                      className={`w-[22px] h-[22px] transition-colors duration-200 ${
                        active ? 'text-[#223945]' : 'text-neutral-400'
                      }`}
                    />
                    <span
                      className={`text-[10px] leading-none transition-colors duration-200 ${
                        active ? 'font-bold text-[#223945]' : 'font-medium text-neutral-400'
                      }`}
                    >
                      {item.mobileLabel}
                    </span>
                  </div>
                </>
              );

              if (active) {
                return (
                  <button
                    key={item.href}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    style={TAB_STYLE}
                    className="flex-1 h-full flex flex-col items-center justify-center relative"
                  >
                    {tabContent}
                  </button>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={TAB_STYLE}
                  className="flex-1 h-full flex flex-col items-center justify-center relative"
                >
                  {tabContent}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* ── DESKTOP SIDEBAR ───────────────────────────────────────────── */}
        <aside className="hidden md:flex w-72 bg-white/80 backdrop-blur-xl border-r border-white/50 flex-col shadow-sm fixed top-0 left-0 h-screen z-[100] pt-[3px]">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300" />

          {/* Brand */}
          <div className="p-6 pb-2">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 flex items-center justify-center shrink-0 group-hover:rotate-3 transition-transform duration-500">
                <Image src="/img/logo-edufinderCYL.png" alt="EduFinder CYL" width={40} height={40} className="object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[#223945] leading-tight group-hover:text-blue-600 transition-colors">
                  EduFinder CYL
                </span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md self-start mt-0.5 border border-blue-100">
                  Panel Admin
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1 mt-6">
            <p className="px-4 text-xs font-bold text-[#223945]/60 uppercase tracking-wider mb-2">Principal</p>
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm group relative ${
                    active
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-600 rounded-r-full"
                    />
                  )}
                  <item.icon
                    className={`w-5 h-5 transition-colors ${
                      active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer actions */}
          <div className="p-4 border-t border-slate-100 space-y-1">
            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sistema</p>
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a la App
            </Link>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-all text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>

          {/* User info */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#223945] flex items-center justify-center text-white font-bold text-xs shadow-md">
              {user?.name?.charAt(0)?.toUpperCase() ?? 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-700 truncate">{user?.name ?? 'Administrador'}</p>
              <p className="text-xs text-slate-400 truncate">EduFinder CYL</p>
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ──────────────────────────────────────────────── */}
        <main className="md:ml-72 min-h-screen">
          {/* Mobile top spacer: safe area + gradient line (3px) + top bar (3.5rem = h-14) */}
          <div
            aria-hidden="true"
            className="md:hidden"
            style={{ height: 'calc(env(safe-area-inset-top, 0px) + 3px + 3.5rem)' }}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="p-4 md:p-8 max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>

          {/* Mobile bottom spacer: bottom tabs (h-16 = 4rem) + safe area */}
          <div
            aria-hidden="true"
            className="md:hidden"
            style={{ height: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}
          />
        </main>

        <LogoutConfirmationModal
          key="logout-modal-admin"
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={handleLogoutConfirm}
          isLoggingOut={isLoggingOut}
        />
      </div>
    </AdminGuard>
  );
}
