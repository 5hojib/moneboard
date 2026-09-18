import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSettingsContext } from './SettingsContext';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  resolvedTheme: ResolvedTheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // App theme follows the setting chosen in the Settings page.
  // 'system' tracks the OS light/dark preference in real time.
  const { settings } = useSettingsContext();
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  const resolvedTheme: ResolvedTheme =
    settings.themeMode === 'system' ? systemTheme : settings.themeMode;

  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }

    // Keep the Android system status bar (icons/text) in sync with the theme:
    // white icons on dark, black icons on light.
    if (Capacitor.isNativePlatform()) {
      const isDark = resolvedTheme === 'dark';
      StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light }).catch(() => {});
      StatusBar.setBackgroundColor({ color: isDark ? '#000000' : '#ffffff' }).catch(() => {});
    }
  }, [resolvedTheme]);

  return (
    <ThemeContext.Provider value={{ resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}