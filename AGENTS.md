# AGENTS.md

Guidance for AI agents and contributors working in this repository.

## Project overview

**Moneboard** — an unofficial, read-only earnings dashboard for Monetag publishers (the API key is only used to read a publisher's own statistics). The app ships as a **native Android app** (Capacitor shell with React 19 + Vite + Tailwind v4 bundled), and API calls go directly to `https://api.monetag.com/v5` with the bundled API key.

The app is published as a **sideloadable Android APK** via GitHub Releases. Users install the APK manually; it is not on the Play Store.

## Commands

- `npm install` — install dependencies.
- `npm run lint` — TypeScript typecheck (`tsc --noEmit`). **Always run after changes.**
- `npm run build:android` — build web assets into `dist/www` (what Capacitor bundles).
- `npm run android:sync` — `build:android` + `cap sync android`.
- `npm run android:apk` — full local APK build (`assembleRelease`).

## Versioning & releases (IMPORTANT)

- **On every push to `main` or `apk`, bump the version.** The CI workflow auto-derives the version as `<major>.<minor>.<github.run_number>` (currently `1.1.<run_number>`); tag pushes (`v*`) use the tag name.
- **On every push the workflow creates a GitHub Release at the SAME version** (`v<version>`) and uploads the built APK to it. If the release already exists (a re-run), the APK asset is overwritten in place.
- Workflow file: `.github/workflows/android-build.yml`.
- The APK version name/code are injected into the Gradle build via `-PversionName`/`-PversionCode`; `android/app/build.gradle` reads these properties (with local fallbacks).
- Version bumps are computed from `github.run_number`, so no manual edit is required — just ensure a meaningful version is chosen when cutting a named tag.

## Android signing

- Release APK is signed with the committed release keystore at `android/keystore/release-keystore.p12` (credentials in `android/keystore/keystore.properties`). This is a dedicated release key so Play Protect does not treat the APK as debug-signed.
- If the keystore/properties are missing, the build falls back to the debug key (`signingConfigs.debug`) so local builds still work.

## Architecture notes

- `src/App.tsx` — tab routing (`home` | `daily` | `graph` | `settings`), data fetching with a localStorage cache fallback, Today/Yesterday computation, swipe-to-change-tab.
- `src/config.ts` — bundled API key/withdrawals, runtime getters.
- `src/api/client.ts` — Monetag API calls (direct from the native app).
- `src/components/` — UI: `Header`, `BottomNav`, `EarningsHighlight` (full-screen centered typographic balance hero), `ChartsSection`, `DailyStatsTable`, `FilterBar`, `SettingsPage`, `PullToRefresh`.
- `src/context/` — `SettingsContext` (API key/withdrawals/theme persisted to localStorage) and `ThemeContext` (resolved light/dark; also drives the Android status bar style).
- Settings are persisted under the localStorage key `monetag_settings_v1`.

## UI conventions

- Minimal aesthetic: **black & white / neutral grays only, no accent colors, no shadows, no gradients.**
- Cards/surfaces use `bg-white dark:bg-black` with a `border-slate-200 dark:border-neutral-800` hairline.
- The home balance hero is intentionally a borderless typographic hero (big tabular numbers, thin uppercase labels), NOT a card.
- Dark mode is handled with a `.dark` class on `<html>` (Tailwind v4 `@variant dark` in `src/index.css`).