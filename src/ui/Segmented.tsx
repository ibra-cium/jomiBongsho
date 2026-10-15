import React from 'react';
import { motion } from 'motion/react';

export interface SegmentedOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
}

export interface SegmentedProps<T extends string = string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function Segmented<T extends string = string>({
  options,
  value,
  onChange,
  className = '',
}: SegmentedProps<T>): React.ReactElement {
  return (
    <div
      role="tablist"
      className={`inline-flex p-1 bg-paper-3 rounded-xl border border-line select-none relative ${className}`}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            type="button"
            aria-selected={isSelected}
            onClick={() => onChange(opt.value)}
            className={`relative px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors z-10 flex-1 text-center cursor-pointer focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-1 ${
              isSelected ? 'text-ink font-semibold' : 'text-ink-2 hover:text-ink'
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId="segmented-pill"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className="absolute inset-0 bg-paper-2 rounded-lg shadow-sm border border-line -z-10"
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
