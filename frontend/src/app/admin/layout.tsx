'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, ArrowLeft, LogOut, Menu, X, School, Settings } from 'lucide-react';
import AdminGuard from '@/components/auth/AdminGuard';
import Logo from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import LogoutConfirmationModal from '@/components/auth/LogoutConfirmationModal';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Usuarios', href: '/admin/users', icon: Users },
    { name: 'Centros', href: '/admin/centros', icon: School },
    { name: 'Configuración', href: '/admin/settings', icon: Settings },
  ];

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    setShowLogoutModal(false);
    window.location.href = '/login';
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-brand-gradient flex flex-col md:flex-row font-sans text-slate-800 relative">
        {/* Decorative top gradient */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300 z-[60]"></div>
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
             <div className="flex items-center gap-2">
                <img src="/img/logo-edufinderCYL.png" alt="Logo" className="w-8 h-8 object-contain" />
                <span className="font-bold text-[#223945] text-sm">Panel Admin</span>
             </div>
             <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
             >
                 {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
             </button>
        </div>

        {/* Mobile Overlay */}
        <AnimatePresence>
            {mobileMenuOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setMobileMenuOpen(false)}
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                />
            )}
        </AnimatePresence>

        {/* Sidebar - Responsive */}
        <motion.aside 
            className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-white/80 backdrop-blur-xl border-r border-white/50 flex flex-col shadow-2xl md:shadow-sm pt-1 transition-transform duration-300 ease-in-out
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}
        >
          
          {/* Brand Header */}
          <div className="p-6 pb-2 flex justify-between items-center">
             <Link href="/" className="flex items-center gap-3 group">
                <div className="relative w-10 h-10 flex items-center justify-center shrink-0 group-hover:rotate-3 transition-transform duration-500">
                    <img
                        src="/img/logo-edufinderCYL.png"
                        alt="EduFinder CYL"
                        className="object-contain w-full h-full"
                    />
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
             <button onClick={() => setMobileMenuOpen(false)} className="md:hidden p-1 text-slate-400 hover:text-slate-600">
                 <X className="w-5 h-5" />
             </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1 mt-6">
            <p className="px-4 text-xs font-bold text-[#223945]/60 uppercase tracking-wider mb-2">Principal</p>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm group relative ${
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {/* Active Indicator Line */}
                  {isActive && (
                      <motion.div 
                        layoutId="activeNavIndicator"
                        className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-600 rounded-r-full"
                      />
                  )}
                  
                  <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer Actions */}
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
          
          {/* User Info Minimal */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-[#223945] flex items-center justify-center text-white font-bold text-xs shadow-md border border-slate-200">
                 A
             </div>
             <div className="flex-1 min-w-0">
                 <p className="text-sm font-bold text-slate-700 truncate">Administrador</p>
                 <p className="text-xs text-slate-400 truncate">EduFinder CYL</p>
             </div>
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <main className="flex-1 md:ml-72 min-h-screen">
            <AnimatePresence mode="wait">
                <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 md:p-8 max-w-7xl mx-auto"
                >
                    {children}
                </motion.div>
            </AnimatePresence>
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
