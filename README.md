# Moneboard

An **unofficial, read-only earnings dashboard** for [Monetag](https://www.monetag.com/) publishers. Built with AI.

Moneboard lets you keep an eye on your Monetag publisher statistics on the go. Your API key is only ever used to **read your own stats** — nothing is sent anywhere except to Monetag's public API.

> ⚠️ **Unofficial.** Moneboard is not affiliated with, endorsed by, or sponsored by Monetag. It simply talks to Monetag's public API with your own API key.

## Features

- **Home** — current balance with odometer animation, the **Hold / Approved** split (Monetag holds the last 4 days of earnings), lifetime earnings & withdrawals, plus a Today vs. Yesterday typographic hero.
- **Graph** — interactive trend charts for Revenue, CPM, Impressions and Clicks over 7 days, 30 days, all time, or a custom date range.
- **Daily** — full daily breakdown table of your stats.
- **Settings** — paste your Monetag API key (stored on-device, not bundled), configure withdrawals, and switch light/dark theme.
- **Onboarding** — on first open the app asks for your Monetag API key and total withdrawals before showing the dashboard. No bundled API key.
- **Swipe to navigate** — swipe left/right to move between Home → Daily → Graph → Settings.
- **Pull to refresh** — the dashboard refreshes on any data page and shows a "refreshing" chip.
- **Minimal black & white UI** — no accent colors, no shadows, no gradients.
- **Offline cache** — last fetched data is cached locally so the dashboard still loads without a connection.

## Supported target

Moneboard ships as a **native Android app** (APK):

| Target | Stack |
|---|---|
| **Android (APK)** | Capacitor shell around a Vite + React 19 + Tailwind CSS v4 bundle; API calls go directly to `https://api.monetag.com/v5` with your key |

Look on the **GitHub Releases** page for the latest Android APK to sideload (Moneboard is not on the Play Store).

## Why is this a read-only app?

The Monetag API key only grants access to the publisher's own statistics endpoints — it cannot spend, withdraw, or alter anything. Moneboard deliberately exposes no write actions. If you're concerned about your API key, generate a fresh one in the Monetag dashboard and paste it in Settings; it never leaves your device except to authenticate the read-only API calls.

## Development

```bash
npm install        # install dependencies
npm run lint       # TypeScript typecheck (run after changes)
npm run build:android   # build web assets into dist/www (Capacitor bundle)
npm run android:apk     # build a local release APK
```

## How it's built

This project was **built with AI** (LLM-assisted development) to get a minimal, mobile-first Android earnings dashboard shipped quickly.

See `AGENTS.md` for repository conventions and the versioning/release workflow.