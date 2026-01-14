import React from 'react';
import { FailureEvent, FAILURE_MODES, FailureModeDefinition } from '../model';
import './FailureStatePanel.css';

interface FailureStatePanelProps {
  failureHistory: FailureEvent[];
  onViewDetails: (failure: FailureEvent) => void;
}

const formatLength = (meters: number): string => {
  if (meters < 0.01) {
    return `${(meters * 1000).toFixed(1)}mm`;
  } else if (meters < 1) {
    return `${(meters * 100).toFixed(1)}cm`;
  } else {
    return `${meters.toFixed(2)}m`;
  }
};

const getSubsystemIcon = (subsystem: string): string => {
  switch (subsystem) {
    case 'respiration': return '🫁';
    case 'hydraulics': return '🦵';
    case 'exoskeleton': return '🦴';
    case 'locomotion': return '🚶';
    default: return '⚙️';
  }
};

const getStatusInfo = (failure: FailureEvent, mode: FailureModeDefinition | undefined) => {
  if (failure.isIrreversible) {
    return { label: 'IRREVERSIBLE', className: 'status-catastrophic', icon: '💀' };
  }
  if (failure.isResolved) {
    return { label: 'RESOLVED', className: 'status-resolved', icon: '✅' };
  }
  if (failure.isActive) {
    if (mode?.severity === 'hard') {
      return { label: 'ACTIVE (LATCHED)', className: 'status-hard', icon: '🔴' };
    }
    return { label: 'ACTIVE', className: 'status-active', icon: '⚠️' };
  }
  return { label: 'UNKNOWN', className: 'status-unknown', icon: '❓' };
};

export const FailureStatePanel: React.FC<FailureStatePanelProps> = ({
  failureHistory,
  onViewDetails,
}) => {
  if (failureHistory.length === 0) {
    return null;
  }

  // Sort by timestamp (most recent first)
  const sortedFailures = [...failureHistory].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="failure-state-panel">
      <div className="failure-panel-header">
        <h3>⚠️ Failure Log</h3>
        <span className="failure-count">{failureHistory.length} event{failureHistory.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="failure-list">
        {sortedFailures.map((failure, index) => {
          const mode = FAILURE_MODES[failure.failureId];
          if (!mode) return null;

          const statusInfo = getStatusInfo(failure, mode);

          return (
            <div 
              key={`${failure.failureId}-${failure.timestamp}-${index}`}
              className={`failure-item ${statusInfo.className}`}
              onClick={() => onViewDetails(failure)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onViewDetails(failure)}
            >
              <div className="failure-item-icon">
                {getSubsystemIcon(mode.subsystem)}
              </div>
              
              <div className="failure-item-content">
                <div className="failure-item-title">{mode.title}</div>
                <div className="failure-item-meta">
                  at {formatLength(failure.triggeredAtSize)} ({failure.triggeredAtScale.toFixed(1)}× scale)
                </div>
              </div>

              <div className={`failure-item-status ${statusInfo.className}`}>
                <span className="status-icon">{statusInfo.icon}</span>
                <span className="status-label">{statusInfo.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
