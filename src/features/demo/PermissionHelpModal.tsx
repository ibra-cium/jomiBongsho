import React from 'react';
import { ShieldAlert, X, Compass, RefreshCw } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { Button } from '@/ui/Button';

interface PermissionHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDemo: () => void;
}

export const PermissionHelpModal: React.FC<PermissionHelpModalProps> = ({
  isOpen,
  onClose,
  onOpenDemo,
}) => {
  const { t, lang } = useT();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs transition-opacity"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={lang === 'bn' ? 'অবস্থান অনুমতি সহায়তা' : 'Location Permission Help'}
    >
      <div
        className="relative w-full max-w-md bg-paper border border-line rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warn-wash border border-warn/30 flex items-center justify-center text-warn">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-ink">
                {lang === 'bn' ? 'অবস্থান (GPS) অনুমতি দিন' : 'Allow Location (GPS)'}
              </h3>
              <p className="text-xs text-ink-2">
                {lang === 'bn'
                  ? 'জমির দাগ শনাক্ত করার জন্য জিপিএস প্রয়োজন'
                  : 'GPS is needed to detect which plot you are on'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-ink-3 hover:text-ink rounded-lg"
            aria-label={t('close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 bg-paper-2 p-4 rounded-xl border border-line text-xs text-ink-2">
          <div className="font-semibold text-ink">
            {lang === 'bn' ? 'কীভাবে চালু করবেন:' : 'How to enable:'}
          </div>
          <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
            <li>
              {lang === 'bn'
                ? 'ব্রাউজারের অ্যাড্রেস বারের বামে লক (বা টিউন) আইকন চাপুন।'
                : 'Tap the lock or site settings icon in the address bar.'}
            </li>
            <li>
              {lang === 'bn'
                ? '"Location" বা "অবস্থান" অনুমতি "Allow" বা "অনুমতি দিন" নির্বাচন করুন।'
                : 'Set "Location" permission to "Allow".'}
            </li>
            <li>
              {lang === 'bn'
                ? 'পৃষ্ঠাটি রিফ্রেশ করুন এবং পুনরায় জিপিএস চাপুন।'
                : 'Refresh the page and tap the GPS button again.'}
            </li>
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            size="sm"
            variant="secondary"
            fullWidth
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={() => window.location.reload()}
          >
            {lang === 'bn' ? 'পৃষ্ঠা রিফ্রেশ' : 'Refresh Page'}
          </Button>

          <Button
            size="sm"
            variant="primary"
            fullWidth
            leftIcon={<Compass className="w-3.5 h-3.5" />}
            onClick={() => {
              onClose();
              onOpenDemo();
            }}
          >
            {lang === 'bn' ? 'অনুকরণ প্যানেল' : 'Simulation Panel'}
          </Button>
        </div>
      </div>
    </div>
  );
};
