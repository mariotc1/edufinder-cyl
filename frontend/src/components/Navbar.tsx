'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, MapPin, Heart, LogIn, UserPlus } from 'lucide-react';
import api from '@/lib/axios';
import Logo from './Logo';

export default function Navbar() {
  const [user, setUser] = useState<{name: string; foto_perfil?: string; email?: string} | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-neutral-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Logo showSubtitle />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="/mapa" 
              className="flex items-center gap-2 text-neutral-700 hover:text-primary-600 font-medium transition-colors"
            >
              <MapPin className="w-4 h-4" />
              Mapa
            </Link>
            
            {user ? (
              <>
                <Link 
                  href="/favoritos" 
                  className="flex items-center gap-2 text-neutral-700 hover:text-primary-600 font-medium transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  Favoritos
                </Link>
                
                    {/* Dropdown with State for robustness */}
                    <div className="relative">
                        <button 
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex items-center gap-2 text-neutral-700 hover:text-primary-600 font-medium px-3 py-2 rounded-lg hover:bg-neutral-50 transition-all focus:outline-none"
                        >
                            {user.foto_perfil ? (
                                 <img src={user.foto_perfil} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                                <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
                                    {user.name.charAt(0)}
                                </div>
                            )}
                            <span className="hidden lg:inline text-sm">{user.name}</span>
                        </button>
                        
                        {userMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)}></div>
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 border border-neutral-100 z-20 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="px-4 py-3 border-b border-neutral-100 mb-1">
                                        <p className="text-sm font-medium text-neutral-900 truncate">{user.name}</p>
                                        <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                                    </div>
                                    <Link 
                                        href="/perfil" 
                                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-primary-600"
                                        onClick={() => setUserMenuOpen(false)}
                                    >
                                        Mi Perfil
                                    </Link>
                                    <Link 
                                        href="/favoritos" 
                                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-primary-600"
                                        onClick={() => setUserMenuOpen(false)}
                                    >
                                        Mis Favoritos
                                    </Link>
                                    <div className="border-t border-neutral-100 my-1"></div>
                                    <button 
                                        onClick={() => {
                                            handleLogout();
                                            setUserMenuOpen(false);
                                        }}
                                        className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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
                  href="/login" 
                  className="flex items-center gap-2 text-neutral-700 hover:text-primary-600 font-medium transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Entrar
                </Link>
                <Link 
                  href="/registro" 
                  className="btn-primary flex items-center gap-2"
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
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            <Link 
              href="/mapa" 
              className="flex items-center gap-3 text-neutral-700 hover:text-primary-600 font-medium py-2 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <MapPin className="w-5 h-5" />
              Mapa
            </Link>
            
            {user ? (
              <>
                <Link 
                  href="/favoritos" 
                  className="flex items-center gap-3 text-neutral-700 hover:text-primary-600 font-medium py-2 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Heart className="w-5 h-5" />
                  Favoritos
                </Link>
                <div className="pt-2 border-t border-neutral-200">
                  <p className="text-sm text-neutral-600 mb-3">Sesión: {user.name}</p>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }} 
                    className="w-full text-left text-sm font-medium text-red-600 hover:text-red-700 py-2"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="flex items-center gap-3 text-neutral-700 hover:text-primary-600 font-medium py-2 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn className="w-5 h-5" />
                  Entrar
                </Link>
                <Link 
                  href="/registro" 
                  className="btn-primary w-full flex items-center justify-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserPlus className="w-5 h-5" />
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
