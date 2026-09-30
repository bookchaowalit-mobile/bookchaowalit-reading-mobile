# Upgrade Plan

## Current state

- Before this pass: **2/10** — real SoloEmpire ventures/goals screens, but
  the app could not start or bundle (no `index.js`, Babel preset `react-native`
  does not exist, no Metro config), CRLF line endings, no README, no lint/test
  setup, CI only ran `tsc` (which failed), `JSON.parse` on storage could crash
  screens, the Dashboard showed stale data after edits on other tabs and
  sorted state in place, goal progress was `NaN` for a 0 target, "Clear all
  data" wiped every AsyncStorage key, and three native deps were unused.
- After this pass: **6/10** — bundles, tested logic, synced screens, honest CI.

## Backlog

### P0
- Decide the repo's identity: rename to e.g. `solo-empire-mobile`, or replace
  the code with a reading app matching the repository name.
- Generate native projects (RN 0.73 template `android/` + `ios/`, app name
  `SoloEmpire`) and add an Android debug build job to CI.

### P1
- Edit ventures/goals after creation; custom progress amounts.
- Monthly revenue/expense history per venture (enables trends/charts).
- Fix the 26 `react-native/no-inline-styles` warnings, then lint with
  `--max-warnings=0`.

### P2
- Upgrade RN 0.73 -> current (0.73 is out of support) and ESLint 9.
- Export/import data as JSON.

## Done in this pass

- `src/lib/business.ts`: amount parsing, defensive storage parsing, totals
  with margin, non-mutating top ventures, safe goal progress, deadline
  parsing/days left, form validation — Jest tests.
- `src/store.ts`: shared persisted hooks that notify all mounted tabs; "clear"
  removes only this app's keys; save/load errors are shown instead of logged.
- Added `index.js`, fixed Babel preset, Metro/Jest/ESLint/Prettier config,
  test dev dependencies, committed `package-lock.json`; removed unused
  `react-native-chart-kit`, `react-native-svg`, `react-native-vector-icons`
  and deprecated `@types/react-native`; normalized line endings to LF.
- README written; CI runs `npm ci`, lint, typecheck, Jest and a Metro Android
  bundle with no failure masking (and no unused Java setup).
