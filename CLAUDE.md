# spider-size-simulator

## Quick Reference
- **Build**: `npm run build` (`tsc -b && vite build`)
- **Dev server**: `npm run dev` → http://localhost:5173
- **Lint**: `npm run lint` (ESLint)
- **Preview**: `npm run preview`
- **Deploy**: `npm run deploy` (gh-pages -d dist) — manual, no CI workflow
- **No test runner configured**

## Architecture
Spider scaling simulator — physics model of giant spiders using biomechanical scaling laws.

```
/src/
  /model/               → Pure simulation logic (NOT /sim/ like newer animal sims)
    calculations.ts     → Physics calculations (scaling laws, stress analysis)
    failureModes.ts     → Failure condition definitions
    modelConfig.ts      → Configuration constants
    index.ts            → Barrel exports
  /components/          → React UI components + CSS files (co-located)
    SpiderSchematic.tsx  → SVG spider visualization
    ControlsPanel.tsx    → Parameter controls
    ChartsPanel.tsx      → D3.js data visualization charts
    ViabilityGauge.tsx   → Viability indicator
    FailureStatePanel.tsx → Failure state display
    FailureEventModal.tsx → Failure event modal
    FunFactsPanel.tsx    → Educational scaling biology facts
    AssumptionsModal.tsx → Model assumptions display
    /charts/            → Chart sub-components
    index.ts            → Barrel exports
    *.css               → Component-specific CSS (plain CSS, not modules)
  /App.tsx              → Main app shell
  /main.tsx             → Entry point
```

## Key Conventions
- **Branch**: `master` (not `main`) — this is the default and deployment branch
- **React 18** + TypeScript 5.6 + Vite 6 (older stack than ant/eagle/elephant sims)
- **D3.js 7.9**: Used for chart visualizations (unlike newer sims which are D3-free)
- **Plain CSS**: Co-located `.css` files per component (not CSS Modules)
- **Model directory**: `/model/` not `/sim/` — different naming from newer animal sims
- **Base path**: Hardcoded `/spider-size-simulator/` in vite.config.ts (not dynamic like newer sims)
- **No Vitest**: No test runner installed — older repo predates test standardization

## Deployment
- **URL**: GitHub Pages at `https://idealase.github.io/spider-size-simulator/`
- **Base path**: `/spider-size-simulator/` (hardcoded in vite.config.ts)
- **No CI/CD workflow** — deploy manually with `npm run deploy` (uses gh-pages package)
- **Branch**: `master`

## Common Pitfalls
- No CI — manual deploy only; no automated tests or lint checks on push
- Uses `gh-pages` npm package for deploy (not GitHub Actions pages workflow)
- Older dependencies: React 18 (not 19), Vite 6 (not 7), TypeScript 5.6 (not 5.9)
- Simulation code is in `/model/` not `/sim/` — don't follow newer sim conventions here
- Plain CSS files, not CSS Modules — class name conflicts possible

## Sensitive Files
Do not read, log, or commit: any `.env` files, credentials, secrets.
