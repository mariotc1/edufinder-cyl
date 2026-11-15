import { ChevronDown, X, Wrench, BookOpen, Blocks, HeartHandshake, type LucideIcon } from 'lucide-react';

// CONTROLES DE FILTRO COMPARTIDOS
// Usados por el buscador (FilterBar) y el panel del mapa (MapSidebar) para que se vean y se comporten igual

// Tipos de enseñanza como botones con icono; sin "Todos": tocar el activo lo deselecciona
export const TIPO_TILES: { value: string; label: string; icon: LucideIcon }[] = [
  { value: 'FP', label: 'FP', icon: Wrench },
  { value: 'ESO', label: 'ESO y Bachillerato', icon: BookOpen },
  { value: 'PRIMARIA', label: 'Infantil y Primaria', icon: Blocks },
  { value: 'ESPECIAL', label: 'Educación especial', icon: HeartHandshake },
];

// Filtro en forma de pastilla: muestra el valor elegido y usa un <select> nativo invisible encima,
// así en móvil se abre el selector del sistema (rueda en iOS, lista en Android)
export function PillSelect({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  const selected = options.find(o => o.value === value);
  const active = Boolean(selected);
  return (
    <div
      className={`relative inline-flex items-center h-10 pl-4 pr-9 rounded-full border text-sm font-bold transition-all max-w-full ${
        active
          ? 'bg-[#223945] border-[#223945] text-white shadow-md shadow-[#223945]/20'
          : 'bg-white border-neutral-200 text-[#223945] hover:border-[#223945]/40'
      }`}
    >
      <span className="truncate">{selected ? selected.label : label}</span>
      {active ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label={`Quitar filtro ${label}`}
          className="absolute right-1.5 z-10 p-1 rounded-full hover:bg-white/15"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      ) : (
        <ChevronDown className="absolute right-3.5 w-4 h-4 text-neutral-400 pointer-events-none" />
      )}
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`absolute inset-y-0 left-0 opacity-0 cursor-pointer ${active ? 'right-8' : 'right-0'}`}
      >
        <option value="">{label}: todas</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
