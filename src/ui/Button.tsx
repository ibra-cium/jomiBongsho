import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  children,
  className = '',
  ...rest
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium whitespace-nowrap shrink-0 transition-all select-none cursor-pointer focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]';

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'text-sm px-3 py-1.5 min-h-[36px] rounded-[10px] gap-1.5',
    md: 'text-base px-4 py-2 min-h-[40px] rounded-[10px] gap-2',
    lg: 'text-lg px-6 py-2.5 min-h-[48px] rounded-[12px] gap-2.5',
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-accent text-accent-ink hover:opacity-95 shadow-sm active:opacity-90 border border-transparent',
    secondary:
      'bg-paper-2 text-ink border border-line hover:bg-paper-3 active:bg-paper-3 shadow-paper',
    ghost: 'bg-transparent text-ink hover:bg-paper-2 active:bg-paper-3 border border-transparent',
    danger:
      'bg-bad text-accent-ink hover:opacity-95 shadow-sm active:opacity-90 border border-transparent',
  };

  return (
    <button
      disabled={disabled || loading}
      aria-busy={loading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...rest}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" aria-hidden="true" />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span className="inline-flex items-center gap-1.5">{children}</span>
      {!loading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};
