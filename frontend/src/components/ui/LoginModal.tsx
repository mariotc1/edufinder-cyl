'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, LogIn, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();

  const handleLogin = () => {
    onClose();
    router.push('/login');
  };

  const handleRegister = () => {
    onClose();
    router.push('/registro');
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-sm ring-1 ring-black/5">
                {/* Close Button - Red hover effect */}
                <div className="absolute right-4 top-4 z-20">
                  <button
                    type="button"
                    className="rounded-full bg-black/10 p-2 text-white/70 hover:text-red-500 hover:bg-white transition-all duration-200 focus:outline-none backdrop-blur-sm"
                    onClick={onClose}
                  >
                    <span className="sr-only">Cerrar</span>
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                {/* Decorative Pattern / Header */}
                <div className="bg-[#223945] px-6 pt-12 pb-8 relative overflow-hidden text-center">
                    {/* Background effects */}
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
                    <div className="absolute top-0 right-0 p-8 w-64 h-64 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 p-8 w-48 h-48 bg-emerald-500 rounded-full mix-blend-overlay filter blur-3xl opacity-10 translate-y-1/2 -translate-x-1/2"></div>
                    
                    <div className="relative z-10 flex flex-col items-center">
                        {/* Icon Circle - Improved look */}
                        <div className="mb-6 relative">
                            <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
                            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                <LogIn className="h-9 w-9 text-white drop-shadow-md" aria-hidden="true" />
                            </div>
                        </div>

                        <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-white tracking-tight mb-3">
                            Inicia sesión
                        </Dialog.Title>
                        
                        {/* Improved contrast for description */}
                        <p className="text-base text-white/90 font-medium leading-relaxed max-w-[280px] mx-auto">
                            Necesitas una cuenta para guardar tus centros favoritos y acceder a ellos siempre.
                        </p>
                    </div>
                </div>

                {/* Content / Buttons */}
                <div className="px-6 py-8 space-y-4 bg-white relative">
                  {/* Decorative faint gradient at top of white area */}
                  <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-[#223945]/5 to-transparent"></div>

                  <div className="flex flex-col gap-3.5 relative z-10">
                    {/* Primary Button - Polished */}
                    <button
                        onClick={handleLogin}
                        className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-[#223945] hover:bg-[#1a2c35] focus:outline-none shadow-lg shadow-[#223945]/20 hover:shadow-[#223945]/40 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                        <span className="flex items-center gap-2">
                            <LogIn className="h-5 w-5 text-blue-200" aria-hidden="true" />
                            Iniciar Sesión
                        </span>
                    </button>

                    {/* Secondary Button - Polished */}
                    <button
                        onClick={handleRegister}
                        className="group relative w-full flex justify-center py-3.5 px-4 border-2 border-neutral-100 text-sm font-bold rounded-2xl text-neutral-600 bg-white hover:bg-neutral-50 hover:border-[#223945]/20 hover:text-[#223945] focus:outline-none transition-all duration-300"
                    >
                        <span className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5 text-neutral-400 group-hover:text-[#223945] transition-colors" aria-hidden="true" />
                            Crear Cuenta Gratis
                        </span>
                    </button>
                  </div>
                  
                  <div className="mt-6 text-center border-t border-neutral-100 pt-6">
                    <button 
                        onClick={onClose} 
                        className="text-xs font-bold text-neutral-400 hover:text-[#223945] transition-colors uppercase tracking-wider"
                    >
                        Continuar sin cuenta
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
