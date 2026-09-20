import { createContext, useContext, ReactNode } from 'react';
import { useSettings, Settings, ThemeMode } from '../hooks/useSettings';

interface SettingsContextType {
  settings: Settings;
  setApiKey: (apiKey: string) => void;
  setTotalWithdrawals: (totalWithdrawals: number) => void;
  setThemeMode: (themeMode: ThemeMode) => void;
  setFullHistoryLoaded: (fullHistoryLoaded: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { settings, setApiKey, setTotalWithdrawals, setThemeMode, setFullHistoryLoaded } = useSettings();

  return (
    <SettingsContext.Provider value={{ settings, setApiKey, setTotalWithdrawals, setThemeMode, setFullHistoryLoaded }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
}