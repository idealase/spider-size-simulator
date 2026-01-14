import React, { useEffect, useState } from 'react';
import { FailureModeDefinition, FailureEvent, FAILURE_MODES } from '../model';
import './FailureEventModal.css';

interface FailureEventModalProps {
  failureEvent: FailureEvent | null;
  onClose: () => void;
  onDontShowAgain?: (failureId: string) => void;
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

const getSeverityIcon = (severity: string): string => {
  switch (severity) {
    case 'catastrophic': return '💀';
    case 'hard': return '🔴';
    case 'soft': return '🟡';
    default: return '⚠️';
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

export const FailureEventModal: React.FC<FailureEventModalProps> = ({
  failureEvent,
  onClose,
  onDontShowAgain,
}) => {
  const [showDontShowAgain, setShowDontShowAgain] = useState(false);

  useEffect(() => {
    if (failureEvent) {
      // Reset toggle when new failure appears
      setShowDontShowAgain(false);
      // Trap focus in modal
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [failureEvent]);

  if (!failureEvent) return null;

  const failureMode: FailureModeDefinition | undefined = FAILURE_MODES[failureEvent.failureId];
  if (!failureMode) return null;

  const handleClose = () => {
    if (showDontShowAgain && onDontShowAgain) {
      onDontShowAgain(failureEvent.failureId);
    }
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Parse long description into paragraphs
  const descriptionParagraphs = failureMode.longDescription
    .split('\n\n')
    .map(p => p.trim())
    .filter(p => p.length > 0);

  return (
    <div className="failure-modal-overlay" onClick={handleBackdropClick}>
      <div className="failure-modal" role="dialog" aria-modal="true">
        <button 
          className="failure-modal-close" 
          onClick={handleClose}
          aria-label="Close"
        >
          ×
        </button>

        {/* Header */}
        <div className={`failure-modal-header severity-${failureMode.severity}`}>
          <div className="failure-severity-badge">
            {getSeverityIcon(failureMode.severity)} {failureMode.severity.toUpperCase()} FAILURE
          </div>
          <h2 className="failure-title">
            {getSubsystemIcon(failureMode.subsystem)} {failureMode.title}
          </h2>
          <p className="failure-subsystem">
            Subsystem: <strong>{failureMode.subsystem}</strong>
          </p>
        </div>

        {/* Trigger info */}
        <div className="failure-trigger-info">
          <div className="trigger-stat">
            <span className="trigger-label">Failure Point</span>
            <span className="trigger-value">{formatLength(failureEvent.triggeredAtSize)}</span>
          </div>
          <div className="trigger-stat">
            <span className="trigger-label">Scale Factor</span>
            <span className="trigger-value">{failureEvent.triggeredAtScale.toFixed(1)}×</span>
          </div>
          <div className="trigger-stat">
            <span className="trigger-label">Status</span>
            <span className={`trigger-value status-${failureMode.severity}`}>
              {failureMode.severity === 'catastrophic' ? 'IRREVERSIBLE' : 
               failureMode.severity === 'hard' ? 'LATCHED' : 'RECOVERABLE'}
            </span>
          </div>
        </div>

        {/* Short description */}
        <div className="failure-short-desc">
          {failureMode.shortDescription}
        </div>

        {/* Long description */}
        <div className="failure-long-desc">
          {descriptionParagraphs.map((paragraph, idx) => {
            // Check if it's a header (starts with **)
            if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
              return (
                <h3 key={idx} className="failure-section-header">
                  {paragraph.replace(/\*\*/g, '')}
                </h3>
              );
            }
            // Check if it's a list
            if (paragraph.includes('\n-') || paragraph.startsWith('-')) {
              const items = paragraph.split('\n').filter(i => i.trim().startsWith('-'));
              return (
                <ul key={idx} className="failure-list">
                  {items.map((item, i) => (
                    <li key={i}>{item.replace(/^-\s*/, '').replace(/\*\*/g, '')}</li>
                  ))}
                </ul>
              );
            }
            // Check for bold text and inline formatting
            const formattedText = paragraph
              .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
              .replace(/\*([^*]+)\*/g, '<em>$1</em>');
            
            return (
              <p 
                key={idx} 
                className="failure-paragraph"
                dangerouslySetInnerHTML={{ __html: formattedText }}
              />
            );
          })}
        </div>

        {/* Recovery hint */}
        {failureMode.recoveryHint && (
          <div className="failure-recovery-hint">
            <span className="recovery-icon">💡</span>
            <div className="recovery-content">
              <strong>Recovery Possibility:</strong>
              <p>{failureMode.recoveryHint}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="failure-modal-footer">
          {onDontShowAgain && (
            <label className="dont-show-again">
              <input
                type="checkbox"
                checked={showDontShowAgain}
                onChange={(e) => setShowDontShowAgain(e.target.checked)}
              />
              Don't show this failure again
            </label>
          )}
          <button className="failure-modal-button" onClick={handleClose}>
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
