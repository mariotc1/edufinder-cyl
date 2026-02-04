'use client';

import React, { Suspense } from 'react';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Menu, X, MapPin, Heart, LogIn, UserPlus, User as UserMenuIcon, LogOut as LogOutIcon } from 'lucide-react';
import Logo from './Logo';
import UserMenu from './UserMenu';
import { useAuth } from '@/context/AuthContext';
import { useFavoritesAnimation } from '@/context/FavoritesAnimationContext';
import { motion } from 'framer-motion';

// COMPONENTE LAYOUT: BARRA DE NAVEGACIÓN SUPERIOR
// Utiliza Suspense para cargar contenido dependiente del cliente (useSearchParams)
export default function Navbar() {
  return (
    <Suspense fallback={<nav className="fixed top-0 left-0 w-full z-[100] bg-white/95 h-20 border-b border-neutral-200" />}>
      <NavbarContent />
    </Suspense>
  );
}

// CONTENIDO DE LA BARRA DE NAVEGACIÓN
function NavbarContent() {
  const { user, logout, openLoginModal } = useAuth();
  const { favoritesPulse } = useFavoritesAnimation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleLogout = () => {
      logout();
      router.push('/login');
  };

  // Lógica de redirección tras login: mantiene la página actual y filtros
  const getRedirectUrl = () => {
      const currentPath = `${pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      if (currentPath.startsWith('/login') || currentPath.startsWith('/registro')) return '';
      return `?redirect=${encodeURIComponent(currentPath)}`;
  };
  
  const redirectParam = getRedirectUrl();

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm">
      {/* Decorative top gradient - matching other components */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Logo showSubtitle />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              href="/mapa" 
              className="group flex items-center gap-2 px-4 py-2 rounded-full text-[#223945] font-bold text-sm uppercase tracking-wide border border-transparent hover:border-neutral-200 hover:bg-white hover:shadow-sm transition-all duration-300"
            >
              <MapPin className="w-4 h-4 text-neutral-400 group-hover:text-blue-600 transition-colors" />
              Mapa
            </Link>
            
            {user ? (
              <>
                <Link 
                  href="/favoritos" 
                  className="group flex items-center gap-2 px-4 py-2 rounded-full text-[#223945] font-bold text-sm uppercase tracking-wide border border-transparent hover:border-neutral-200 hover:bg-white hover:shadow-sm transition-all duration-300"
                >
                  {/* Puliing Heart Icon */}
                  <motion.div
                    animate={favoritesPulse ? { scale: [1, 1.4, 1], color: ['#525252', '#ef4444', '#525252'] } : {}}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                     <Heart id="nav-favorites-icon-desktop" className="w-4 h-4 text-neutral-400 group-hover:text-red-500 transition-colors" />
                     {favoritesPulse && (
                         <span className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75"></span>
                     )}
                  </motion.div>
                  Favoritos
                </Link>
                
                {/* New Modern User Menu */}
                <UserMenu />
              </>
            ) : (
              <>
                <Link 
                  href={`/login${redirectParam}`}
                  className="flex items-center gap-2 text-neutral-700 hover:text-blue-700 font-bold text-sm uppercase tracking-wide transition-all px-5 py-2.5 rounded-full hover:bg-neutral-50"
                >
                  <LogIn className="w-4 h-4" />
                  Entrar
                </Link>
                <Link 
                  href={`/registro${redirectParam}`} 
                  className="flex items-center gap-2 bg-gradient-to-r from-[#223945] to-blue-600 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-blue-900/20 hover:shadow-blue-900/30 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <UserPlus className="w-4 h-4" />
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            animate={favoritesPulse ? { scale: [1, 1.2, 1], backgroundColor: ["rgba(0,0,0,0)", "rgba(239,68,68,0.1)", "rgba(0,0,0,0)"] } : {}}
            transition={{ duration: 0.3 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors relative"
            aria-label="Toggle menu"
            id="nav-mobile-menu-button"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </div>

      {/* Menú Móvil Desplegable */}
      <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={mobileMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="md:hidden overflow-hidden bg-white border-b border-neutral-100 shadow-xl"
      >
          <div className="px-4 py-6 space-y-4">
            
            {/* User Header (Mobile) */}
            {user && (
                <div className="bg-gradient-to-r from-[#223945] to-blue-600 rounded-2xl p-5 text-white mb-6 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="relative z-10 flex items-center gap-4">
                         {user.foto_perfil ? (
                             <img src={user.foto_perfil} alt={user.name} className="w-14 h-14 rounded-full border-2 border-white/30 shadow-sm object-cover" />
                        ) : (
                            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-xl font-bold border-2 border-white/20">
                                {user.name.charAt(0)}
                            </div>
                        )}
                        <div>
                            <p className="font-bold text-lg leading-tight !text-white">{user.name}</p>
                            <p className="!text-white/90 text-xs font-medium truncate">{user.email}</p>
                        </div>
                    </div>
                </div>
            )}

            <Link 
              href="/mapa" 
              className="flex items-center gap-4 px-4 py-3 rounded-xl bg-neutral-50 text-neutral-700 font-bold hover:bg-blue-50 hover:text-blue-700 transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="w-8 h-8 rounded-full bg-white text-blue-500 shadow-sm flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
              </div>
              Mapa
            </Link>
            
            {user ? (
              <>
                <Link 
                  href="/favoritos" 
                  className="flex items-center gap-4 px-4 py-3 rounded-xl bg-neutral-50 text-neutral-700 font-bold hover:bg-red-50 hover:text-red-600 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="w-8 h-8 rounded-full bg-white text-red-500 shadow-sm flex items-center justify-center">
                      <Heart className="w-4 h-4" />
                  </div>
                  Favoritos
                </Link>

                <div className="h-px bg-neutral-100 my-2"></div>
                  
                <Link 
                  href="/perfil"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-neutral-50 text-neutral-600 font-medium transition-all"
                 >
                   <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center">
                       <UserMenuIcon className="w-4 h-4" /> 
                   </div>
                   Mi Perfil
                 </Link>

                <button 
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }} 
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 font-bold transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center">
                      <LogOutIcon className="w-4 h-4" />
                  </div>
                  Cerrar sesión
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3 mt-4">
                <Link 
                  href={`/login${redirectParam}`}
                  className="flex items-center justify-center gap-2 text-neutral-600 font-bold py-3 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn className="w-5 h-5" />
                  Entrar
                </Link>
                <Link 
                  href={`/registro${redirectParam}`} 
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#223945] to-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserPlus className="w-5 h-5" />
                  Registrarse
                </Link>
              </div>
            )}
          </div>
      </motion.div>
    </nav>
  );
}
