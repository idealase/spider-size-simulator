import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  SPECIES_PRESETS,
  ENV_DEFAULTS,
  SIZE_RANGE,
  SpeciesPreset,
  ModelMode,
  computeModel,
  computeModelArray,
  generateSizeArray,
  detectFailures,
  computeFailureState,
  FailureEvent,
  getAllFailurePoints,
} from './model';
import {
  ControlsPanel,
  ViabilityGauge,
  SpiderSchematic,
  ChartsPanel,
  AssumptionsModal,
  FailureEventModal,
  FailureStatePanel,
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

  // Failure state management
  const [failureHistory, setFailureHistory] = useState<FailureEvent[]>([]);
  const [selectedFailure, setSelectedFailure] = useState<FailureEvent | null>(null);
  const [suppressedFailures, setSuppressedFailures] = useState<Set<string>>(new Set());

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

  // Compute failure points for chart markers
  const failurePoints = useMemo(() => 
    getAllFailurePoints(preset.baselineLength, o2Fraction, gravityMultiplier, mode),
    [preset.baselineLength, o2Fraction, gravityMultiplier, mode]
  );

  // Detect failures and update history
  useEffect(() => {
    // Get currently active failure IDs based on proxy values
    const currentFailureIds = detectFailures(modelOutput.proxies);
    
    // Compute failure state with history
    const failureState = computeFailureState(
      currentFailureIds,
      failureHistory,
      bodyLength,
      modelOutput.scaleFactor
    );

    // Check if we have newly triggered failures that should show modal
    if (failureState.newlyTriggeredFailures.length > 0) {
      const newFailure = failureState.newlyTriggeredFailures[0];
      if (!suppressedFailures.has(newFailure.failureId)) {
        setSelectedFailure(newFailure);
      }
    }

    // Update history if it changed
    if (failureState.failureHistory.length !== failureHistory.length ||
        failureState.failureHistory.some((f, i) => 
          f.isActive !== failureHistory[i]?.isActive ||
          f.isResolved !== failureHistory[i]?.isResolved
        )) {
      setFailureHistory(failureState.failureHistory);
    }
  }, [modelOutput, bodyLength, suppressedFailures, failureHistory]);

  // Handle failure click from panel
  const handleFailureClick = useCallback((failure: FailureEvent) => {
    setSelectedFailure(failure);
  }, []);

  // Handle suppress toggle
  const handleSuppressFailure = useCallback((failureId: string, suppress: boolean) => {
    setSuppressedFailures(prev => {
      const newSet = new Set(prev);
      if (suppress) {
        newSet.add(failureId);
      } else {
        newSet.delete(failureId);
      }
      return newSet;
    });
  }, []);

  // Close failure modal
  const closeFailureModal = useCallback(() => {
    setSelectedFailure(null);
  }, []);

  // Get active failures for visualization
  const activeFailures = useMemo(() => 
    failureHistory.filter(f => f.isActive),
    [failureHistory]
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
          
          {/* Failure State Panel */}
          {failureHistory.length > 0 && (
            <FailureStatePanel
              failureHistory={failureHistory}
              onViewDetails={handleFailureClick}
            />
          )}
        </div>

        <div className="panel-spider">
          <SpiderSchematic 
            modelOutput={modelOutput} 
            bodyLength={bodyLength}
            activeFailures={activeFailures}
          />
        </div>

        <div className="panel-charts">
          <ChartsPanel
            modelOutputs={modelOutputs}
            sizes={sizes}
            currentSize={bodyLength}
            activeTab={chartTab}
            setActiveTab={setChartTab}
            failurePoints={failurePoints}
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

      {/* Failure Event Modal */}
      <FailureEventModal
        failureEvent={selectedFailure}
        onClose={closeFailureModal}
        onDontShowAgain={(failureId) => handleSuppressFailure(failureId, true)}
      />
    </div>
  );
}

export default App;
