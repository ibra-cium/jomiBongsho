import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Check, AlertTriangle, OctagonAlert } from 'lucide-react';
import { useT } from '@/i18n/useT';

export type VerdictType = 'ok' | 'warn' | 'bad';

export interface VerdictStampProps {
  verdict: VerdictType;
  issueCount?: number;
  className?: string;
}

export const VerdictStamp: React.FC<VerdictStampProps> = ({
  verdict,
  issueCount = 0,
  className = '',
}) => {
  const { t } = useT();
  const shouldReduceMotion = useReducedMotion();

  const config = {
    ok: {
      text: t('verdictOk'),
      icon: <Check className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />,
      colorClass: 'text-ok border-ok',
      bgClass: 'bg-ok-wash',
    },
    warn: {
      text: t('verdictWarn'),
      icon: <AlertTriangle className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />,
      colorClass: 'text-warn border-warn',
      bgClass: 'bg-warn-wash',
    },
    bad: {
      text: t('verdictBad'),
      icon: <OctagonAlert className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />,
      colorClass: 'text-bad border-bad',
      bgClass: 'bg-bad-wash',
    },
  }[verdict];

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
      className={`inline-flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border-4 border-double select-none shadow-sm ${config.colorClass} ${config.bgClass} ${className}`}
      style={{ transformOrigin: 'center center' }}
    >
      <div className="flex items-center gap-2">
        {config.icon}
        <span className="font-serif font-bold text-lg sm:text-xl tracking-wide">{config.text}</span>
      </div>

      {issueCount > 0 && (
        <span className="text-xs font-sans font-medium mt-1 opacity-90">
          {t('seeIssues', { n: issueCount })}
        </span>
      )}
    </motion.div>
  );
};
