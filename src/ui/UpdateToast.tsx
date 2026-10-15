import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, CheckCircle2 } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { Button } from '@/ui/Button';

export const UpdateToast: React.FC = () => {
  const { t } = useT();

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, r) {
      if (r) {
        // Periodic check for SW update every hour
        setInterval(
          () => {
            r.update().catch(() => {});
          },
          60 * 60 * 1000,
        );
      }
    },
    onRegisterError(error) {
      console.error('Service worker registration failed:', error);
    },
  });

  const handleRefresh = () => {
    updateServiceWorker(true);
  };

  const handleCloseOffline = () => {
    setOfflineReady(false);
  };

  const handleDismissRefresh = () => {
    setNeedRefresh(false);
  };

  if (!needRefresh && !offlineReady) {
    return null;
  }

  return (
    <aside
      role="alert"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 max-w-sm p-4 bg-paper-2 border border-line rounded-2xl shadow-paper flex items-center justify-between gap-3 text-ink"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {needRefresh ? (
          <>
            <RefreshCw className="w-5 h-5 text-accent shrink-0" />
            <div className="text-xs font-medium leading-snug truncate">{t('updateReady')}</div>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5 text-ok shrink-0" />
            <div className="text-xs font-medium leading-snug truncate">{t('offlineReady')}</div>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {needRefresh ? (
          <>
            <Button size="sm" variant="ghost" onClick={handleDismissRefresh}>
              {t('cancel')}
            </Button>
            <Button size="sm" variant="primary" onClick={handleRefresh}>
              {t('updateAction')}
            </Button>
          </>
        ) : (
          <Button size="sm" variant="ghost" onClick={handleCloseOffline}>
            {t('close')}
          </Button>
        )}
      </div>
    </aside>
  );
};
