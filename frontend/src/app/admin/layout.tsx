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
      <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
        
        {/* Modern Sidebar - Glass & Light */}
        <aside className="w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200 flex flex-col fixed h-full z-50 shadow-sm">
          
          {/* Brand Header */}
          <div className="p-8 pb-4">
             <div className="flex items-center gap-2 mb-1">
                <Logo />
             </div>
             <div className="px-1">
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded-md">
                    Admin Portal
                </span>
             </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1 mt-6">
            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Principal</p>
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
