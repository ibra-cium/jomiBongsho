import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, ArrowRight } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { toBanglaDigits, formatDecimal } from '@/lib/format';
import { searchDags, type SearchResult } from './search';
import type { DagFeature } from '@/lib/geo';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  features: DagFeature[];
  onSelectDag: (dagId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  features,
  onSelectDag,
}) => {
  const { t, lang } = useT();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const results: SearchResult[] = searchDags(query, features);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results.length]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        results.length > 0 ? (prev - 1 + results.length) % results.length : 0,
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex].dagId);
      }
    }
  };

  const handleSelect = (dagId: string) => {
    onSelectDag(dagId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-ink/40 backdrop-blur-xs transition-opacity"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('search')}
    >
      <div
        className="relative w-full max-w-lg bg-paper border border-line rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line bg-paper-2">
          <Search className="w-5 h-5 text-accent shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              lang === 'bn'
                ? 'দাগ নম্বর লিখুন (উদা: ১০৩, 103, CS 12)...'
                : 'Enter dag number (e.g. 103, CS 12)...'
            }
            className="flex-1 bg-transparent border-none outline-hidden text-ink font-sans text-base placeholder:text-ink-3"
            aria-label={t('searchPlaceholder')}
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 text-ink-3 hover:text-ink rounded-lg cursor-pointer"
              aria-label={t('cancel')}
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-ink-3 bg-paper-3 border border-line rounded">
              ESC
            </kbd>
          )}
        </div>

        {/* Suggestion list or Empty states */}
        <div className="flex-1 overflow-y-auto p-2">
          {query.trim() === '' ? (
            <div className="p-6 text-center text-ink-2 text-sm space-y-2">
              <div className="w-10 h-10 rounded-full bg-paper-2 border border-line flex items-center justify-center mx-auto text-ink-3">
                <Search className="w-5 h-5" />
              </div>
              <p className="font-medium text-ink">
                {lang === 'bn'
                  ? 'বর্তমান বা পুরনো খতিয়ানের দাগ নম্বর দিয়ে খুঁজুন'
                  : 'Search by modern BS or historical survey dag numbers'}
              </p>
              <p className="text-xs text-ink-3">
                {lang === 'bn'
                  ? 'উদা: ১০১, 103, CS 1, SA 12, RS 201'
                  : 'E.g.: 101, 103, CS 1, SA 12, RS 201'}
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-warn-wash border border-warn/30 flex items-center justify-center mx-auto text-warn">
                <MapPin className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-ink">{t('searchNotFound')}</p>
            </div>
          ) : (
            <ul ref={listRef} className="space-y-1" role="listbox">
              {results.map((res, index) => {
                const isSelected = index === selectedIndex;
                const prop = res.feature.properties;
                const displayId = lang === 'bn' ? toBanglaDigits(res.dagId) : res.dagId;
                const areaStr = `${formatDecimal(prop.recordedAreaDecimal, lang)} ${t('decimalUnit')}`;
                const landClassKey = `landClass_${prop.landClass}` as Parameters<typeof t>[0];
                const landClassLabel = t(landClassKey) || prop.landClass;

                return (
                  <li
                    key={res.dagId}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(res.dagId)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-accent/10 border border-accent/30'
                        : 'hover:bg-paper-2 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-serif font-bold text-sm border ${
                          isSelected
                            ? 'bg-accent text-accent-ink border-accent'
                            : 'bg-paper-2 text-ink border-line'
                        }`}
                      >
                        {displayId}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-semibold text-ink text-sm">
                            {t('dag')} {displayId}
                          </span>
                          {res.matchedSurvey !== 'BS' && (
                            <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-warn-wash text-warn border border-warn/30">
                              {res.matchedSurvey}{' '}
                              {lang === 'bn'
                                ? toBanglaDigits(res.matchedNumber)
                                : res.matchedNumber}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-ink-3">
                          {areaStr} · {landClassLabel}
                          {prop.dagNo && (prop.dagNo.RS || prop.dagNo.CS) && (
                            <span className="ml-1 opacity-75">
                              (
                              {prop.dagNo.RS &&
                                `RS ${lang === 'bn' ? toBanglaDigits(prop.dagNo.RS) : prop.dagNo.RS}`}
                              {prop.dagNo.RS && prop.dagNo.CS && ' · '}
                              {prop.dagNo.CS &&
                                `CS ${lang === 'bn' ? toBanglaDigits(prop.dagNo.CS) : prop.dagNo.CS}`}
                              )
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-accent font-medium">
                      <span className="hidden sm:inline">{t('details')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
