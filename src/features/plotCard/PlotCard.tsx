import React, { useState } from 'react';
import { Segmented } from '@/ui/Segmented';
import { useT } from '@/i18n/useT';
import { SummaryTab } from './SummaryTab';
import { Timeline } from './Timeline';
import { PriceTabSkeleton } from './PriceTabSkeleton';
import { CostTabSkeleton } from './CostTabSkeleton';
import type { DagAnalysis } from '@/engine';
import type { LandEvent, Person } from '@/engine/types';

export interface PlotCardProps {
  analysis: DagAnalysis;
  events: LandEvent[];
  people: Person[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  className?: string;
}

export const PlotCard: React.FC<PlotCardProps> = ({
  analysis,
  events,
  people,
  activeTab: controlledTab,
  onTabChange,
  className = '',
}) => {
  const { t } = useT();
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
      <div className="sticky top-0 z-10 bg-paper/95 backdrop-blur-xs py-1">
        <Segmented options={tabs} value={currentTab} onChange={setTab} className="w-full" />
      </div>

      {/* Tab Panels */}
      <div className="pt-1">
        {currentTab === 'summary' && (
          <SummaryTab
            analysis={analysis}
            events={events}
            people={people}
            onNavigateToTimeline={handleNavigateToTimeline}
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

        {currentTab === 'price' && <PriceTabSkeleton />}

        {currentTab === 'cost' && <CostTabSkeleton />}
      </div>
    </div>
  );
};
