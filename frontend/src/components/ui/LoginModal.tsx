'use client';

import { Fragment, Suspense } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, LogIn, UserPlus } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal(props: LoginModalProps) {
  return (
    <Suspense fallback={null}>
      <LoginModalContent {...props} />
    </Suspense>
  );
}

function LoginModalContent({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Construct the redirect URL for modal
  const getRedirectUrl = () => {
    const currentPath = `${pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    // Avoid double redirect if we somehow opened this on login page
    if (currentPath.startsWith('/login') || currentPath.startsWith('/registro')) return '';
    return `?redirect=${encodeURIComponent(currentPath)}`;
  };

  const redirectParam = getRedirectUrl();

  const handleLogin = () => {
    onClose();
    router.push(`/login${redirectParam}`);
  };

  const handleRegister = () => {
    onClose();
    router.push(`/registro${redirectParam}`);
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

                {/* Header - Simple clean background, no pulse animations */}
                <div className="bg-[#223945] px-6 pt-12 pb-8 relative overflow-hidden text-center">
                    {/* Pure color background, no obscured grid */}
                    
                    <div className="relative z-10 flex flex-col items-center">
                        {/* Icon Circle - Stationary, clean */}
                        <div className="mb-6 relative">
                            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                <LogIn className="h-9 w-9 text-white drop-shadow-md" aria-hidden="true" />
                            </div>
                        </div>

                        {/* Title - Pure white */}
                        <Dialog.Title 
                            as="h3" 
                            className="text-2xl font-bold leading-6 !text-white tracking-tight mb-3"
                            style={{ color: '#ffffff' }}
                        >
                            Inicia sesión
                        </Dialog.Title>
                        
                        {/* Description - Pure white */}
                        <p 
                            className="text-base !text-white font-medium leading-relaxed max-w-[280px] mx-auto"
                            style={{ color: '#ffffff' }}
                        >
                            Necesitas una cuenta para guardar favoritos, comparar centros y acceder a tus preferencias siempre.
                        </p>
                    </div>
                </div>

                {/* Content / Buttons */}
                <div className="px-6 py-8 space-y-4 bg-white relative">
                  <div className="flex flex-col gap-3.5 relative z-10">
                    {/* Primary Button */}
                    <button
                        onClick={handleLogin}
                        className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-[#223945] hover:bg-[#1a2c35] focus:outline-none shadow-lg shadow-[#223945]/20 hover:shadow-[#223945]/40 hover:-translate-y-0.5 transition-all duration-300"
                    >
                        <span className="flex items-center gap-2">
                            <LogIn className="h-5 w-5 text-blue-200" aria-hidden="true" />
                            Iniciar Sesión
                        </span>
                    </button>

                    {/* Secondary Button */}
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
                  
                  {/* Footer - Restored full text */}
                  <div className="mt-6 text-center border-t border-neutral-100 pt-6">
                    <p className="text-xs text-neutral-500">
                        ¿Solo estás mirando? <button onClick={onClose} className="text-[#223945] font-bold hover:underline">Continuar sin cuenta</button>
                    </p>
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
