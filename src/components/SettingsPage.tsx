import { useState } from 'react';
import { Check, KeyRound, DollarSign, Monitor, Sun, Moon } from 'lucide-react';
import { useSettingsContext } from '../context/SettingsContext';
import { ThemeMode } from '../hooks/useSettings';

function SaveButton({ saved }: { saved: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
        saved
          ? 'bg-slate-100 text-slate-900 dark:bg-neutral-900 dark:text-neutral-100'
          : 'text-slate-400 dark:text-neutral-500'
      }`}
    >
      <Check className="w-3 h-3" /> {saved ? 'Saved' : '—'}
    </span>
  );
}

export default function SettingsPage() {
  const { settings, setApiKey, setTotalWithdrawals, setThemeMode } = useSettingsContext();

  const [apiKey, setApiKeyInput] = useState(settings.apiKey);
  const [withdrawals, setWithdrawalsInput] = useState(
    settings.totalWithdrawals > 0 ? String(settings.totalWithdrawals) : ''
  );
  const [apiSaved, setApiSaved] = useState(false);
  const [withdrawalSaved, setWithdrawalSaved] = useState(false);

  const handleSaveApiKey = () => {
    setApiKey(apiKey);
    setApiSaved(true);
    setTimeout(() => setApiSaved(false), 1600);
  };

  const handleSaveWithdrawals = () => {
    const v = parseFloat(withdrawals);
    setTotalWithdrawals(Number.isFinite(v) && v >= 0 ? v : 0);
    setWithdrawalSaved(true);
    setTimeout(() => setWithdrawalSaved(false), 1600);
  };

  const themes: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
    { id: 'system', label: 'System', icon: Monitor },
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
  ];

  return (
    <div id="settings-page" className="space-y-4">
      {/* Section: Monetag API key */}
      <section className="bg-white dark:bg-black rounded-2xl transition-colors">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-neutral-900">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-neutral-100">
            <KeyRound className="w-4 h-4" />
            Monetag API key
          </div>
        </div>
        <div className="px-4 py-3 space-y-2.5">
          <input
            id="settings-api-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="Paste your Monetag API key"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded px-3 py-2 font-mono text-xs text-slate-900 dark:text-neutral-100 placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none focus:border-slate-400 dark:focus:border-neutral-500"
          />
          <p className="text-[11px] text-slate-400 dark:text-neutral-500 leading-snug">
            Fetched statistics use this key. It is read-only and stored only on this device.
          </p>
          <div className="flex items-center justify-between gap-2">
            <SaveButton saved={apiSaved} />
            <button
              id="settings-save-api"
              onClick={handleSaveApiKey}
              className="px-3 py-1.5 rounded bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-medium cursor-pointer transition-colors hover:opacity-90"
            >
              Save
            </button>
          </div>
        </div>
      </section>

      {/* Section: Total withdrawals */}
      <section className="bg-white dark:bg-black rounded-2xl transition-colors">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-neutral-900">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-neutral-100">
            <DollarSign className="w-4 h-4" />
            Total withdrawals (USD)
          </div>
        </div>
        <div className="px-4 py-3 space-y-2.5">
          <input
            id="settings-withdrawals"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={withdrawals}
            onChange={(e) => setWithdrawalsInput(e.target.value)}
            placeholder="0.00"
            className="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded px-3 py-2 font-mono text-xs text-slate-900 dark:text-neutral-100 placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none focus:border-slate-400 dark:focus:border-neutral-500"
          />
          <p className="text-[11px] text-slate-400 dark:text-neutral-500">
            Current Balance = Lifetime earnings − total withdrawals.
          </p>
          <div className="flex items-center justify-between gap-2">
            <SaveButton saved={withdrawalSaved} />
            <button
              id="settings-save-withdrawals"
              onClick={handleSaveWithdrawals}
              className="px-3 py-1.5 rounded bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-medium cursor-pointer transition-colors hover:opacity-90"
            >
              Save
            </button>
          </div>
        </div>
      </section>

      {/* Section: Theme */}
      <section className="bg-white dark:bg-black rounded-2xl transition-colors">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-neutral-900">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-neutral-100">
            <span className="flex w-4 h-4 items-center justify-center">
              <Sun className="w-4 h-4" />
            </span>
            Theme
          </div>
        </div>
        <div className="px-4 py-3">
          <div id="theme-switcher" className="h-10 flex items-center bg-slate-100 dark:bg-neutral-900 p-0.5 rounded-md text-xs">
            {themes.map((t) => {
              const Icon = t.icon;
              const active = settings.themeMode === t.id;
              return (
                <button
                  key={t.id}
                  id={`theme-opt-${t.id}`}
                  type="button"
                  onClick={() => setThemeMode(t.id)}
                  className={`flex-1 h-full px-2 rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none leading-none ${
                    active
                      ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white font-medium'
                      : 'text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* App info */}
      <p className="text-[11px] text-slate-400 dark:text-neutral-600 text-center pt-1">
        Moneboard · unofficial read-only dashboard · settings are stored on this device
      </p>
    </div>
  );
}