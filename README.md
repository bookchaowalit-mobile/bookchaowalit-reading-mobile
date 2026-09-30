# SoloEmpire — Mobile (bookchaowalit-reading-mobile)

React Native CLI app for tracking a solo business portfolio: ventures
(revenue, expenses, status) and money goals, with a dashboard overview.

> Naming note: this repository is called `reading-mobile`, but its code has
> always been the SoloEmpire business dashboard. The owner should decide
> whether to rename the repo or move this app (see `docs/UPGRADE-PLAN.md`).

## Features

- **Dashboard**: total revenue, expenses, profit and margin, active ventures,
  top goals and top ventures by profit — updates immediately when you change
  data on the other tabs.
- **Ventures**: add a venture (name, category, revenue, expenses), tap to
  cycle status active → paused → planning, delete.
- **Goals**: money targets with +฿1K/+฿5K/+฿10K progress buttons, optional
  `YYYY-MM-DD` deadline with days left / overdue.
- **Settings**: clear this app's data (only its own storage keys).
- All data stays on the device (AsyncStorage); corrupt stored data is ignored
  instead of crashing the app.

## Tech Stack

- React Native 0.73 (bare CLI), TypeScript, React Navigation 6 (bottom tabs),
  AsyncStorage.

## Getting Started

```bash
npm ci
npm start
```

The native `android/` and `ios/` projects have not been generated yet, so
`npm run android` / `npm run ios` need that step first.

## Validation

```bash
npm run validate      # eslint + tsc --noEmit + jest
mkdir -p dist && npm run bundle:android   # Metro bundle smoke check
```

Pure logic lives in `src/lib/business.ts` (Jest tests in `__tests__/`).
CI (`.github/workflows/build.yml`) runs all of the above and fails on errors.
