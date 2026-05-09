'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface TourProgressProps {
  currentStep: number;
  totalSteps: number;
}

export default function TourProgress({ currentStep, totalSteps }: TourProgressProps) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <motion.div
            key={index}
            className="relative"
            initial={false}
            animate={{
              scale: isCurrent ? 1.15 : 1,
            }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
            }}
          >
            {isCompleted ? (
              // Completed dot with checkmark
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center"
              >
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              </motion.div>
            ) : isCurrent ? (
              // Current dot with pulse
              <div className="relative">
                <motion.div
                  className="w-5 h-5 rounded-full bg-[#223945]"
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(34, 57, 69, 0.4)',
                      '0 0 0 5px rgba(34, 57, 69, 0)',
                    ],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                />
                <motion.div
                  className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {index + 1}
                </motion.div>
              </div>
            ) : (
              // Pending dot
              <div className="w-5 h-5 rounded-full border-2 border-neutral-300 bg-white" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
