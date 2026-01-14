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

const formatMass = (kg: number): string => {
  if (kg < 0.001) {
    return `${(kg * 1000000).toFixed(1)} mg`;
  } else if (kg < 1) {
    return `${(kg * 1000).toFixed(1)} g`;
  } else if (kg < 1000) {
    return `${kg.toFixed(1)} kg`;
  } else {
    return `${(kg / 1000).toFixed(1)} tonnes`;
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

// Physiological facts by subsystem
const PHYSIOLOGY_FACTS: Record<string, { title: string; facts: string[] }> = {
  respiration: {
    title: 'Book Lung Anatomy',
    facts: [
      'Spider book lungs contain 15-20 leaf-like plates called lamellae',
      'Each lamella is only 0.2-0.3 μm thick—thinner than a human hair',
      'Oxygen diffuses directly into hemolymph without hemoglobin binding',
      'Maximum diffusion distance in real spiders: ~1mm (any further = hypoxia)',
      'Carboniferous insects grew huge because O₂ was 35% (vs 21% today)',
    ],
  },
  hydraulics: {
    title: 'Hydraulic System Anatomy',
    facts: [
      'Spiders have no extensor muscles in their legs—only flexors',
      'Leg extension requires 60-100 mmHg hemolymph pressure',
      'The prosoma (cephalothorax) acts as a hydraulic pump',
      'Dead spiders curl up because hydraulic pressure is lost',
      'Some jumping spiders generate 8× their body weight in leg force',
    ],
  },
  exoskeleton: {
    title: 'Cuticle Structure',
    facts: [
      'Spider cuticle is made of chitin fibers in a protein matrix',
      'Cuticle thickness: typically 1-10% of body segment diameter',
      'Tensile strength: ~100 MPa (similar to aluminum)',
      'Must be shed (molted) for growth—extremely vulnerable during',
      'Largest known spider (Goliath birdeater): 30cm leg span, 175g',
    ],
  },
  locomotion: {
    title: 'Movement Energetics',
    facts: [
      'Spiders use ~10× less energy per step than same-sized mammals',
      'Metabolic rate scales as mass^0.75 (Kleiber\'s Law)',
      'Maximum sprint speed: ~0.5 m/s for large tarantulas',
      'Jumping spiders can leap 50× their body length',
      'Energy cost of locomotion rises exponentially with body mass',
    ],
  },
};

// Size comparisons
const getSizeComparison = (meters: number): string => {
  if (meters < 0.01) return 'Size of a grain of rice';
  if (meters < 0.03) return 'Size of a thumbnail';
  if (meters < 0.1) return 'Size of a mouse';
  if (meters < 0.3) return 'Size of a house cat';
  if (meters < 0.5) return 'Size of a medium dog';
  if (meters < 1.0) return 'Size of a German Shepherd';
  if (meters < 1.5) return 'Size of a large wolf';
  if (meters < 2.0) return 'Size of a lion';
  if (meters < 2.5) return 'Size of a horse';
  return 'Size of an elephant 🐘';
};

// Estimated mass (assuming spider density ~1.1 g/cm³ and ~40% of bounding box)
const estimateMass = (bodyLength: number): number => {
  const volume = Math.pow(bodyLength, 3) * 0.4; // Approximate body volume
  const density = 1100; // kg/m³
  return volume * density;
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

  const physiologyFacts = PHYSIOLOGY_FACTS[failureMode.subsystem];
  const estimatedMass = estimateMass(failureEvent.triggeredAtSize);
  const sizeComparison = getSizeComparison(failureEvent.triggeredAtSize);

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
            <span className="trigger-label">Est. Mass</span>
            <span className="trigger-value">{formatMass(estimatedMass)}</span>
          </div>
          <div className="trigger-stat">
            <span className="trigger-label">Status</span>
            <span className={`trigger-value status-${failureMode.severity}`}>
              {failureMode.severity === 'catastrophic' ? 'IRREVERSIBLE' : 
               failureMode.severity === 'hard' ? 'LATCHED' : 'RECOVERABLE'}
            </span>
          </div>
        </div>

        {/* Size comparison */}
        <div className="size-comparison">
          <span className="comparison-icon">📏</span>
          <span className="comparison-text">{sizeComparison}</span>
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

        {/* Physiological facts */}
        {physiologyFacts && (
          <div className="physiology-facts">
            <h4>🔬 {physiologyFacts.title}</h4>
            <ul>
              {physiologyFacts.facts.map((fact, idx) => (
                <li key={idx}>{fact}</li>
              ))}
            </ul>
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
