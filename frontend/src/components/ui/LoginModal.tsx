'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-neutral-100">
                {/* Close Button */}
                <div className="absolute right-4 top-4 z-10">
                  <button
                    type="button"
                    className="rounded-full bg-neutral-100 p-2 text-neutral-400 hover:text-neutral-500 hover:bg-neutral-200 transition-colors focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Cerrar</span>
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                {/* Decorative Pattern / Header */}
                <div className="bg-[#223945] px-6 py-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                    <div className="absolute top-0 right-0 p-8 w-64 h-64 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm mb-4 ring-4 ring-white/5">
                            <LogIn className="h-8 w-8 text-white" aria-hidden="true" />
                        </div>
                        <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-white tracking-tight">
                            Inicia sesión
                        </Dialog.Title>
                        <p className="mt-2 text-sm text-blue-100">
                            Necesitas una cuenta para guardar tus centros favoritos y acceder a ellos desde cualquier dispositivo.
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-6 sm:px-8 space-y-4">
                  <div className="flex flex-col gap-3">
                    <button
                        onClick={handleLogin}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-[#223945] hover:bg-[#1a2c35] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#223945] shadow-lg shadow-[#223945]/30 hover:shadow-[#223945]/50 hover:-translate-y-0.5 transition-all duration-200"
                    >
                        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                            <LogIn className="h-5 w-5 text-blue-300 group-hover:text-blue-200" aria-hidden="true" />
                        </span>
                        Iniciar Sesión
                    </button>

                    <button
                        onClick={handleRegister}
                        className="group relative w-full flex justify-center py-3 px-4 border-2 border-neutral-200 text-sm font-bold rounded-xl text-neutral-700 bg-white hover:bg-neutral-50 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 transition-all duration-200"
                    >
                        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                            <UserPlus className="h-5 w-5 text-neutral-400 group-hover:text-neutral-500" aria-hidden="true" />
                        </span>
                        Crear Cuenta Gratis
                    </button>
                  </div>
                  
                  <div className="mt-4 text-center">
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
