# spider-size-simulator — Copilot Instructions

## Project Overview

An interactive web simulator that models what happens when you scale a spider to different sizes. Uses real physics (square-cube law, hydraulic locomotion, exoskeleton stress, respiration limits) to calculate structural viability, failure modes, and fun facts as the user adjusts the spider's size multiplier. Features D3.js-powered charts for data visualization alongside React components.

## Tech Stack

- **Frontend**: React 18 / Vite 6 / TypeScript 5.6
- **Backend**: N/A (static frontend only)
- **Data**: None (all calculations are client-side)
- **Visualization**: D3.js 7 for charts (scaling laws, failure thresholds, subsystem health)
- **Styling**: Vanilla CSS (component-level CSS files)
- **Testing**: Not yet configured — plan to add Vitest
- **Deployment**: Static site at spider.sandford.systems via nginx
- **CI/CD**: GitHub Actions on self-hosted runner (to be configured)

## Quick Commands

```bash
# Install dependencies
npm ci

# Start dev server
npm run dev

# Build for production
npm run build

# Lint
npm run lint

# Preview production build
npm run preview

# Deploy to GitHub Pages (legacy)
npm run deploy
```

## Project Structure

```
spider-size-simulator/
├── src/
│   ├── components/             # React UI components
│   │   ├── AssumptionsModal.tsx/css    # Model assumptions display
│   │   ├── ChartsPanel.tsx/css        # Charts container panel
│   │   ├── ControlsPanel.tsx/css      # Size multiplier controls
│   │   ├── FailureEventModal.tsx/css  # Failure event popup
│   │   ├── FailureStatePanel.tsx/css  # Failure state summary
│   │   ├── FunFactsPanel.tsx/css      # Scaled fun facts
│   │   ├── SpiderSchematic.tsx/css    # Spider body schematic
│   │   ├── ViabilityGauge.tsx/css     # Overall viability gauge
│   │   ├── charts/                    # D3.js chart components
│   │   │   ├── FailureThresholdChart.tsx  # Failure threshold visualization
│   │   │   ├── ScalingLawsChart.tsx       # Square-cube law chart
│   │   │   ├── SubsystemHealthChart.tsx   # Subsystem health bars
│   │   │   ├── Charts.css                 # Chart styles
│   │   │   └── index.ts                   # Chart barrel export
│   │   └── index.ts            # Component barrel export
│   ├── model/                  # Physics model (calculation engine)
│   │   ├── calculations.ts     # Core scaling calculations
│   │   ├── failureModes.ts     # Failure mode definitions
│   │   ├── modelConfig.ts      # Model configuration and constants
│   │   └── index.ts            # Public API barrel export
│   ├── App.tsx                 # Root application component
│   ├── App.css                 # Application styles
│   ├── main.tsx                # Application entry point
│   ├── index.css               # Global styles
│   └── vite-env.d.ts           # Vite type declarations
├── public/                     # Static assets
├── .github/
│   ├── copilot-instructions.md # This file
│   ├── agents/                 # Agent definitions
│   ├── prompts/                # Prompt templates
│   ├── skills/                 # Agent skills
│   └── ISSUE_TEMPLATE/         # Issue templates
├── package.json
├── vite.config.ts
├── tsconfig.json
└── eslint.config.js
```

## Coding Conventions

### General
- Use TypeScript strict mode — no `any` types
- Prefer named exports over default exports
- Keep functions under 50 lines — extract helpers if longer
- Error messages must be user-friendly, not stack traces

### Naming
- Components: PascalCase (`ViabilityGauge.tsx`)
- Model modules: camelCase (`calculations.ts`, `failureModes.ts`)
- CSS files: match component name (`ViabilityGauge.css` for `ViabilityGauge.tsx`)
- CSS classes: kebab-case

### File Organization
- One component per file, with co-located CSS file
- D3.js chart components live in `src/components/charts/`
- Physics model lives in `src/model/` — keep it pure (no React or D3 imports)
- UI components live in `src/components/`
- Use barrel exports (`index.ts`) for clean imports

