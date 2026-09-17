import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';
import { Capacitor } from '@capacitor/core';

// Register service worker with auto-update (skipped inside the native
// Capacitor shell where assets ship inside the APK and the WebView origin
// has limited SW support).
if (!Capacitor.isNativePlatform()) {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      console.log('New content available, reload to update.');
    },
    onOfflineReady() {
      console.log('App ready to work offline.');
    },
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
