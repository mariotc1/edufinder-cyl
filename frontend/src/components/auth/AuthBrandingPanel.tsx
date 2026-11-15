import Image from 'next/image';
import { Check } from 'lucide-react';

const FEATURES = [
  'Todos los centros y ciclos de FP de Castilla y León',
  'Descubre qué FP encaja contigo en 3 minutos',
  'Guarda favoritos y compara hasta 3 centros',
  'Recomendaciones según lo que te interesa',
  'Gratis y con datos oficiales de la Junta',
];

export default function AuthBrandingPanel({ mode }: { mode: 'login' | 'register' }) {
  return (
    <div className="hidden lg:flex lg:w-[44%] flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br from-[#1b2e3a] via-[#223945] to-[#1e3a8a]">
      {/* Decorative blobs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-600/5 blur-3xl pointer-events-none" />

      {/* Top: logo + headline */}
      <div>
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-lg shadow-black/20 flex items-center justify-center">
            <Image
              src="/img/logo-edufinderCYL.png"
              alt="EduFinder CYL"
              width={34}
              height={34}
            />
          </div>
          <div>
            <div className="text-white font-bold text-xl leading-tight">EduFinder CYL</div>
            <div className="text-blue-300/70 text-xs font-medium">Educación en Castilla y León</div>
          </div>
        </div>

        <h2 className="text-3xl lg:text-4xl font-bold !text-white leading-snug mb-3">
          {mode === 'login' ? <>Qué bien<br />verte de nuevo</> : <>Tu futuro empieza<br />por una buena elección</>}
        </h2>
        <p className="!text-blue-200/70 text-sm leading-relaxed max-w-xs">
          Encuentra qué estudiar y dónde hacerlo en Castilla y León.
        </p>
      </div>

      {/* Middle: feature list */}
      <div className="space-y-3.5 my-10">
        {FEATURES.map((feature, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-blue-400/20 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-blue-300" strokeWidth={3} />
            </div>
            <span className="text-blue-100/85 text-sm font-medium">{feature}</span>
          </div>
        ))}
      </div>

      {/* Bottom: switch link + attribution */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-blue-400/30 rounded-full" />
          <p className="!text-blue-300/60 text-xs">Datos abiertos de la Junta de Castilla y León</p>
        </div>
      </div>
    </div>
  );
}
