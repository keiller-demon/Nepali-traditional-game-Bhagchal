import React, { useState } from 'react';
import { Download, WifiOff, X } from 'lucide-react';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall';
import type { TranslationBundle } from '../i18n/translations';

interface PWAInstallButtonProps {
  labels: TranslationBundle['offline'];
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ labels }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex items-center gap-2 rounded-md border border-[#9A3412]/30 bg-[#9A3412]/10 px-3 py-1.5 text-xs font-semibold text-[#7C2D12] hover:bg-[#9A3412]/15 transition-colors whitespace-nowrap shrink-0"
      >
        <Download className="h-3.5 w-3.5" />
        {labels.installApp}
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors whitespace-nowrap shrink-0"
        >
          <Download className="h-3.5 w-3.5" />
          {labels.installIOS}
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-lg border border-stone-200 bg-[#FBF9F5] p-6 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-display text-lg font-semibold text-stone-900">{labels.iosTitle}</h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="rounded p-1 text-stone-500 hover:bg-stone-200/60"
                  aria-label={labels.close}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-stone-700">{labels.iosSteps}</p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-md bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800"
              >
                {labels.close}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export const OfflineIndicator: React.FC<{ label: string }> = ({ label }) => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-md border border-amber-700/30 bg-[#FFFBEB] px-3.5 py-2 text-xs font-medium text-amber-950 shadow-md"
    >
      <WifiOff className="h-3.5 w-3.5 text-amber-800 shrink-0" />
      <span>{label}</span>
    </div>
  );
};
