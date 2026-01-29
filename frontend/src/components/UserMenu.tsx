'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button - Matches 'Pill' design of other links */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`
            flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full border transition-all duration-300 group
            ${isOpen 
                ? 'bg-white border-neutral-200 shadow-sm' 
                : 'border-transparent hover:bg-white hover:border-neutral-200 hover:shadow-sm'
            }
        `}
      >
        {user.foto_perfil ? (
             <img 
                src={user.foto_perfil} 
                alt={user.name} 
                className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-105 transition-transform" 
             />
        ) : (
            <div className="w-9 h-9 bg-gradient-to-br from-[#223945] to-blue-600 text-white rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                {user.name.charAt(0)}
            </div>
        )}
        
        <div className="flex flex-col items-start text-left">
            <span className="text-sm font-bold text-[#223945] leading-tight group-hover:text-blue-900 transition-colors">
                {user.name.split(' ')[0]}
            </span>
            <span className="text-[10px] text-neutral-500 font-medium leading-tight">
                Mi Cuenta
            </span>
        </div>
        
        <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }} 
                style={{ transformOrigin: 'top right' }}
                className="absolute right-0 mt-4 w-72 z-50 filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
            >
                {/* Speech Bubble Arrow */}
                {/* Speech Bubble Arrow - Solid color matches the gradient end for seamless look */}
                <div className="absolute -top-1.5 right-[22px] w-5 h-5 bg-blue-600 rotate-45 rounded-[1px] z-0 shadow-sm"></div>

                <div className="bg-white rounded-2xl overflow-hidden relative z-10">
                    {/* Header - Gradient & Stats */}
                    {/* Header - Gradient & Stats */}
                    <div className="bg-gradient-to-r from-[#223945] to-blue-600 p-5 text-white relative overflow-hidden">
                        {/* Abstract Shapes/Noise */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl -ml-10 -mb-10"></div>
                        
                        <div className="relative z-10">
                            <p className="font-bold text-lg leading-tight !text-white">{user.name}</p>
                            <p className="!text-white/90 text-xs font-medium truncate opacity-100 mt-1">{user.email}</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-2">
                    <Link 
                        href="/perfil" 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors group mb-1"
                    >
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 group-hover:scale-110 transition-all">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-neutral-800">Mi Perfil</p>
                            <p className="text-xs text-neutral-500">Gestiona tu foto y datos</p>
                        </div>
                    </Link>

                    <div className="h-px bg-neutral-100 my-1 mx-2"></div>

                    <button 
                        onClick={() => {
                            logout();
                            setIsOpen(false);
                            // Optional: Redirect handled by wrapper or logic
                            window.location.href = '/login';
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors group text-left"
                    >
                        <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center group-hover:bg-red-100 group-hover:scale-110 transition-all">
                            <LogOut className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-red-600">Cerrar Sesión</p>
                            <p className="text-xs text-red-400/80">Salir de tu cuenta</p>
                        </div>
                    </button>
                </div>
              </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