### Git
- Conventional commits: `feat|fix|docs|chore|refactor|test|ci: description`
- Branch naming: `type/issue-number-short-description` (e.g., `feat/42-dark-mode`)
- Default branch is `master`

## Architecture Decisions

- **Vite over CRA**: Faster HMR, smaller bundles, native ESM support
- **D3.js for charts**: Provides precise control over data visualization (scaling law curves, threshold charts, health bars) that simple React charting libraries can't match
- **Model separated from UI**: `src/model/` contains pure TypeScript functions with no React or D3 dependencies, making it independently testable
- **No state management library**: App state is simple enough for React's built-in useState/useReducer
- **Component-level CSS**: Each component has its own CSS file rather than a monolithic stylesheet or CSS-in-JS
- **Spider-specific physics**: Models hydraulic locomotion (spiders use hydraulic pressure rather than muscles for leg extension), book lung respiration, and exoskeleton mechanics

## Deployment

- **URL**: https://spider.sandford.systems
- **Build output**: `dist/`
- **Nginx config**: /etc/nginx/sites-enabled/animal-sims
- **Cloudflare Tunnel**: Configured in ~/.cloudflared/config.yml
- **Legacy deploy**: `npm run deploy` pushes to GitHub Pages via gh-pages package

### Deployment Checklist
1. Build succeeds: `npm run build`
2. Lint passes: `npm run lint`
3. Reload nginx: `sudo nginx -t && sudo systemctl reload nginx`
4. Health check: `curl -s https://spider.sandford.systems`

## Testing Strategy

- **Status**: Tests not yet configured — Vitest to be added
- **When added**: Unit tests for `src/model/` calculations, component tests for React components
- **Test location**: Plan for co-located `*.test.ts` files

### What to Test (when tests are added)
- All model functions (scaling calculations, failure modes, viability)
- Hydraulic locomotion and book lung respiration calculations
- Component rendering and user interactions
- D3.js chart data transformations (not SVG output)
- Edge cases: zero size, extreme multipliers, boundary values

### What NOT to Test
- CSS/styling details
- D3.js SVG rendering output (test the data, not the pixels)
- Third-party library internals
- Implementation details that may change — test behavior, not code

## Common Pitfalls

- **SI units internally**: The physics model uses SI units (meters, kilograms, pascals) internally but displays human-friendly units — always convert at the display layer
- **Pure model functions**: Never import React or D3 in `src/model/` — it must stay pure for testability
- **D3.js and React DOM conflict**: D3 wants to manage the DOM directly; in chart components, use D3 for calculations and React refs for DOM access — never let D3 append elements outside the ref
- **Scaling factors compound**: When adding new physics calculations, remember that area scales with r² and volume with r³ — don't accidentally use linear scaling
- **Spider hydraulics**: Spiders extend legs via hydraulic pressure, not muscles — this is fundamentally different from vertebrate locomotion and must be modeled correctly
- **Don't add heavy dependencies**: Check bundle size impact before adding packages — D3 is already a significant dependency
- **Default branch is master**: Not `main` — be careful with git commands and CI configuration

## Related Repos

- **ant-size-simulator**: Sister project — ant scaling physics
- **eagle-size-simulator**: Sister project — eagle scaling physics
- **elephant-size-simulator**: Sister project — elephant scaling physics
- **idealase.github.io**: Meta-repo with agentic SDLC docs and shared templates

## Agent-Specific Instructions

### Scope Control
- Stay within the files listed in the issue. Do not refactor unrelated code.
- If you discover a bug outside your scope, note it in the PR but don't fix it.
- Maximum diff size: 200 lines for size/S, 500 lines for size/M

### PR Format
- Title: conventional commit format (`feat: add dark mode toggle`)
- Body: reference the issue (`Closes #42`)
- Include a "Changes" section listing what was modified and why
- Include a "Testing" section showing test commands run and results

### What NOT to Do
- Do not modify CI/CD workflows unless the issue specifically asks for it
- Do not update dependencies unless the issue specifically asks for it
- Do not add new dev dependencies without explicit instruction
- Do not modify nginx configs, systemd units, or deployment scripts
- Do not read or modify `.env` files, credentials, or secrets
