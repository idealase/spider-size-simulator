import React from 'react';
import {
  SPECIES_PRESETS,
  SIZE_RANGE,
  ENV_RANGES,
  ModelMode,
  SpeciesPreset,
} from '../model';
import './ControlsPanel.css';

interface ControlsPanelProps {
  bodyLength: number;
  setBodyLength: (value: number) => void;
  preset: SpeciesPreset;
  setPreset: (preset: SpeciesPreset) => void;
  o2Fraction: number;
  setO2Fraction: (value: number) => void;
  gravityMultiplier: number;
  setGravityMultiplier: (value: number) => void;
  mode: ModelMode;
  setMode: (mode: ModelMode) => void;
  onShowAssumptions: () => void;
}

const formatLength = (meters: number): string => {
  if (meters < 0.01) {
    return `${(meters * 1000).toFixed(1)} mm`;
  } else if (meters < 1) {
    return `${(meters * 100).toFixed(1)} cm`;
  } else {
    return `${meters.toFixed(2)} m`;
  }
};

const logToLinear = (logValue: number): number => {
  const logMin = Math.log10(SIZE_RANGE.min);
  const logMax = Math.log10(SIZE_RANGE.max);
  return Math.pow(10, logMin + (logMax - logMin) * logValue);
};

const linearToLog = (linearValue: number): number => {
  const logMin = Math.log10(SIZE_RANGE.min);
  const logMax = Math.log10(SIZE_RANGE.max);
  const logValue = Math.log10(linearValue);
  return (logValue - logMin) / (logMax - logMin);
};

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  bodyLength,
  setBodyLength,
  preset,
  setPreset,
  o2Fraction,
  setO2Fraction,
  gravityMultiplier,
  setGravityMultiplier,
  mode,
  setMode,
  onShowAssumptions,
}) => {
  const handleSizeSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sliderValue = parseFloat(e.target.value);
    setBodyLength(logToLinear(sliderValue));
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPreset = SPECIES_PRESETS.find(p => p.name === e.target.value);
    if (selectedPreset) {
      setPreset(selectedPreset);
      setBodyLength(selectedPreset.baselineLength);
    }
  };

  return (
    <div className="controls-panel">
      <h2>🕷️ Spider Configuration</h2>
      
      <div className="control-group">
        <label htmlFor="size-slider">
          Body Length: <strong>{formatLength(bodyLength)}</strong>
        </label>
        <input
          id="size-slider"
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={linearToLog(bodyLength)}
          onChange={handleSizeSlider}
          className="size-slider"
          aria-label="Spider body length"
        />
        <div className="slider-labels">
          <span>5mm (tiny)</span>
          <span>3m (elephant!)</span>
        </div>
      </div>

      <div className="control-group">
        <label htmlFor="preset-select">Species Baseline</label>
        <select
          id="preset-select"
          value={preset.name}
          onChange={handlePresetChange}
          className="preset-select"
        >
          {SPECIES_PRESETS.map(p => (
            <option key={p.name} value={p.name}>
              {p.name} ({formatLength(p.baselineLength)})
            </option>
          ))}
        </select>
        <div className="preset-description">{preset.description}</div>
      </div>

      <div className="control-group">
        <label htmlFor="mode-select">Model Complexity</label>
        <select
          id="mode-select"
          value={mode}
          onChange={(e) => setMode(e.target.value as ModelMode)}
          className="mode-select"
        >
          <option value="simple">Simple (fewer equations)</option>
          <option value="extended">Extended (thermal, circulation)</option>
        </select>
      </div>

      <h3>🌍 Environment</h3>

      <div className="control-group">
        <label htmlFor="o2-slider">
          Atmospheric O₂: <strong>{(o2Fraction * 100).toFixed(0)}%</strong>
        </label>
        <input
          id="o2-slider"
          type="range"
          min={ENV_RANGES.o2Fraction.min}
          max={ENV_RANGES.o2Fraction.max}
          step="0.01"
          value={o2Fraction}
          onChange={(e) => setO2Fraction(parseFloat(e.target.value))}
          className="env-slider"
          aria-label="Atmospheric oxygen fraction"
        />
        <div className="slider-labels">
          <span>10% (low)</span>
          <span>35% (Carboniferous!)</span>
        </div>
      </div>

      <div className="control-group">
        <label htmlFor="gravity-slider">
          Gravity: <strong>{gravityMultiplier.toFixed(1)}g</strong>
        </label>
        <input
          id="gravity-slider"
          type="range"
          min={ENV_RANGES.gravityMultiplier.min}
          max={ENV_RANGES.gravityMultiplier.max}
          step="0.1"
          value={gravityMultiplier}
          onChange={(e) => setGravityMultiplier(parseFloat(e.target.value))}
          className="env-slider"
          aria-label="Gravity multiplier"
        />
        <div className="slider-labels">
          <span>0.1g (Moon)</span>
          <span>2.0g (heavy)</span>
        </div>
      </div>

      <button 
        className="assumptions-button"
        onClick={onShowAssumptions}
        type="button"
      >
        📖 View Assumptions & Equations
      </button>
    </div>
  );
};
