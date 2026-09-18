# AGENTS.md

Guidance for AI agents and contributors working in this repository.

## Project overview

**Moneboard** — an unofficial, read-only earnings dashboard for Monetag publishers (the API key is only used to read a publisher's own statistics). The app ships as a **native Android app** (Capacitor shell with React 19 + Vite + Tailwind v4 bundled), and API calls go directly to `https://api.monetag.com/v5`.

The API key is **not bundled**. On first open the app asks the user for their Monetag API key and total withdrawals; both are stored on-device under `monetag_settings_v1`.

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

- `src/App.tsx` — tab routing (`home` | `daily` | `graph` | `settings`), swipe-to-change-tab, cache-first data layer. Shows an `OnboardingScreen` when no API key is configured yet.
- `src/utils/apiCache.ts` — day-indexed localStorage cache keyed by API key (`getDayIndex`/`mergeDayIndex`). Charts, tables and filters read from this index only; they never hit the API.
- `src/api/client.ts` — Monetag API calls (direct from the native app); `getAllStatistics` pages through a range.
- `src/components/` — UI: `Header`, `BottomNav`, `OnboardingScreen`, `EarningsHighlight` (full-screen centered typographic balance hero with odometer roll + the hold/approved split), `ChartsSection`, `DailyStatsTable`, `FilterBar`, `SettingsPage`, `PullToRefresh`, `Odometer` (rolling digit counter).
- **Cache model**: pull-to-refresh always re-fetches the last 3 days (today/yesterday settle overnight) and backfills any day missing from the last 30 (`SYNC_WINDOW_DAYS`). The Settings **Load all data** button backfills the whole history into the cache. The odometer replays its roll on every refresh (even when values are unchanged).
- Home hero balance math: `currentBalance = lifetime − withdrawals`; Monetag holds the last 4 running calendar days, so `heldBalance = sum of exactly the last 4 distinct dates (by date_time)` and `approvedBalance = currentBalance − heldBalance`. The hold is computed from calendar dates, never raw row counts (4 rows can straddle 5 calendar days).
- `src/context/` — `SettingsContext` (API key/withdrawals/theme persisted to localStorage) and `ThemeContext` (resolved light/dark; also drives the Android status bar style).
- Settings are persisted under the localStorage key `monetag_settings_v1`.

## UI conventions

- Minimal aesthetic: **black & white / neutral grays only, no accent colors, no shadows, no gradients.**
- Cards/surfaces use `bg-white dark:bg-black` with a `border-slate-200 dark:border-neutral-800` hairline.
- The home balance hero is intentionally a borderless typographic hero (big tabular numbers, thin uppercase labels), NOT a card.
- Dark mode is handled with a `.dark` class on `<html>` (Tailwind v4 `@variant dark` in `src/index.css`).