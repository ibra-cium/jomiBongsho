import React, { useState } from 'react';
import { Segmented } from '@/ui/Segmented';
import { useT } from '@/i18n/useT';
import { useDataStore } from '@/data/useDataStore';
import { CostTab } from '@/features/cost';
import { SummaryTab } from './SummaryTab';
import { Timeline } from './Timeline';
import { PriceCard } from './PriceCard';
import { CostTabSkeleton } from './CostTabSkeleton';
import type { DagAnalysis } from '@/engine';
import type { LandEvent, Person, FeeRules, Mouza } from '@/engine/types';

export interface PlotCardProps {
  analysis: DagAnalysis;
  events: LandEvent[];
  people: Person[];
  feeRules?: FeeRules;
  mouza?: Mouza;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  className?: string;
}

export const PlotCard: React.FC<PlotCardProps> = ({
  analysis,
  events,
  people,
  feeRules: propFeeRules,
  mouza: propMouza,
  activeTab: controlledTab,
  onTabChange,
  className = '',
}) => {
  const { t } = useT();
  const storeData = useDataStore((state) => state.data);
  const feeRules = propFeeRules ?? storeData?.feeRules;
  const mouza = propMouza ?? storeData?.mouza;

  const [internalTab, setInternalTab] = useState('summary');
  const [targetTimelineEventId, setTargetTimelineEventId] = useState<string | undefined>();

  const currentTab = controlledTab ?? internalTab;
  const setTab = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalTab(tab);
    }
  };

  const tabs = [
    { value: 'summary', label: t('tabSummary') },
    { value: 'history', label: t('tabHistory') },
    { value: 'price', label: t('tabPrice') },
    { value: 'cost', label: t('tabCost') },
  ];

  const handleNavigateToTimeline = (eventId?: string) => {
    setTargetTimelineEventId(eventId);
    setTab('history');

    // Scroll to event if in document
    if (eventId) {
      setTimeout(() => {
        const el = document.getElementById(`timeline-event-${eventId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Sticky Segmented Tab Controls */}
      <div className="sticky top-0 z-10 bg-paper-2/95 backdrop-blur-xs py-1">
        <Segmented options={tabs} value={currentTab} onChange={setTab} className="w-full" />
      </div>

      {/* Tab Panels */}
      <div className="pt-1">
        {currentTab === 'summary' && (
          <SummaryTab
            analysis={analysis}
            events={events}
            people={people}
            feeRules={feeRules}
            mouza={mouza}
            onNavigateToTimeline={handleNavigateToTimeline}
            onNavigateToTab={setTab}
          />
        )}

        {currentTab === 'history' && (
          <Timeline
            timeline={analysis.timeline}
            people={people}
            recordedAreaDecimal={analysis.dag.recordedAreaDecimal}
            highlightEventId={targetTimelineEventId}
          />
        )}

        {currentTab === 'price' && (
          <PriceCard estimate={analysis.priceEstimate} dag={analysis.dag} />
        )}

        {currentTab === 'cost' &&
          (feeRules && mouza ? (
            <CostTab
              dag={analysis.dag}
              priceEstimate={analysis.priceEstimate}
              feeRules={feeRules}
              mouza={mouza}
              events={events}
            />
          ) : (
            <CostTabSkeleton />
          ))}
      </div>
    </div>
  );
};
