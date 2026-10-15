import React from 'react';

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  clickable?: boolean;
}

export const Chip: React.FC<ChipProps> = ({
  selected = false,
  clickable = true,
  children,
  className = '',
  disabled,
  onClick,
  ...rest
}) => {
  const base =
    'inline-flex items-center justify-center text-sm font-medium px-3 py-1.5 rounded-[10px] border transition-colors select-none focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2';

  const stateStyles = selected
    ? 'bg-accent/10 text-accent border-accent font-semibold'
    : 'bg-paper-2 text-ink-2 border-line hover:text-ink hover:bg-paper-3';

  if (!clickable) {
    return (
      <span
        className={`inline-flex items-center justify-center text-sm font-medium px-3 py-1.5 rounded-[10px] border bg-paper-2 text-ink-2 border-line ${className}`}
      >
        {children}
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${stateStyles} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};
