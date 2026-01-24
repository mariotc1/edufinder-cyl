'use client';

import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  showSubtitle?: boolean;
}

export default function Logo({ className = '', showSubtitle = false }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-3 group ${className}`}>
      <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
        <Image
          src="/img/logo.png"
          alt="EduFinder CYL Logo"
          width={48}
          height={48}
          className="object-contain"
          priority
        />
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
