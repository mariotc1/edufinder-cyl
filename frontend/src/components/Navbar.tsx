'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, MapPin, Heart, LogIn, UserPlus } from 'lucide-react';
import api from '@/lib/axios';
import Logo from './Logo';

export default function Navbar() {
  const [user, setUser] = useState<{name: string} | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
                <span className="text-sm text-neutral-600 px-3 py-2 bg-neutral-100 rounded-lg">
                  {user.name}
                </span>
                <button 
                  onClick={handleLogout} 
                  className="text-sm font-medium text-neutral-700 hover:text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-all"
                >
                  Salir
                </button>
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
