import React from 'react';
import { useT } from '@/i18n/useT';
import { useAppStore } from '@/state/useAppStore';

export interface SheetOpacitySliderProps {
  value?: number;
  onChange?: (val: number) => void;
  className?: string;
}

export const SheetOpacitySlider: React.FC<SheetOpacitySliderProps> = ({
  value: propValue,
  onChange: propOnChange,
  className = '',
}) => {
  const { t } = useT();
  const storeOpacity = useAppStore((s) => s.sheetOpacity);
  const setStoreOpacity = useAppStore((s) => s.setSheetOpacity);

  const value = propValue !== undefined ? propValue : storeOpacity;
  const onChange = propOnChange !== undefined ? propOnChange : setStoreOpacity;

  // Left = 1.0 (Old sheet / পুরনো নকশা), Right = 0.0 (Modern map / মানচিত্র)
  // Input position: 0 is on the left, 1 is on the right
  const inputPos = Math.max(0, Math.min(1, 1 - value));
  const percentage = Math.round(inputPos * 100);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPos = parseFloat(e.target.value);
    const newOpacity = Math.round((1 - newPos) * 100) / 100;
    onChange(Math.max(0, Math.min(1, newOpacity)));
  };

  return (
    <div
      className={`inline-flex items-center gap-3 px-3.5 py-2 bg-paper-2/95 backdrop-blur-xs border border-line rounded-full shadow-paper select-none ${className}`}
      role="group"
      aria-label="Mouza sheet opacity control"
    >
      {/* Left label: Old map (Clicking snaps to 100% old map) */}
      <button
        type="button"
        onClick={() => onChange(1)}
        className={`text-xs font-serif font-semibold transition-colors cursor-pointer ${
          value >= 0.6 ? 'text-sepia' : 'text-ink-2 hover:text-ink'
        }`}
        title={`${t('oldMap')} (১০০%)`}
      >
        {t('oldMap')}
      </button>

      {/* Slider Track with Paper Square Thumb */}
      <div className="relative flex items-center w-32 sm:w-40 h-6">
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={inputPos}
          onChange={handleInputChange}
          aria-label={`${t('oldMap')} ↔ ${t('digitalMap')}`}
          aria-valuenow={Math.round(value * 100)}
          aria-valuetext={`${Math.round(value * 100)}% ${t('oldMap')}`}
          className="w-full h-1.5 bg-paper-3 rounded-full appearance-none cursor-pointer focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-3.5
            [&::-webkit-slider-thumb]:h-3.5
            [&::-webkit-slider-thumb]:rounded-xs
            [&::-webkit-slider-thumb]:bg-paper
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-sepia
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-3.5
            [&::-moz-range-thumb]:h-3.5
            [&::-moz-range-thumb]:rounded-xs
            [&::-moz-range-thumb]:bg-paper
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-sepia
            [&::-moz-range-thumb]:shadow-md
            [&::-moz-range-thumb]:transition-transform
            [&::-moz-range-thumb]:hover:scale-110"
          style={{
            background: `linear-gradient(to right, var(--sepia) 0%, var(--sepia) ${100 - percentage}%, var(--paper-3) ${100 - percentage}%, var(--paper-3) 100%)`,
          }}
        />
      </div>

      {/* Right label: Digital map (Clicking snaps to 0% old map) */}
      <button
        type="button"
        onClick={() => onChange(0)}
        className={`text-xs font-sans font-medium transition-colors cursor-pointer ${
          value < 0.3 ? 'text-accent font-semibold' : 'text-ink-2 hover:text-ink'
        }`}
        title={`${t('digitalMap')} (১০০%)`}
      >
        {t('digitalMap')}
      </button>
    </div>
  );
};
