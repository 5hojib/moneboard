import { useState } from 'react';
import { KeyRound, DollarSign, ShieldCheck } from 'lucide-react';
import { useSettingsContext } from '../context/SettingsContext';

export default function OnboardingScreen() {
  const { setApiKey, setTotalWithdrawals } = useSettingsContext();
  const [apiKey, setApiKeyInput] = useState('');
  const [withdrawals, setWithdrawalsInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const key = apiKey.trim();
    if (!key) {
      setError('Enter your Monetag API key to continue.');
      return;
    }
    const w = parseFloat(withdrawals);
    setApiKey(key);
    setTotalWithdrawals(Number.isFinite(w) && w >= 0 ? w : 0);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-800 dark:text-neutral-100 flex flex-col items-center justify-center px-6 py-10 transition-colors">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">Moneboard</h1>
          <p className="mt-2 text-xs text-slate-400 dark:text-neutral-500">
            Your Monetag earnings, at a glance.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-black rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-neutral-100">
            <KeyRound className="w-4 h-4" />
            Monetag API key
          </div>
          <input
            id="onboarding-api-key"
            type="password"
            value={apiKey}
            onChange={(e) => { setApiKeyInput(e.target.value); setError(null); }}
            placeholder="Paste your Monetag API key"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2.5 font-mono text-xs text-slate-900 dark:text-neutral-100 placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none focus:border-slate-400 dark:focus:border-neutral-500"
          />

          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-neutral-100">
            <DollarSign className="w-4 h-4" />
            Total withdrawals (USD)
          </div>
          <input
            id="onboarding-withdrawals"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={withdrawals}
            onChange={(e) => setWithdrawalsInput(e.target.value)}
            placeholder="0.00"
            className="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-2.5 font-mono text-xs text-slate-900 dark:text-neutral-100 placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none focus:border-slate-400 dark:focus:border-neutral-500"
          />

          {error && (
            <p className="text-[11px] text-red-500 dark:text-red-400 leading-snug">{error}</p>
          )}

          <button
            id="onboarding-continue"
            onClick={handleSubmit}
            className="w-full rounded-lg bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-medium py-2.5 cursor-pointer transition-colors hover:opacity-90"
          >
            Continue
          </button>
        </div>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-neutral-500 text-center">
          <ShieldCheck className="w-3.5 h-3.5" />
          Your key is read-only and stored only on this device.
        </p>
      </div>
    </div>
  );
}