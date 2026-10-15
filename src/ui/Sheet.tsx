import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, type PanInfo } from 'motion/react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { SheetSnap } from '@/state/useAppStore';

export interface SheetProps {
  snap: SheetSnap;
  onSnapChange: (snap: SheetSnap) => void;
  peekContent?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Sheet: React.FC<SheetProps> = ({
  snap,
  onSnapChange,
  peekContent,
  children,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Desktop view: Left side panel (420px full-height)
  if (isDesktop) {
    return (
      <aside
        aria-label="Plot details"
        className={`w-[420px] h-full flex flex-col bg-paper-2 border-r border-line shadow-none overflow-hidden shrink-0 z-20 ${className}`}
      >
        {peekContent && (
          <div className="p-4 border-b border-line bg-paper-2/90 shrink-0">{peekContent}</div>
        )}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">{children}</div>
      </aside>
    );
  }

  // Mobile view: snap heights
  const snapHeights: Record<SheetSnap, string> = {
    peek: '112px',
    half: '55vh',
    full: '92vh',
  };

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    const dragDistance = offset.y;
    const dragSpeed = velocity.y;

    if (dragDistance < -60 || dragSpeed < -300) {
      // Dragged upwards
      if (snap === 'peek') onSnapChange('half');
      else if (snap === 'half') onSnapChange('full');
    } else if (dragDistance > 60 || dragSpeed > 300) {
      // Dragged downwards
      if (snap === 'full') onSnapChange('half');
      else if (snap === 'half') onSnapChange('peek');
    }
  };

  const toggleSnap = () => {
    if (snap === 'peek') onSnapChange('half');
    else if (snap === 'half') onSnapChange('full');
    else onSnapChange('half');
  };

  return (
    <motion.section
      ref={sheetRef}
      role="region"
      aria-label="Plot details sheet"
      animate={{ height: snapHeights[snap] }}
      transition={
        shouldReduceMotion ? { duration: 0.12 } : { type: 'spring', stiffness: 420, damping: 40 }
      }
      className={`fixed bottom-0 left-0 right-0 bg-paper-2 border-t border-line rounded-t-[24px] shadow-paper z-30 flex flex-col overflow-hidden will-change-[height] ${className}`}
    >
      {/* Drag handle header */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className="w-full flex flex-col items-center justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing touch-none select-none bg-paper-2 shrink-0"
      >
        <div className="w-12 h-1.5 bg-line rounded-full" aria-hidden="true" />
        <button
          type="button"
          aria-label={snap === 'full' ? 'Collapse sheet' : 'Expand sheet'}
          onClick={toggleSnap}
          className="p-1 text-ink-3 hover:text-ink transition-colors cursor-pointer"
        >
          {snap === 'full' ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </button>
      </motion.div>

      {/* Peek content (always visible in peek/half/full) */}
      {peekContent && (
        <div className="px-4 pb-2 shrink-0 select-none cursor-pointer" onClick={toggleSnap}>
          {peekContent}
        </div>
      )}

      {/* Expanded content (visible in half and full) */}
      <div
        className={`flex-1 overflow-y-auto px-4 pb-6 space-y-4 ${
          snap === 'peek' ? 'opacity-0 pointer-events-none' : 'opacity-100'
        } transition-opacity duration-150`}
      >
        {children}
      </div>
    </motion.section>
  );
};
