'use client';

import { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { X, Download, Smartphone, CheckCircle, Share, PlusSquare, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PWAContextType {
  isInstalled: boolean;
  isInstallable: boolean;
  isOnline: boolean;
  isPWASupported: boolean;
  isIOS: boolean;
  showIOSInstallGuide: () => void;
  installApp: () => Promise<void>;
}

const PWAContext = createContext<PWAContextType>({
  isInstalled: false,
  isInstallable: false,
  isOnline: true,
  isPWASupported: false,
  isIOS: false,
  showIOSInstallGuide: () => {},
  installApp: async () => {},
});

export const usePWA = () => useContext(PWAContext);

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isPWASupported, setIsPWASupported] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // Registrar Service Worker
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // Detectar iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Comprobar soporte PWA
    const hasSW = 'serviceWorker' in navigator;
    setIsPWASupported(hasSW);

    if (!hasSW) {
      return;
    }

    // Comprobar si ya está instalada
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isIOSStandalone);
    };

    checkInstalled();

    // Registrar SW
    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('[PWA] Service Worker registrado:', registration.scope);

        // Comprobar actualizaciones
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Hay una nueva versión disponible
                setShowUpdateBanner(true);
              }
            });
          }
        });
      } catch (error) {
        console.error('[PWA] Error registrando SW:', error);
      }
    };

    registerSW();

    // Escuchar cambios en el modo de visualización
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayChange = () => checkInstalled();
    mediaQuery.addEventListener('change', handleDisplayChange);

    return () => {
      mediaQuery.removeEventListener('change', handleDisplayChange);
    };
  }, []);

  // Manejar evento beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);

      // Mostrar banner después de un tiempo si no ha sido descartado
      const dismissed = localStorage.getItem('pwa-banner-dismissed');
      const dismissedTime = dismissed ? parseInt(dismissed) : 0;
      const dayInMs = 24 * 60 * 60 * 1000;

      if (!dismissed || Date.now() - dismissedTime > dayInMs * 7) {
        setTimeout(() => {
          if (!isInstalled) {
            setShowInstallBanner(true);
          }
        }, 30000); // Mostrar después de 30 segundos
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setShowInstallBanner(false);
      setJustInstalled(true);
      setTimeout(() => setJustInstalled(false), 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  // Manejar estado de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Función para instalar la app
  const installApp = useCallback(async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('[PWA] Usuario aceptó instalar');
      } else {
        console.log('[PWA] Usuario rechazó instalar');
      }

      setDeferredPrompt(null);
      setIsInstallable(false);
      setShowInstallBanner(false);
    } catch (error) {
      console.error('[PWA] Error instalando:', error);
    }
  }, [deferredPrompt]);

  const dismissBanner = () => {
    setShowInstallBanner(false);
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
  };

  const showIOSInstallGuide = useCallback(() => {
    setShowIOSGuide(true);
  }, []);

  const handleUpdate = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  return (
    <PWAContext.Provider value={{ isInstalled, isInstallable, isOnline, isPWASupported, isIOS, showIOSInstallGuide, installApp }}>
      {children}

      {/* Banner de instalación */}
      <AnimatePresence>
        {showInstallBanner && !isInstalled && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[100]"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden">
              <div className="bg-gradient-to-r from-[#223945] to-blue-600 px-4 py-3 flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">Instalar EduFinder CYL</p>
                </div>
                <button
                  onClick={dismissBanner}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="p-4">
                <p className="text-neutral-600 text-sm mb-4">
                  Instala la app para acceso rápido, funcionar sin conexión y recibir notificaciones.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={dismissBanner}
                    className="flex-1 px-4 py-2.5 text-neutral-500 font-bold text-sm hover:bg-neutral-50 rounded-xl transition-colors"
                  >
                    Ahora no
                  </button>
                  <button
                    onClick={installApp}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#223945] text-white font-bold text-sm rounded-xl hover:bg-[#1a2c35] transition-colors shadow-lg shadow-[#223945]/20"
                  >
                    <Download className="w-4 h-4" />
                    Instalar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banner de actualización disponible */}
      <AnimatePresence>
        {showUpdateBanner && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto z-[100]"
          >
            <div className="bg-blue-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 flex-wrap justify-center">
              <p className="text-sm font-medium">Nueva versión disponible</p>
              <button
                onClick={handleUpdate}
                className="px-4 py-1.5 bg-white text-blue-600 font-bold text-sm rounded-lg hover:bg-blue-50 transition-colors"
              >
                Actualizar
              </button>
              <button
                onClick={() => setShowUpdateBanner(false)}
                className="p-1 hover:bg-white/10 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notificación de instalación exitosa */}
      <AnimatePresence>
        {justInstalled && (
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.9 }}
            className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto z-[100]"
          >
            <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
              <CheckCircle className="w-6 h-6" />
              <p className="font-bold">App instalada correctamente</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicador de offline */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white text-center py-2 text-sm font-medium"
          >
            Sin conexión - Algunas funciones pueden no estar disponibles
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de instrucciones para iOS */}
      <AnimatePresence>
        {showIOSGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowIOSGuide(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#223945] to-blue-600 px-6 py-5 relative">
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold !text-white">Instalar en iPhone</h3>
                    <p className="text-sm !text-white">Sigue estos pasos en Safari</p>
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div className="p-6 space-y-5">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#223945] text-white rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-800 mb-1">Abre en Safari</p>
                    <p className="text-sm text-neutral-500">Esta función solo está disponible en Safari</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#223945] text-white rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-800 mb-2">Pulsa el botón Compartir</p>
                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-neutral-100 rounded-xl">
                      <Share className="w-5 h-5 text-blue-500" />
                      <span className="text-sm text-neutral-600">Botón compartir</span>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#223945] text-white rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-800 mb-2">Añadir a pantalla de inicio</p>
                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-neutral-100 rounded-xl">
                      <PlusSquare className="w-5 h-5 text-neutral-600" />
                      <span className="text-sm text-neutral-600">Añadir a inicio</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6">
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="w-full py-3 bg-[#223945] text-white font-bold rounded-xl hover:bg-[#1a2c35] transition-colors"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PWAContext.Provider>
  );
}
