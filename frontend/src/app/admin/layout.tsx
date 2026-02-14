'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, ArrowLeft, LogOut } from 'lucide-react';
import AdminGuard from '@/components/auth/AdminGuard';
import Logo from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Usuarios', href: '/admin/users', icon: Users },
  ];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-brand-gradient flex font-sans text-slate-800 relative">
        {/* Decorative top gradient - matching Navbar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300 z-[60]"></div>
        
        {/* Modern Sidebar - Glass & Light */}
        <aside className="w-72 bg-white/60 backdrop-blur-xl border-r border-white/50 flex flex-col fixed h-full z-50 shadow-sm pt-1">
          
          {/* Brand Header */}
          <div className="p-6 pb-2">
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
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-all text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
          
          {/* User Info Minimal */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                 A
             </div>
             <div className="flex-1 min-w-0">
                 <p className="text-sm font-bold text-slate-700 truncate">Administrador</p>
                 <p className="text-xs text-slate-400 truncate">EduFinder CYL</p>
             </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 ml-72">
            <AnimatePresence mode="wait">
                <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="p-8 max-w-7xl mx-auto"
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </main>
      </div>
    </AdminGuard>
  );
}
