import React from 'react';

export interface SliderProps {
  value: number; // 0 to 1
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  leftLabel?: React.ReactNode;
  rightLabel?: React.ReactNode;
  'aria-label'?: string;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min = 0,
  max = 1,
  step = 0.01,
  onChange,
  leftLabel,
  rightLabel,
  'aria-label': ariaLabel = 'Slider',
  className = '',
}) => {
  const percentage = Math.round(((value - min) / (max - min)) * 100);

  return (
    <div
      className={`inline-flex items-center gap-3 px-3 py-2 bg-paper-2 border border-line rounded-full shadow-paper ${className}`}
    >
      {leftLabel && (
        <span className="text-xs font-medium text-ink-2 select-none shrink-0">{leftLabel}</span>
      )}
      <div className="relative flex items-center w-32 sm:w-40 h-6">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={ariaLabel}
          aria-valuenow={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-paper-3 rounded-full appearance-none cursor-pointer accent-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          style={{
            background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${percentage}%, var(--paper-3) ${percentage}%, var(--paper-3) 100%)`,
          }}
        />
      </div>
      {rightLabel && (
        <span className="text-xs font-medium text-ink-2 select-none shrink-0">{rightLabel}</span>
      )}
    </div>
  );
};
