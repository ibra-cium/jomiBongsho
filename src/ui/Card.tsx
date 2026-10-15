import React from 'react';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  padding = 'md',
  interactive = false,
  className = '',
  children,
  ...rest
}) => {
  const paddingStyles: Record<CardPadding, string> = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-6',
  };

  const interactiveStyles = interactive
    ? 'hover:border-ink/20 cursor-pointer active:scale-[0.99] transition-transform'
    : '';

  return (
    <div
      className={`bg-paper-2 border border-line rounded-2xl shadow-paper ${paddingStyles[padding]} ${interactiveStyles} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};
