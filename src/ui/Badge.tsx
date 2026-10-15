import React from 'react';
import { Check, AlertTriangle, OctagonAlert, Info } from 'lucide-react';

export type BadgeVariant = 'ok' | 'warn' | 'bad' | 'neutral';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant,
  size = 'md',
  icon,
  children,
  className = '',
  ...rest
}) => {
  const defaultIcons: Record<BadgeVariant, React.ReactNode> = {
    ok: <Check className="w-3.5 h-3.5 stroke-[2.2]" aria-hidden="true" />,
    warn: <AlertTriangle className="w-3.5 h-3.5 stroke-[2.2]" aria-hidden="true" />,
    bad: <OctagonAlert className="w-3.5 h-3.5 stroke-[2.2]" aria-hidden="true" />,
    neutral: <Info className="w-3.5 h-3.5 stroke-[2.2]" aria-hidden="true" />,
  };

  const variantStyles: Record<BadgeVariant, string> = {
    ok: 'bg-ok-wash text-ok border-ok/30',
    warn: 'bg-warn-wash text-warn border-warn/30',
    bad: 'bg-bad-wash text-bad border-bad/30',
    neutral: 'bg-paper-3 text-ink-2 border-line',
  };

  const sizeStyles: Record<BadgeSize, string> = {
    sm: 'text-xs px-2 py-0.5 gap-1 rounded-[8px]',
    md: 'text-sm px-2.5 py-1 gap-1.5 rounded-[10px]',
  };

  return (
    <span
      className={`inline-flex items-center font-medium border select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...rest}
    >
      <span className="shrink-0">{icon ?? defaultIcons[variant]}</span>
      <span>{children}</span>
    </span>
  );
};
