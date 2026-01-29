'use client';

import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  showSubtitle?: boolean;
}

export default function Logo({ className = '', showSubtitle = false }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-3 group hover:bg-neutral-50/50 hover:scale-[1.02] transition-all duration-300 rounded-xl px-2 -ml-2 py-1 ${className}`}>
      <div className="relative w-12 h-12 flex items-center justify-center shrink-0 group-hover:rotate-3 transition-transform duration-500">
        <Image
          src="/img/logo-edufinderCYL.png"
          alt="EduFinder CYL Logo"
          width={48}
          height={48}
          className="object-contain"
          priority
        />
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold bg-gradient-to-r from-[#223945] via-blue-600 to-blue-400 bg-clip-text text-transparent group-hover:to-blue-600 transition-all">
          EduFinder CYL
        </span>
        {showSubtitle && (
          <span className="text-xs text-neutral-600 hidden lg:block font-medium group-hover:text-[#223945] transition-colors delay-75">
            Educación en Castilla y León
          </span>
        )}
      </div>
    </Link>
  );
}
