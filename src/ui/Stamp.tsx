import React, { useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Check, AlertTriangle, OctagonAlert } from 'lucide-react';
import { useT } from '@/i18n/useT';

export type VerdictType = 'ok' | 'warn' | 'bad';

export interface StampProps {
  verdict: VerdictType;
  issueCount?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Stamp: React.FC<StampProps> = ({
  verdict,
  issueCount = 0,
  className = '',
  size = 'md',
}) => {
  const { t } = useT();
  const shouldReduceMotion = useReducedMotion();

  // Haptic feedback for red verdict (peak moment, UX_PSYCHOLOGY §2 / DESIGN §8)
  useEffect(() => {
    if (
      !shouldReduceMotion &&
      verdict === 'bad' &&
      typeof window !== 'undefined' &&
      'vibrate' in navigator
    ) {
      try {
        navigator.vibrate(30);
      } catch {
        // Ignore devices where vibration permission or hardware is unavailable
      }
    }
  }, [verdict, shouldReduceMotion]);

  const config = {
    ok: {
      text: t('verdictOk'),
      icon: (
        <Check
          className={size === 'sm' ? 'w-4 h-4 stroke-[2.5]' : 'w-5 h-5 stroke-[2.5]'}
          aria-hidden="true"
        />
      ),
      colorClass: 'text-ok border-ok',
      bgClass: 'bg-ok-wash',
    },
    warn: {
      text: t('verdictWarn'),
      icon: (
        <AlertTriangle
          className={size === 'sm' ? 'w-4 h-4 stroke-[2.5]' : 'w-5 h-5 stroke-[2.5]'}
          aria-hidden="true"
        />
      ),
      colorClass: 'text-warn border-warn',
      bgClass: 'bg-warn-wash',
    },
    bad: {
      text: t('verdictBad'),
      icon: (
        <OctagonAlert
          className={size === 'sm' ? 'w-4 h-4 stroke-[2.5]' : 'w-5 h-5 stroke-[2.5]'}
          aria-hidden="true"
        />
      ),
      colorClass: 'text-bad border-bad',
      bgClass: 'bg-bad-wash',
    },
  }[verdict];

  const sizeClasses = {
    sm: 'p-2 sm:p-2.5 rounded-lg border-2',
    md: 'p-3 sm:p-4 rounded-xl border-4',
    lg: 'p-4 sm:p-6 rounded-2xl border-4',
  }[size];

  const textSize = {
    sm: 'text-sm font-semibold',
    md: 'text-lg sm:text-xl font-bold',
    lg: 'text-xl sm:text-2xl font-bold',
  }[size];

  const initialMotion = shouldReduceMotion
    ? { opacity: 0 }
    : { scale: 1.6, opacity: 0, rotate: -12 };

  const animateMotion = shouldReduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1, rotate: -4 };

  const transitionMotion = shouldReduceMotion
    ? { duration: 0.12 }
    : { type: 'spring' as const, stiffness: 500, damping: 22 };

  return (
    <motion.div
      initial={initialMotion}
      animate={animateMotion}
      transition={transitionMotion}
      className={`inline-flex flex-col items-center justify-center border-double select-none shadow-sm ${sizeClasses} ${config.colorClass} ${config.bgClass} ${className}`}
      style={{ transformOrigin: 'center center' }}
      role="status"
      aria-label={`${config.text}${issueCount > 0 ? `, ${t('seeIssues', { n: issueCount })}` : ''}`}
    >
      <div className="flex items-center gap-2">
        {config.icon}
        <span className={`font-serif tracking-wide ${textSize}`}>{config.text}</span>
      </div>

      {issueCount > 0 && (
        <span className="text-xs font-sans font-medium mt-1 opacity-90">
          {t('seeIssues', { n: issueCount })}
        </span>
      )}
    </motion.div>
  );
};

// Backwards compatibility alias
export const VerdictStamp = Stamp;
export type VerdictStampProps = StampProps;
