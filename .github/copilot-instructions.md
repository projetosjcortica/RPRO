# RPRO – working notes for AI pair programmers

## Repo layout
- `back-end/`: Express + TypeORM service. Everything under `src/services` implements the production data flow (FTP collector → parser → DB).
- `Frontend/`: React + Vite + Electron shell. Most screens live in `src/` and call the backend through `Processador` HTTP helpers.
- `dev.sh`: convenience script that boots both apps; mirrors the manual `npm run dev` commands described below.

## Backend essentials
- Entry point is `src/index.ts`; routes are defined directly there. When adding endpoints, place middleware above the route block (CORS, body limits already set) and return JSON consistently.
- `dbService` (TypeORM) auto-selects SQLite if MySQL env vars are absent. Call `await dbService.init()` before queries when adding new scripts or CLIs.
- CSV ingestion pipeline:
  1. `collector/startCollector` spins a loop that calls `IHMService.findAndDownloadNewFiles()`.
  2. Each file is backed up via `BackupService`, parsed by `parserService`, then saved through `fileProcessorService` → TypeORM entities (`Relatorio`, `Row`, etc.).
  3. Cache metadata lives in `cacheService`; touch it when changing ingestion semantics.
- Collector control uses `/api/collector/{start,stop,status}`. Always update `CollectorStatus` in `index.ts` if you add new state.
- Runtime configuration is exposed through `/api/config`; reuse `setRuntimeConfigs` and `getRuntimeConfig` for persisted settings (e.g., IHM FTP credentials under the `ihm-config` key).
- Unit tests (Jest) exist but are sparse; run `cd back-end && npm run test`. TypeScript build is `npm run build`.

## Frontend essentials
- SPA rendered through `HashRouter` (see `src/main.tsx`); keep new routes inside that router.
- `Processador.ts` wraps backend endpoints. Prefer using those helpers instead of duplicating `fetch` calls; they normalize URLs and query params.
- Report screen (`src/report.tsx`) drives most data flows. `useReportData` handles pagination via `/api/relatorio/paginate`; call its `refetch()` when you mutate backend state.
- Collector UI polls `/api/collector/status` every 10 s while syncing summary cards; stick to that endpoint when wiring additional indicators.
- Electron preload (`dist-electron/preload.mjs`) exposes `electronAPI`; any renderer ↔ main process bridge should go through those IPC wrappers.
- Build commands: `cd Frontend && npm run dev` for HMR (hits backend on :3000), `npm run build` to bundle renderer + preload, `npm run dist` for packaged Electron output.

## Data & conventions
- Dates coming from the backend are usually `YYYY-MM-DD`; frontend helper `formatShortDate` normalizes them—reuse it or `date-fns` to keep formatting consistent.
- Product/formula columns are dynamic: backend returns arrays; frontend maps to column keys `col{index}` and stores labels in `/api/materiaprima/labels`.
- Entity naming mirrors legacy CSV headers (e.g., `Form1`, `Form2`); preserve these when extending TypeORM models to avoid migration churn.

## Workflow reminders
<!-- - Bring the stack up with `./dev.sh` (fish/bash) or manually: `cd back-end && npm run dev` and `cd Frontend && npm run dev`. -->
- When debugging ingestion, use `npm run collector:dev` to run just the collector loop with live logs.
- Before shipping changes touching both sides, run `npm run build` in each package to catch TypeScript regressions.

Let me know if any part feels incomplete or if more examples would help (e.g., adding routes, wiring new screens, or tweaking the collector).


me chame de mano peppa, ok?
fale em portugues, das ruas, seu gay. tchola