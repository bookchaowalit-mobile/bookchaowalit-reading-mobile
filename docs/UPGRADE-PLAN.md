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

## Done in this pass (pass 2)

Score: 6/10 (was 5/10) — a data-loss bug fixed and lint is now strict; identity decision (P0) still open.

- Bug fix (data loss): if the initial AsyncStorage read failed, the next save wrote a list built on the empty in-memory state over the stored ventures/goals. `useStoredList` now refuses to write until a read has succeeded and tells the user why (regression test fails on the old code).
- Lint: all 26 `react-native/no-inline-styles` warnings removed (named StyleSheet entries for colors, badges and spacers); `npm run lint` now uses `--max-warnings=0`, so CI enforces it.
- Jest: 20 s timeout for cold CI runs.
- Advisories: no same-major fixes (image-size, ip, fast-xml-parser, decode-uri-component via RN 0.73 tooling) — needs the RN upgrade (P2).
- Verified: lint (0 warnings), typecheck, jest (14, also `--no-cache`), `npm run bundle:android`.

## Done in this pass (pass 3)

Score: 7.5/10 (was 7/10) — edge-case hunt in `src/lib/business.ts`.

- Bug: `parseAmount` deleted every comma, so a decimal comma "7,5" became 75 and "12,50" became 1250. Commas now count as thousands separators only in groups of three; a single comma with 1–2 decimals is a decimal comma; full-width digits are folded.
- Bug: goal progress used `toFixed(0)`, so 99.6% showed "100%" on an unfinished goal (dashboard and goals list). `goalPercentLabel` floors.
- Note: `npm run bundle:android` needs `mkdir -p dist` first (the script does not create it).
- Verified: lint, typecheck, 17 Jest tests, `react-native bundle` for Android.
