# Cortez — Release Notes
Version: 2025.11.17
Date: 2025-11-17

Summary
-------
This release assembles a week of focused improvements across data filtering, reporting accuracy, UI polish, Amendoim workflow enhancements, and PDF/export capabilities. The primary theme is empowering users with advanced, persistent filters that apply uniformly across the table, side-summary (resumo) and charts — while preserving report/export fidelity and respecting product-level calculation flags.

Highlights
---------
- Advanced filter system added to the reports flow (persisted in localStorage, includes/excludes for products and formulas, friendly labels, auto-applied).
- Charts and resumo now honor advanced filters and ignore products flagged with `ignorarCalculos` in aggregations while keeping them visible in detail views and exports.
- Backend and frontend fixes to query builder handling and request wiring (prevent runtime errors and ensure robust query construction).
- Significant Amendoim-focused improvements: exports, PDF layouts, duplicate protection, configurable comparisons, and collector robustness.
- New About endpoints and documentation aggregation for easier traceability of feature docs and commit history.

Notable changes (detailed)
-------------------------
The following is a readable interpretation of the latest commits and what they delivered. Items are grouped by functional area and expressed as change descriptions suitable for a release log.

Reporting & Filters
- Implemented advanced filters in the report data path (commit f7029d7). These filters support include/exclude semantics for both formulas and product columns, store state in localStorage, and present friendly formula/product labels in the UI.
- Ensured advanced filters persist and synchronize across components using custom events (`advancedFiltersChanged` / `advancedFiltersStorageUpdated`). This removes the need for a manual “Apply” action and keeps the table, resumo and charts in sync.
- Made the Processador and chart widgets forward the advancedFilter payload to backend endpoints so aggregations respect the same filter set applied to rows.

Charts & Resumo
- Charts (produtos, formulas, horarios, semana, diasSemana, stats) and resumo now accept advancedFilters and apply them in the DB query builder before aggregation; product values marked `ignorarCalculos` are excluded from sums and averages but remain present in row exports (commit sequence and follow-ups).
- Fixed a runtime `Assignment to constant variable` bug in the chart endpoints which occurred when calling an advanced filter helper; the query builder is now modified in-place (no reassignment) for safer operation.

Backend & Data Layer
- Introduced a centralized helper to apply advanced filters to TypeORM query builders, avoiding duplicated filter code and ensuring consistent behavior across endpoints.
- Added defensive parsing and fallback handling for advancedFilters coming from the frontend (both GET querystrings and POST bodies supported).
- Added endpoints to expose repository commits and READMES contents for an About page, making it simple to surface documentation and recent work to users.
- Cache improvements for materia prima (product meta) to avoid repeated DB calls while keeping an invalidation pathway when product configs change.

Amendoim (specialized flow)
- Updated Amendoim export and PDF rendering to support separate entry/exit tables and improved layout for commercial outputs (3582740, and follow-ups).
- Improved AmendoimService and collector robustness to avoid duplicate entries during batch saves and improve CSV processing resilience (36bfb2b, 9ba1d38).
- Work on Amendoim UI: improved comparativo mode visuals and automatic configuration migration (774649f).

PDF, Export & UX
- PDF comments and layout fixes; multiple commits cleaned up styling and corrected export formatting across pages (several commits on 2025-11-11/12).
- Responsivity and UI fixes for filter bars and table rendering, improving display on constrained widths (bb9a225 and related).
- Added comprehensive visual & functional analysis guidelines embedded in the repo to help maintain consistent UI changes (76c4187).

Admin, Collector & IHM
- Dual IHM backup/collection flow implemented with safer unique names and fallbacks (7da243d).
- Collector improvements include better cache handling and defaults; collector status endpoints already drive the UI (9ba1d38 and related).
- Experimental features toggles and product activation management added for safe rollout of new functionality (adcb65e).

Refactors & Maintenance
- Several refactors touched Amendoim entities and configuration services to remove deprecated fields and to stabilize CSV format handling (ba59fb2, affd3d4).
- Cleanup, merging and multiple styling commits throughout (merges: f573e2a, 40a28a5, etc.).

Upgrade & Migration Notes
-------------------------
- If you rely on custom scripts that call chart endpoints: the endpoints now accept `advancedFilters` as JSON (either in the query string for smaller payloads or in the POST body for resumo). Prefer the POST body for larger filters.
- When deploying to Windows hosts, be aware that the backend code which shells out to `git` to obtain commit lists runs the `git` command via a child process. On Windows the passing of percent-escape sequences may require careful quoting — the About endpoint uses the system `git` and should work if Git is available on PATH. If it fails, the endpoint gracefully returns an error; we can change the implementation to use a Node Git library to avoid shell quoting issues if desired.

Testing & Validation
--------------------
- Manual HTTP tests were performed against chartdata/produtos and resumo endpoints with sample advancedFilters payloads to validate the filter application; a `qb` reassignment bug was found and fixed during testing.
- UI wiring was updated so that the advanced filter panel emits events and Processador forwards filters in requests; charts use the hook `useChartData` that now includes advancedFilters in requests.

Credits
-------
Development: equipe Cortez / J.Cortiça Automação (commit authors in the repo). Thank you to contributors who improved Amendoim export, chart queries, and UI consistency.

What's next
-----------
- Render README/feature docs as sanitized Markdown in the About page for better readability.
- Scan other dashboard widgets to ensure all call sites forward `advancedFilters` (some were updated; a repo-wide pass will guarantee coverage).
- Improve performance of complex OR-filter queries across 40 product columns when large include/exclude lists are used (possible indexing or materialized aggregation strategies).

Appendix: raw commit subjects used to compose these notes
--------------------------------------------------------
(Recent commits — abbreviated subjects)

f7029d7 — feat: Implement advanced filters in report data fetching
b5870b4 — feat: Add support for ignoring calculations on products and update related logic in services and components
3582740 — feat: Update AmendoimExport and AmendoimPDF components to support separate entry/exit tables and enhance PDF layout
adcb65e — feat: Implement experimental features toggle and product activation management
774649f — feat: Enhance Amendoim component with improved comparativo mode visuals and automatic config migration
7da243d — feat: Implement dual IHM backup system with unique file naming
ba59fb2 — Refactor Amendoim entity and service to remove deprecated codigoCaixa field and update CSV format handling
36bfb2b — feat: Enhance AmendoimService with triple protection against duplicates during batch save
76c4187 — feat: Add comprehensive guidelines for visual and functional analysis of UI components in Cortez
9ba1d38 — feat: enhance AmendoimCollector and IHMService for improved cache handling and configuration defaults

(Plus multiple merges and PDF/style commits from 2025-11-11/12)

---

Generated by automation on 2025-11-17; review for tone and any legal/marketing copy adjustments before publishing.