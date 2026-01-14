import React from 'react';
import { ModelOutput, getViabilityStatus, FailureMode } from '../model';
import './ViabilityGauge.css';

interface ViabilityGaugeProps {
  modelOutput: ModelOutput;
}

export const ViabilityGauge: React.FC<ViabilityGaugeProps> = ({ modelOutput }) => {
  const { viabilityIndex, failureModes } = modelOutput;
  const status = getViabilityStatus(viabilityIndex);
  const activeFailures = failureModes.filter((f: FailureMode) => f.active);

  // Calculate gauge fill percentage
  const fillPercent = Math.min(100, Math.max(0, viabilityIndex));
  
  // Gauge arc calculation
  const radius = 80;
  const strokeWidth = 12;
  const circumference = Math.PI * radius; // Half circle
  const offset = circumference - (fillPercent / 100) * circumference;

  return (
    <div className="viability-gauge">
      <h2>Viability Index</h2>
      
      <div className="gauge-container">
        <svg viewBox="0 0 200 120" className="gauge-svg">
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#45475a"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Filled arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={status.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="gauge-fill"
          />
        </svg>
        
        <div className="gauge-value" style={{ color: status.color }}>
          <span className="gauge-number">{viabilityIndex.toFixed(0)}</span>
          <span className="gauge-percent">%</span>
        </div>
        
        <div className="gauge-status" style={{ color: status.color }}>
          {status.emoji} {status.label}
        </div>
      </div>

      {activeFailures.length > 0 && (
        <div className="failure-modes">
          <h3>⚠️ Active Failure Modes</h3>
          <ul>
            {activeFailures.map((failure: FailureMode) => (
              <li key={failure.key} className="failure-item">
                {failure.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeFailures.length === 0 && (
        <div className="no-failures">
          <span className="success-icon">✅</span>
          <span>All systems nominal</span>
        </div>
      )}
    </div>
  );
};
