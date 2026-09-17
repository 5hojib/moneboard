import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running inside standalone PWA mode, suppress install button
  if (isInstalled) {
    return null;
  }

  // Desktop Chrome, Edge, Android Chrome flow
  if (isInstallable) {
    return (
      <button
        id="pwa-install-btn"
        onClick={install}
        title="Install app to your home screen or desktop"
        className="h-7 px-2.5 inline-flex items-center gap-1.5 justify-center text-xs leading-none text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/80 rounded border border-sky-200 dark:border-sky-800 transition-colors cursor-pointer font-medium select-none"
      >
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          id="pwa-install-ios-btn"
          onClick={() => setShowIOSGuide(true)}
          title="Install on iPhone or iPad"
          className="h-7 px-2.5 inline-flex items-center gap-1.5 justify-center text-xs leading-none text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/80 rounded border border-sky-200 dark:border-sky-800 transition-colors cursor-pointer font-medium select-none"
        >
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-xl bg-white dark:bg-neutral-900 p-6 shadow-2xl border border-slate-200 dark:border-neutral-800 text-slate-800 dark:text-neutral-100">
              <div className="flex items-center gap-3 mb-3">
                <img src="/pwa-192x192.png" alt="App Icon" className="w-10 h-10 rounded-lg shadow-sm" />
                <div>
                  <h3 className="text-sm font-semibold">Install Monetag Dashboard</h3>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">Add to iPhone / iPad Home Screen</p>
                </div>
              </div>
              <ol className="mt-3 space-y-2 text-xs text-slate-600 dark:text-neutral-300 leading-relaxed list-decimal list-inside bg-slate-50 dark:bg-neutral-800/60 p-3 rounded-lg border border-slate-100 dark:border-neutral-800">
                <li>Tap the <strong>Share</strong> button (box with upward arrow) in Safari.</li>
                <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
                <li>Tap <strong>Add</strong> in the top-right corner.</li>
              </ol>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-lg bg-slate-900 text-white dark:bg-neutral-800 dark:hover:bg-neutral-700 py-2 text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
