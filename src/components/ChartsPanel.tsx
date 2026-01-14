import React from 'react';
import { ModelOutput, FailurePoint } from '../model';
import { SubsystemHealthChart, ScalingLawsChart, FailureThresholdChart } from './charts';
import './ChartsPanel.css';

type ChartTab = 'health' | 'scaling' | 'threshold';

interface ChartsPanelProps {
  modelOutputs: ModelOutput[];
  sizes: number[];
  currentSize: number;
  activeTab: ChartTab;
  setActiveTab: (tab: ChartTab) => void;
  failurePoints?: FailurePoint[];
}

export const ChartsPanel: React.FC<ChartsPanelProps> = ({
  modelOutputs,
  sizes,
  currentSize,
  activeTab,
  setActiveTab,
  failurePoints = [],
}) => {
  const tabs: { id: ChartTab; label: string; emoji: string }[] = [
    { id: 'health', label: 'Subsystem Health', emoji: '❤️' },
    { id: 'scaling', label: 'Scaling Laws', emoji: '📈' },
    { id: 'threshold', label: 'Failure Map', emoji: '⚠️' },
  ];

  return (
    <div className="charts-panel">
      <div className="chart-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`chart-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            <span className="tab-emoji">{tab.emoji}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="chart-content">
        {activeTab === 'health' && (
          <SubsystemHealthChart
            modelOutputs={modelOutputs}
            sizes={sizes}
            currentSize={currentSize}
            failurePoints={failurePoints}
          />
        )}
        {activeTab === 'scaling' && (
          <ScalingLawsChart
            modelOutputs={modelOutputs}
            sizes={sizes}
            currentSize={currentSize}
            failurePoints={failurePoints}
          />
        )}
        {activeTab === 'threshold' && (
          <FailureThresholdChart
            modelOutputs={modelOutputs}
            sizes={sizes}
            currentSize={currentSize}
            failurePoints={failurePoints}
          />
        )}
      </div>
    </div>
  );
};
