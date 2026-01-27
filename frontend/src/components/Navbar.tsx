'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Menu, X, MapPin, Heart, LogIn, UserPlus } from 'lucide-react';
// Remove local api import as it's used via context
import Logo from './Logo';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  /* Refactored to use AuthContext */
  const { user, logout, openLoginModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleLogout = () => {
      logout();
      router.push('/login');
  };

  // Construct the redirect URL
  const getRedirectUrl = () => {
      const currentPath = `${pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      // Avoid redirect loops if already on auth pages
      if (currentPath.startsWith('/login') || currentPath.startsWith('/registro')) return '';
      return `?redirect=${encodeURIComponent(currentPath)}`;
  };
  
  const redirectParam = getRedirectUrl();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm">
      {/* Decorative top gradient - matching other components */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#223945] via-blue-500 to-blue-300"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Logo showSubtitle />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              href="/mapa" 
              className="group flex items-center gap-2 text-neutral-600 hover:text-[#223945] font-bold text-sm uppercase tracking-wide transition-colors"
            >
              <MapPin className="w-4 h-4 group-hover:text-blue-600 transition-colors" />
              Mapa
            </Link>
            
            {user ? (
              <>
                <Link 
                  href="/favoritos" 
                  className="group flex items-center gap-2 text-neutral-600 hover:text-[#223945] font-bold text-sm uppercase tracking-wide transition-colors"
                >
                  <Heart id="nav-favorites-icon-desktop" className="w-4 h-4 group-hover:text-red-500 transition-colors" />
                  Favoritos
                </Link>
                
                    {/* Dropdown with State for robustness */}
                    <div className="relative">
                        <button 
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex items-center gap-3 text-neutral-700 hover:text-[#223945] font-medium pl-2 pr-4 py-1.5 rounded-full border border-transparent hover:border-neutral-200 hover:bg-neutral-50 transition-all focus:outline-none group"
                        >
                            {user.foto_perfil ? (
                                 <img src={user.foto_perfil} alt={user.name} className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm group-hover:border-[#223945]/20" />
                            ) : (
                                <div className="w-9 h-9 bg-[#223945]/10 text-[#223945] rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm group-hover:bg-[#223945] group-hover:text-white transition-colors">
                                    {user.name.charAt(0)}
                                </div>
                            )}
                            <span className="hidden lg:inline text-sm font-semibold">{user.name}</span>
                        </button>
                        
                        {userMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)}></div>
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.08)] py-2 border border-neutral-100 z-20 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="px-5 py-4 border-b border-neutral-100 mb-2 bg-neutral-50/50">
                                        <p className="text-sm font-bold text-[#223945] truncate">{user.name}</p>
                                        <p className="text-xs text-neutral-500 truncate mt-0.5">{user.email}</p>
                                    </div>
                                    <Link 
                                        href="/perfil" 
                                        className="block px-5 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-[#223945] transition-colors"
                                        onClick={() => setUserMenuOpen(false)}
                                    >
                                        Mi Perfil
                                    </Link>
                                    <Link 
                                        href="/favoritos" 
                                        className="block px-5 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-[#223945] transition-colors"
                                        onClick={() => setUserMenuOpen(false)}
                                    >
                                        Mis Favoritos
                                    </Link>
                                    <div className="border-t border-neutral-100 my-2"></div>
                                    <button 
                                        onClick={() => {
                                            handleLogout();
                                            setUserMenuOpen(false);
                                        }}
                                        className="w-full text-left block px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        Cerrar Sesión
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
              </>
            ) : (
              <>
                <Link 
                  href={`/login${redirectParam}`}
                  className="flex items-center gap-2 text-neutral-600 hover:text-[#223945] font-bold text-sm uppercase tracking-wide transition-colors px-4 py-2"
                >
                  <LogIn className="w-4 h-4" />
                  Entrar
                </Link>
                <Link 
                  href={`/registro${redirectParam}`} 
                  className="flex items-center gap-2 bg-[#223945] text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-md hover:shadow-lg hover:bg-[#1a2c35] hover:-translate-y-0.5 transition-all duration-200"
                >
                  <UserPlus className="w-4 h-4" />
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors"
            aria-label="Toggle menu"
            id="nav-mobile-menu-button"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white shadow-lg">
          <div className="px-4 py-6 space-y-4">
            <Link 
              href="/mapa" 
              className="flex items-center gap-3 text-neutral-600 hover:text-[#223945] font-bold py-2 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <MapPin className="w-5 h-5" />
              Mapa
            </Link>
            
            {user ? (
              <>
                <Link 
                  href="/favoritos" 
                  className="flex items-center gap-3 text-neutral-600 hover:text-[#223945] font-bold py-2 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Heart className="w-5 h-5" />
                  Favoritos
                </Link>
                <div className="pt-4 border-t border-neutral-100 mt-2">
                  <div className="flex items-center gap-3 mb-4">
                      {user.foto_perfil ? (
                           <img src={user.foto_perfil} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-neutral-200" />
                      ) : (
                          <div className="w-10 h-10 bg-[#223945]/10 text-[#223945] rounded-full flex items-center justify-center font-bold">
                              {user.name.charAt(0)}
                          </div>
                      )}
                      <div>
                          <p className="text-sm font-bold text-[#223945]">{user.name}</p>
                          <p className="text-xs text-neutral-500">{user.email}</p>
                      </div>
                  </div>
                  
                  <Link 
                    href="/perfil"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium text-neutral-600 py-2 hover:text-[#223945]"
                   >
                     Mi Perfil
                   </Link>

                  <button 
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }} 
                    className="w-full text-left text-sm font-bold text-red-600 hover:text-red-700 py-2 mt-2"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-4 border-t border-neutral-100 flex flex-col gap-3">
                <Link 
                  href={`/login${redirectParam}`}
                  className="flex items-center gap-3 text-neutral-600 hover:text-[#223945] font-bold py-2 transition-colors justify-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn className="w-5 h-5" />
                  Entrar
                </Link>
                <Link 
                  href={`/registro${redirectParam}`} 
                  className="w-full flex items-center justify-center gap-2 bg-[#223945] text-white px-5 py-3 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserPlus className="w-5 h-5" />
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
