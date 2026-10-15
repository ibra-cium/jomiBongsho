import React from 'react';

export type IconButtonVariant = 'primary' | 'secondary' | 'ghost';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string; // Mandatory for accessibility
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  icon: React.ReactNode;
}

export const IconButton: React.FC<IconButtonProps> = ({
  'aria-label': ariaLabel,
  variant = 'secondary',
  size = 'md',
  icon,
  className = '',
  disabled,
  ...rest
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center transition-all select-none cursor-pointer focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95';

  const sizeStyles: Record<IconButtonSize, string> = {
    sm: 'w-9 h-9 p-1.5 rounded-[10px]',
    md: 'w-11 h-11 p-2.5 rounded-[10px]',
    lg: 'w-14 h-14 p-3.5 rounded-full',
  };

  const variantStyles: Record<IconButtonVariant, string> = {
    primary: 'bg-accent text-accent-ink hover:opacity-95 shadow-sm active:opacity-90',
    secondary:
      'bg-paper-2 text-ink border border-line hover:bg-paper-3 active:bg-paper-3 shadow-paper',
    ghost: 'bg-transparent text-ink hover:bg-paper-2 active:bg-paper-3',
  };

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...rest}
    >
      <span className="flex items-center justify-center">{icon}</span>
    </button>
  );
};
