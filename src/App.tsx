import { useState, useMemo } from 'react';
import {
  SPECIES_PRESETS,
  ENV_DEFAULTS,
  SIZE_RANGE,
  SpeciesPreset,
  ModelMode,
  computeModel,
  computeModelArray,
  generateSizeArray,
} from './model';
import {
  ControlsPanel,
  ViabilityGauge,
  SpiderSchematic,
  ChartsPanel,
  AssumptionsModal,
} from './components';
import './App.css';

type ChartTab = 'health' | 'scaling' | 'threshold';

function App() {
  // State
  const [bodyLength, setBodyLength] = useState(SPECIES_PRESETS[0].baselineLength);
  const [preset, setPreset] = useState<SpeciesPreset>(SPECIES_PRESETS[0]);
  const [o2Fraction, setO2Fraction] = useState(ENV_DEFAULTS.o2Fraction);
  const [gravityMultiplier, setGravityMultiplier] = useState(ENV_DEFAULTS.gravityMultiplier);
  const [mode, setMode] = useState<ModelMode>('simple');
  const [chartTab, setChartTab] = useState<ChartTab>('health');
  const [showAssumptions, setShowAssumptions] = useState(false);

  // Generate size array for charts (memoized)
  const sizes = useMemo(() => 
    generateSizeArray(SIZE_RANGE.min, SIZE_RANGE.max, 100),
    []
  );

  // Compute current model output
  const modelOutput = useMemo(() => 
    computeModel({
      bodyLength,
      baselineLength: preset.baselineLength,
      o2Fraction,
      gravityMultiplier,
      mode,
    }),
    [bodyLength, preset.baselineLength, o2Fraction, gravityMultiplier, mode]
  );

  // Compute model outputs for all sizes (for charts)
  const modelOutputs = useMemo(() => 
    computeModelArray(sizes, preset.baselineLength, o2Fraction, gravityMultiplier, mode),
    [sizes, preset.baselineLength, o2Fraction, gravityMultiplier, mode]
  );

  return (
    <div className="app">
      <header className="app-header">
        <h1>🕷️ Spider Size Simulator</h1>
        <p className="tagline">
          What happens when a spider grows to elephant size? <em>Spoiler: bad things.</em>
        </p>
      </header>

      <main className="app-main">
        <div className="panel-controls">
          <ControlsPanel
            bodyLength={bodyLength}
            setBodyLength={setBodyLength}
            preset={preset}
            setPreset={setPreset}
            o2Fraction={o2Fraction}
            setO2Fraction={setO2Fraction}
            gravityMultiplier={gravityMultiplier}
            setGravityMultiplier={setGravityMultiplier}
            mode={mode}
            setMode={setMode}
            onShowAssumptions={() => setShowAssumptions(true)}
          />
          <ViabilityGauge modelOutput={modelOutput} />
        </div>

        <div className="panel-spider">
          <SpiderSchematic modelOutput={modelOutput} bodyLength={bodyLength} />
        </div>

        <div className="panel-charts">
          <ChartsPanel
            modelOutputs={modelOutputs}
            sizes={sizes}
            currentSize={bodyLength}
            activeTab={chartTab}
            setActiveTab={setChartTab}
          />
        </div>
      </main>

      <footer className="app-footer">
        <p>
          A toy model for educational entertainment. 
          Not actual biomechanics research. 
          <button 
            className="footer-link"
            onClick={() => setShowAssumptions(true)}
            type="button"
          >
            Learn more
          </button>
        </p>
      </footer>

      <AssumptionsModal
        isOpen={showAssumptions}
        onClose={() => setShowAssumptions(false)}
      />
    </div>
  );
}

export default App;
