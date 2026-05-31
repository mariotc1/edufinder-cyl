import Image from 'next/image';
import Link from 'next/link';
import { Check } from 'lucide-react';

const FEATURES = [
  'Más de 2.400 centros educativos',
  'Mapa interactivo con geolocalización',
  'Comparador de hasta 4 centros',
  'Recomendaciones personalizadas con IA',
  'Totalmente gratuito',
];

export default function AuthBrandingPanel({ mode }: { mode: 'login' | 'register' }) {
  return (
    <div className="hidden md:flex md:w-[42%] lg:w-[45%] flex-col justify-between p-10 lg:p-14 relative overflow-hidden bg-gradient-to-br from-[#1b2e3a] via-[#223945] to-[#1c3347]">
      {/* Decorative blobs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-600/5 blur-3xl pointer-events-none" />

      {/* Top: logo + headline */}
      <div>
        <div className="flex items-center gap-3 mb-10">
          <Image
            src="/img/logo-edufinderCYL.png"
            alt="EduFinder CYL"
            width={44}
            height={44}
            className="rounded-xl"
          />
          <div>
            <div className="text-white font-bold text-xl leading-tight">EduFinder CYL</div>
            <div className="text-blue-300/70 text-xs font-medium">Educación en Castilla y León</div>
          </div>
        </div>

        <h2 className="text-3xl lg:text-4xl font-bold text-white leading-snug mb-3">
          Encuentra tu centro<br />educativo ideal
        </h2>
        <p className="text-blue-200/60 text-sm leading-relaxed max-w-xs">
          Accede a toda la oferta educativa de Castilla y León en un solo lugar.
        </p>
      </div>

      {/* Middle: feature list */}
      <div className="space-y-3.5 my-10">
        {FEATURES.map((feature, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-blue-400/20 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-blue-300" strokeWidth={3} />
            </div>
            <span className="text-blue-100/80 text-sm font-medium">{feature}</span>
          </div>
        ))}
      </div>

      {/* Bottom: switch link + attribution */}
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          {mode === 'login' ? (
            <p className="text-blue-200/70 text-sm">
              ¿Nuevo en EduFinder?{' '}
              <Link href="/registro" className="text-white font-semibold hover:text-blue-200 transition-colors">
                Crea tu cuenta gratis →
              </Link>
            </p>
          ) : (
            <p className="text-blue-200/70 text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-white font-semibold hover:text-blue-200 transition-colors">
                Inicia sesión →
              </Link>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-blue-400/30 rounded-full" />
          <p className="text-blue-300/40 text-xs">Datos abiertos de la Junta de Castilla y León</p>
        </div>
      </div>
    </div>
  );
}
