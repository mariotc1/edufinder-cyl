'use client';

import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

interface LogoProps {
  className?: string;
  showSubtitle?: boolean;
}

export default function Logo({ className = '', showSubtitle = false }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-3 group ${className}`}>
      <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg group-hover:bg-primary-700 transition-colors">
        <GraduationCap className="w-6 h-6 text-white" strokeWidth={2.5} />
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold text-neutral-900 group-hover:text-primary-700 transition-colors">
          EduFinder CYL
        </span>
        {showSubtitle && (
          <span className="text-xs text-neutral-600 hidden lg:block">
            Educación en Castilla y León
          </span>
        )}
      </div>
    </Link>
  );
}
