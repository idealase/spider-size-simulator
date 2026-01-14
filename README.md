# 🕷️ Spider Size Simulator

An educational and entertaining web simulator that models how spider physiology and anatomy degrade as body size scales up—from tiny house spider to elephant-sized monstrosity.

**Live Demo:** [https://idealase.github.io/spider-size-simulator/](https://idealase.github.io/spider-size-simulator/)

![Spider Size Simulator Screenshot](docs/screenshot.png)

## 🎯 Concept

Spiders are remarkable creatures that exploit their small size to achieve feats impossible for larger animals. But what would happen if a spider grew to the size of an elephant? This simulator answers that question by modeling the cascading failures that would occur.

The app demonstrates fundamental scaling laws from biology and physics:
- **Surface area to volume ratio** decreases with size
- **Oxygen diffusion** becomes limiting at larger scales  
- **Structural strength** doesn't keep pace with weight
- **Hydraulic systems** fail under increased pressure demands

## 🔬 The Model

### Simplifying Assumptions

⚠️ **This is a toy model for educational entertainment, NOT definitive biomechanics research.**

The model makes several simplifications:
- Traits are reduced to monotonic scaling constraints
- Oxygen delivery uses a diffusion/area proxy
- Hydraulic leg extension uses a pressure adequacy proxy
- Exoskeleton strength follows simple geometric scaling
- Many real-world complexities are ignored

### Primary Variables

| Variable | Description |
|----------|-------------|
| **L** | Body length (meters) |
| **L₀** | Baseline length for selected species |
| **s = L / L₀** | Scale factor |
| **gMult** | Gravity multiplier (default 1.0) |
| **O₂frac** | Atmospheric oxygen fraction (default 0.21) |

### Derived Quantities

- **Mass** ∝ s³
- **Surface Area** ∝ s²  
- **Weight Factor (W)** = s³ × gMult

### Scaling Proxies (Capacity Measures)

#### 1. Respiration Proxy
Spiders use book lungs for passive oxygen diffusion. Capacity decreases with size:

```
Simple:   Rcap = (O₂frac / 0.21) × (1 / s)
Extended: Rcap = (O₂frac / 0.21) × (1 / s) × [1 / (1 + k(s-1))]
```
where k ≈ 0.15 represents diffusion distance penalty.

#### 2. Hydraulic Actuation Proxy
Spiders extend legs via hydraulic pressure, not muscles:

```
Hcap = s^β / W^α
```
where α ≈ 0.65, β = 0 (simple) or 0.3 (extended).

#### 3. Exoskeleton Structural Proxy
Stress on exoskeleton increases unfavorably with size:

```
Ecap = 1 / (s^p × gMult)
```
where p = 1 (simple) or 1.3 (extended).

#### 4. Locomotion Proxy
Energy cost of movement scales poorly:

```
Lcap = 1 / (s^γ × gMult)
```
where γ ≈ 0.85 (simple) or 1.1 (extended).

### Health Score Mapping

Proxies are converted to 0-100% health scores:

**Simple mode (piecewise linear):**
```
Health = 100 × clamp((proxy - 0.3) / 0.7, 0, 1)
```

**Extended mode (sigmoid):**
```
Health = 100 × sigmoid(8 × (proxy - 0.6))
```

### Viability Index

Weighted geometric mean of health scores:

```
Viability = 100 × exp(Σ wᵢ × ln(healthᵢ/100 + ε))
```

| Subsystem | Weight |
|-----------|--------|
| Respiration | 35% |
| Exoskeleton | 30% |
| Hydraulics | 20% |
| Locomotion | 15% |

### Failure Thresholds

A failure mode triggers when proxy value drops below **0.35**.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/idealase/spider-size-simulator.git
cd spider-size-simulator

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173/spider-size-simulator/`

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## 🌐 Deploy to GitHub Pages

This project is configured for GitHub Pages deployment as a **project site**.

### Prerequisites

1. Ensure `vite.config.ts` has the base path set:
   ```ts
   export default defineConfig({
     plugins: [react()],
     base: '/spider-size-simulator/',
   })
   ```

2. The repository should be named `spider-size-simulator` under your GitHub account.

### Deployment Steps

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Commit and push your code** to the `main` branch:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

3. **Deploy to GitHub Pages**:
   ```bash
   npm run deploy
   ```
   This will:
   - Build the production bundle (`npm run build`)
   - Push the `dist` folder contents to the `gh-pages` branch

4. **Configure GitHub Pages** (first time only):
   - Go to your repository on GitHub
   - Navigate to **Settings → Pages**
   - Under "Source", select:
     - Branch: `gh-pages`
     - Folder: `/ (root)`
   - Click **Save**

5. **Access your deployed app** at:
   ```
   https://idealase.github.io/spider-size-simulator/
   ```

### Linking from Another Site

To link to the simulator from your existing website, simply add a hyperlink:

```html
<a href="https://idealase.github.io/spider-size-simulator/">
  Try the Spider Size Simulator
</a>
```

## 📁 Project Structure

```
spider-size-simulator/
├── public/
│   └── spider-icon.svg      # Favicon
├── src/
│   ├── model/               # Pure calculation functions
│   │   ├── modelConfig.ts   # Tunable constants
│   │   ├── calculations.ts  # Core math
│   │   └── index.ts
│   ├── components/          # React UI components
│   │   ├── charts/          # D3.js chart components
│   │   │   ├── SubsystemHealthChart.tsx
│   │   │   ├── ScalingLawsChart.tsx
│   │   │   ├── FailureThresholdChart.tsx
│   │   │   └── Charts.css
│   │   ├── ControlsPanel.tsx
│   │   ├── ViabilityGauge.tsx
│   │   ├── SpiderSchematic.tsx
│   │   ├── ChartsPanel.tsx
│   │   ├── AssumptionsModal.tsx
│   │   └── index.ts
│   ├── App.tsx              # Main application
│   ├── App.css              # Layout styles
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🎮 Features

### Controls
- **Size slider**: Log-scale from 5mm to 3m body length
- **Species presets**: House Spider, Tarantula, Jumping Spider
- **Model complexity**: Simple vs Extended modes
- **Environmental factors**:
  - Atmospheric O₂ (10-35%)
  - Gravity multiplier (0.1-2.0g)

### Visualizations
- **Spider schematic**: SVG that highlights failing subsystems
- **Viability gauge**: Real-time health indicator
- **Charts** (D3.js):
  - Subsystem Health vs Size
  - Scaling Laws (log-log)
  - Failure Threshold Map

### Responsive Design
- Mobile-friendly layout (stacked panels)
- Desktop layout (2-column grid)
- Touch-friendly controls

## 🔧 Customization

All model parameters are in `src/model/modelConfig.ts`:

```typescript
// Adjust scaling exponents
export const SCALING_PARAMS = {
  respirationDiffusionK: 0.15,
  hydraulicAlpha: 0.65,
  hydraulicBetaExtended: 0.3,
  exoskeletonPSimple: 1.0,
  // ... etc
};

// Adjust health mapping
export const HEALTH_PARAMS = {
  failureThreshold: 0.3,
  sigmoidCritical: 0.6,
  sigmoidSteepness: 8,
};

// Adjust viability weights
export const VIABILITY_WEIGHTS = {
  respiration: 0.35,
  exoskeleton: 0.30,
  hydraulics: 0.20,
  locomotion: 0.15,
};
```

## 📚 References & Inspiration

- Haldane, J.B.S. "On Being the Right Size" (1926)
- Vogel, S. "Life in Moving Fluids" (1994)
- Foelix, R.F. "Biology of Spiders" (2011)
- McMahon, T.A. & Bonner, J.T. "On Size and Life" (1983)

## 📄 License

MIT License - feel free to use, modify, and distribute.

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

*Remember: This is for fun and education. Real spiders are perfectly sized for their ecological niche, and that's beautiful.* 🕷️❤️
