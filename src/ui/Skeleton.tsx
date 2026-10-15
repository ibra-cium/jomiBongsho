import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  rounded = 'md',
  className = '',
  style,
  ...rest
}) => {
  const roundedStyles = {
    sm: 'rounded-[8px]',
    md: 'rounded-[12px]',
    lg: 'rounded-2xl',
    full: 'rounded-full',
  };

  return (
    <div
      aria-hidden="true"
      className={`bg-paper-3/70 animate-pulse ${roundedStyles[rounded]} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
      {...rest}
    />
  );
};
