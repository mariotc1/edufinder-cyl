'use client';

import { Heart, Eye, TrendingUp, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { InterestBadge } from '@/types';

interface InterestBadgesProps {
    badges: InterestBadge[];
    size?: 'sm' | 'md';
}

const BADGE_CONFIG = {
    favorites: {
        icon: Heart,
        classes: 'bg-rose-50 text-rose-600 border-rose-100',
        iconClass: 'fill-rose-500 text-rose-500',
    },
    views: {
        icon: Eye,
        classes: 'bg-sky-50 text-sky-600 border-sky-100',
        iconClass: 'text-sky-500',
    },
    trending: {
        icon: TrendingUp,
        classes: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        iconClass: 'text-emerald-500',
    },
    province: {
        icon: MapPin,
        classes: 'bg-amber-50 text-amber-600 border-amber-100',
        iconClass: 'text-amber-500',
    },
} as const;

export default function InterestBadges({ badges, size = 'sm' }: InterestBadgesProps) {
    if (!badges || badges.length === 0) return null;

    const iconSize = size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3';
    const textSize = size === 'md' ? 'text-xs' : 'text-[10px]';
    const padding = size === 'md' ? 'px-2.5 py-1.5' : 'px-2 py-1';

    return (
        <div className="flex flex-wrap gap-1.5">
            {badges.map((badge, i) => {
                const config = BADGE_CONFIG[badge.type];
                if (!config) return null;
                const Icon = config.icon;

                return (
                    <motion.span
                        key={badge.type}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.06, duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                        className={`inline-flex items-center gap-1 ${padding} rounded-full border font-medium ${config.classes} ${textSize}`}
                    >
                        <Icon className={`${iconSize} shrink-0 ${config.iconClass}`} />
                        {badge.label}
                    </motion.span>
                );
            })}
        </div>
    );
}
