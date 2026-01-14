import React from 'react';
import { ModelOutput, FailureEvent, FAILURE_MODES } from '../model';
import './SpiderSchematic.css';

interface SpiderSchematicProps {
  modelOutput: ModelOutput;
  bodyLength: number;
  activeFailures?: FailureEvent[];
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

// Get a real-world size reference for context
const getSizeReference = (bodyLength: number): { icon: string; text: string } => {
  // bodyLength is in meters
  const mm = bodyLength * 1000;
  const cm = bodyLength * 100;
  
  if (mm < 3) return { icon: '🦠', text: 'Smaller than a grain of sand' };
  if (mm < 5) return { icon: '🔹', text: 'Size of a sesame seed' };
  if (mm < 8) return { icon: '🍚', text: 'Size of a grain of rice' };
  if (mm < 15) return { icon: '🐜', text: 'Size of a large ant' };
  if (cm < 3) return { icon: '💅', text: 'Size of a fingernail' };
  if (cm < 5) return { icon: '🪙', text: 'Size of a quarter' };
  if (cm < 10) return { icon: '🥚', text: 'Size of a chicken egg' };
  if (cm < 20) return { icon: '🍎', text: 'Size of an apple' };
  if (cm < 40) return { icon: '🏀', text: 'Size of a basketball' };
  if (cm < 60) return { icon: '🪑', text: 'Size of a chair seat' };
  if (bodyLength < 1) return { icon: '🚪', text: 'Size of a door' };
  if (bodyLength < 2) return { icon: '🧍', text: 'Taller than a human' };
  if (bodyLength < 4) return { icon: '🚗', text: 'Size of a small car' };
  if (bodyLength < 8) return { icon: '🚌', text: 'Size of a bus' };
  return { icon: '🏠', text: 'Size of a building!' };
};

export const SpiderSchematic: React.FC<SpiderSchematicProps> = ({ 
  modelOutput, 
  bodyLength,
  activeFailures = [],
}) => {
  const { health, proxies } = modelOutput;
  
  // Determine failure states (more severe than warnings)
  const hasRespirationFailure = activeFailures.some(f => f.failureId === 'OXYGEN_DIFFUSION_FAILURE' && f.isActive);
  const hasHydraulicFailure = activeFailures.some(f => f.failureId === 'HYDRAULIC_EXTENSION_FAILURE' && f.isActive);
  const hasExoskeletonFailure = activeFailures.some(f => f.failureId === 'EXOSKELETON_BUCKLING_FAILURE' && f.isActive);
  const hasLocomotionFailure = activeFailures.some(f => f.failureId === 'LOCOMOTION_ENERGY_FAILURE' && f.isActive);
  
  // Determine warning states (stress but not failed)
  const respirationWarning = health.respiration < 50 && !hasRespirationFailure;
  const hydraulicsWarning = health.hydraulics < 50 && !hasHydraulicFailure;
  const exoskeletonWarning = health.exoskeleton < 50 && !hasExoskeletonFailure;
  const locomotionWarning = health.locomotion < 50 && !hasLocomotionFailure;
  
  // Calculate visual scale (clamped between 0.3 and 1.5 for display)
  const displayScale = Math.min(1.5, Math.max(0.3, 
    0.3 + (Math.log10(bodyLength) - Math.log10(0.005)) / 
          (Math.log10(3) - Math.log10(0.005)) * 1.2
  ));

  // Exoskeleton crack opacity based on stress/failure
  const crackOpacity = hasExoskeletonFailure ? 1 : 
    (exoskeletonWarning ? Math.min(1, (50 - health.exoskeleton) / 50) : 0);
  
  // Pulse animation speed based on distress level
  const pulseSpeed = Math.max(0.5, 2 - (modelOutput.viabilityIndex / 100) * 1.5);

  // Body sag for structural failure
  const bodySag = hasExoskeletonFailure ? 8 : (hasHydraulicFailure ? 4 : 0);

  // Desaturation for respiration failure
  const desaturation = hasRespirationFailure ? 0.6 : 1;

  // Overall failure state
  const anyFailure = hasRespirationFailure || hasHydraulicFailure || hasExoskeletonFailure || hasLocomotionFailure;
  const catastrophicFailure = activeFailures.some(f => {
    const mode = FAILURE_MODES[f.failureId];
    return mode?.severity === 'catastrophic' && f.isActive;
  });

  // Get size reference for context
  const sizeRef = getSizeReference(bodyLength);

  return (
    <div className={`spider-schematic ${anyFailure ? 'has-failure' : ''} ${catastrophicFailure ? 'catastrophic' : ''}`}>
      <h2>🕷️ Spider Visualization</h2>
      
      <div className="schematic-container">
        <svg 
          viewBox="0 0 200 180" 
          className={`spider-svg ${hasHydraulicFailure ? 'collapsed' : ''} ${hasLocomotionFailure ? 'exhausted' : ''}`}
          style={{ 
            transform: `scale(${displayScale})`,
            transition: 'transform 0.3s ease-out',
            filter: `saturate(${desaturation})`,
          }}
        >
          {/* Failure state overlay */}
          {catastrophicFailure && (
            <rect
              x="0"
              y="0"
              width="200"
              height="180"
              fill="rgba(220, 38, 38, 0.1)"
              className="failure-overlay"
            />
          )}

          {/* Abdomen - with failure animations */}
          <ellipse
            cx="100"
            cy={110 + bodySag}
            rx={hasExoskeletonFailure ? 38 : 35}
            ry={hasExoskeletonFailure ? 38 : 42}
            fill={hasRespirationFailure ? '#2a2a2a' : '#3d3d3d'}
            stroke={hasExoskeletonFailure ? '#dc2626' : (exoskeletonWarning ? '#ef4444' : '#555')}
            strokeWidth={hasExoskeletonFailure ? 4 : (exoskeletonWarning ? 3 : 1.5)}
            className={`
              ${hasRespirationFailure ? 'respiration-failed' : (respirationWarning ? 'pulsing' : '')}
              ${hasExoskeletonFailure ? 'structure-failed' : ''}
            `}
            style={{ 
              '--pulse-speed': `${pulseSpeed}s`,
              filter: hasRespirationFailure 
                ? 'drop-shadow(0 0 12px #dc2626)' 
                : (respirationWarning ? 'drop-shadow(0 0 8px #f38ba8)' : 'none')
            } as React.CSSProperties}
          />
          
          {/* Abdomen glow/warning */}
          {(respirationWarning || hasRespirationFailure) && (
            <ellipse
              cx="100"
              cy={110 + bodySag}
              rx="30"
              ry="36"
              fill={hasRespirationFailure ? 'rgba(220, 38, 38, 0.4)' : 'rgba(243, 139, 168, 0.3)'}
              className={hasRespirationFailure ? 'failure-glow' : 'glow-overlay'}
            />
          )}

          {/* Hypoxia indicator for respiration failure */}
          {hasRespirationFailure && (
            <g className="hypoxia-indicator">
              <circle cx="100" cy={100 + bodySag} r="15" fill="none" stroke="#dc2626" strokeWidth="2" strokeDasharray="4,2" className="hypoxia-ring" />
              <text x="100" y={105 + bodySag} textAnchor="middle" fontSize="8" fill="#fca5a5" className="hypoxia-text">HYPOXIA</text>
            </g>
          )}
          
          {/* Cephalothorax (head) - with failure states */}
          <ellipse
            cx="100"
            cy={55 + (bodySag / 2)}
            rx={hasExoskeletonFailure ? 24 : 22}
            ry={hasExoskeletonFailure ? 16 : 18}
            fill={hasRespirationFailure ? '#3a3a3a' : '#4a4a4a'}
            stroke={hasExoskeletonFailure ? '#dc2626' : (exoskeletonWarning ? '#ef4444' : '#666')}
            strokeWidth={hasExoskeletonFailure ? 3 : (exoskeletonWarning ? 2.5 : 1.5)}
          />
          
          {/* Eyes - dim when failing */}
          <circle cx="92" cy={50 + (bodySag / 2)} r="4" fill={hasRespirationFailure ? '#993333' : '#ff6b6b'} className={hasRespirationFailure ? 'eyes-dimmed' : ''} />
          <circle cx="108" cy={50 + (bodySag / 2)} r="4" fill={hasRespirationFailure ? '#993333' : '#ff6b6b'} className={hasRespirationFailure ? 'eyes-dimmed' : ''} />
          <circle cx="95" cy={43 + (bodySag / 2)} r="2.5" fill={hasRespirationFailure ? '#993333' : '#ff6b6b'} />
          <circle cx="105" cy={43 + (bodySag / 2)} r="2.5" fill={hasRespirationFailure ? '#993333' : '#ff6b6b'} />
          
          {/* Legs - with hydraulic failure collapse animation */}
          <g 
            stroke={hasHydraulicFailure ? '#b45309' : (hydraulicsWarning ? '#facc15' : '#3d3d3d')} 
            strokeWidth={hasHydraulicFailure ? 5 : (hydraulicsWarning ? 4 : 3)} 
            fill="none" 
            strokeLinecap="round"
            className={`
              legs
              ${hasHydraulicFailure ? 'legs-collapsed' : ''}
              ${hasLocomotionFailure ? 'legs-exhausted' : ''}
              ${locomotionWarning && !hasLocomotionFailure ? 'legs-warning' : ''}
            `}
            style={{
              filter: hasHydraulicFailure 
                ? 'drop-shadow(0 0 6px #b45309)' 
                : (hydraulicsWarning ? 'drop-shadow(0 0 4px #facc15)' : 'none'),
            }}
          >
            {/* Left legs - buckled in failure state */}
            <path d={hasHydraulicFailure 
              ? "M78 50 Q50 55 35 70" 
              : "M78 50 Q40 35 15 15"
            } className="leg leg-1" />
            <path d={hasHydraulicFailure 
              ? "M78 55 Q45 65 25 85" 
              : "M78 55 Q30 50 8 60"
            } className="leg leg-2" />
            <path d={hasHydraulicFailure 
              ? "M80 60 Q50 85 35 115" 
              : "M80 60 Q35 75 15 100"
            } className="leg leg-3" />
            <path d={hasHydraulicFailure 
              ? "M82 68 Q55 100 45 140" 
              : "M82 68 Q45 90 25 130"
            } className="leg leg-4" />
            
            {/* Right legs - buckled in failure state */}
            <path d={hasHydraulicFailure 
              ? "M122 50 Q150 55 165 70" 
              : "M122 50 Q160 35 185 15"
            } className="leg leg-5" />
            <path d={hasHydraulicFailure 
              ? "M122 55 Q155 65 175 85" 
              : "M122 55 Q170 50 192 60"
            } className="leg leg-6" />
            <path d={hasHydraulicFailure 
              ? "M120 60 Q150 85 165 115" 
              : "M120 60 Q165 75 185 100"
            } className="leg leg-7" />
            <path d={hasHydraulicFailure 
              ? "M118 68 Q145 100 155 140" 
              : "M118 68 Q155 90 175 130"
            } className="leg leg-8" />
          </g>
          
          {/* Joint warning/failure dots */}
          {(hydraulicsWarning || hasHydraulicFailure) && (
            <g className={hasHydraulicFailure ? 'joints-failed' : 'joints-warning'}>
              <circle cx={hasHydraulicFailure ? 50 : 40} cy={hasHydraulicFailure ? 55 : 35} r={hasHydraulicFailure ? 5 : 3} fill={hasHydraulicFailure ? '#dc2626' : '#facc15'} className="joint-warning" />
              <circle cx={hasHydraulicFailure ? 40 : 30} cy={hasHydraulicFailure ? 70 : 50} r={hasHydraulicFailure ? 5 : 3} fill={hasHydraulicFailure ? '#dc2626' : '#facc15'} className="joint-warning" />
              <circle cx={hasHydraulicFailure ? 45 : 35} cy={hasHydraulicFailure ? 95 : 75} r={hasHydraulicFailure ? 5 : 3} fill={hasHydraulicFailure ? '#dc2626' : '#facc15'} className="joint-warning" />
              <circle cx={hasHydraulicFailure ? 50 : 45} cy={hasHydraulicFailure ? 115 : 90} r={hasHydraulicFailure ? 5 : 3} fill={hasHydraulicFailure ? '#dc2626' : '#facc15'} className="joint-warning" />
              <circle cx={hasHydraulicFailure ? 150 : 160} cy={hasHydraulicFailure ? 55 : 35} r={hasHydraulicFailure ? 5 : 3} fill={hasHydraulicFailure ? '#dc2626' : '#facc15'} className="joint-warning" />
              <circle cx={hasHydraulicFailure ? 160 : 170} cy={hasHydraulicFailure ? 70 : 50} r={hasHydraulicFailure ? 5 : 3} fill={hasHydraulicFailure ? '#dc2626' : '#facc15'} className="joint-warning" />
              <circle cx={hasHydraulicFailure ? 155 : 165} cy={hasHydraulicFailure ? 95 : 75} r={hasHydraulicFailure ? 5 : 3} fill={hasHydraulicFailure ? '#dc2626' : '#facc15'} className="joint-warning" />
              <circle cx={hasHydraulicFailure ? 150 : 155} cy={hasHydraulicFailure ? 115 : 90} r={hasHydraulicFailure ? 5 : 3} fill={hasHydraulicFailure ? '#dc2626' : '#facc15'} className="joint-warning" />
            </g>
          )}
          
          {/* Exoskeleton cracks - more severe in failure */}
          {(exoskeletonWarning || hasExoskeletonFailure) && (
            <g 
              stroke={hasExoskeletonFailure ? '#dc2626' : '#ef4444'} 
              strokeWidth={hasExoskeletonFailure ? 2.5 : 1.5} 
              fill="none"
              opacity={crackOpacity}
              className={hasExoskeletonFailure ? 'cracks-severe' : 'cracks'}
            >
              <path d={`M90 ${90 + bodySag} L85 ${105 + bodySag} L80 ${95 + bodySag}`} />
              <path d={`M110 ${100 + bodySag} L118 ${115 + bodySag} L125 ${108 + bodySag}`} />
              <path d={`M95 ${125 + bodySag} L90 ${140 + bodySag} L100 ${145 + bodySag}`} />
              <path d={`M75 ${110 + bodySag} L65 ${115 + bodySag}`} />
              <path d={`M125 ${105 + bodySag} L135 ${100 + bodySag}`} />
              {hasExoskeletonFailure && (
                <>
                  {/* Additional severe cracks */}
                  <path d={`M85 ${70 + bodySag} L75 ${85 + bodySag} L70 ${75 + bodySag}`} />
                  <path d={`M115 ${75 + bodySag} L130 ${85 + bodySag}`} />
                  <path d={`M100 ${135 + bodySag} L95 ${155 + bodySag}`} />
                  <path d={`M105 ${130 + bodySag} L115 ${150 + bodySag}`} />
                </>
              )}
            </g>
          )}
          
          {/* Failure labels */}
          {hasRespirationFailure && (
            <text 
              x="100" 
              y={130 + bodySag} 
              textAnchor="middle" 
              fontSize="9" 
              fill="#fca5a5"
              className="failure-label"
            >
              🫁 RESPIRATORY FAILURE
            </text>
          )}
          
          {hasHydraulicFailure && (
            <text 
              x="100" 
              y="168" 
              textAnchor="middle" 
              fontSize="9" 
              fill="#fdba74"
              className="failure-label"
            >
              🦵 HYDRAULIC FAILURE
            </text>
          )}

          {/* Locomotion failure - energy depleted visualization */}
          {hasLocomotionFailure && (
            <g className="locomotion-failure-indicator">
              <text x="100" y="12" textAnchor="middle" fontSize="8" fill="#93c5fd" className="energy-text">
                ⚡ ENERGY DEPLETED
              </text>
              {/* Exhaustion tremor lines */}
              <path d="M30 160 L35 155 L40 160" stroke="#60a5fa" strokeWidth="1" fill="none" className="tremor-line" />
              <path d="M160 160 L165 155 L170 160" stroke="#60a5fa" strokeWidth="1" fill="none" className="tremor-line" />
            </g>
          )}
          
          {/* Warning text for stress states */}
          {respirationWarning && !hasRespirationFailure && (
            <text 
              x="100" 
              y="130" 
              textAnchor="middle" 
              fontSize="10" 
              fill="#f38ba8"
              className="warning-text"
            >
              🫁 O₂ ↓
            </text>
          )}
        </svg>
        
        <div className={`size-label ${anyFailure ? 'failure-state' : ''}`}>
          <span className="size-value">{formatLength(bodyLength)}</span>
          <span className="scale-factor">
            ({modelOutput.scaleFactor.toFixed(1)}× baseline)
          </span>
          {anyFailure && (
            <span className="failure-badge">
              {catastrophicFailure ? '💀 CATASTROPHIC' : '⚠️ SYSTEM FAILURE'}
            </span>
          )}
        </div>
        
        {/* Size reference comparison */}
        <div className="size-reference">
          <span className="size-reference-icon">{sizeRef.icon}</span>
          <span className="size-reference-text">{sizeRef.text}</span>
        </div>
      </div>
      
      <div className="status-indicators">
        <StatusIndicator 
          label="Respiration" 
          health={health.respiration} 
          proxy={proxies.respiration}
          failed={hasRespirationFailure}
        />
        <StatusIndicator 
          label="Hydraulics" 
          health={health.hydraulics} 
          proxy={proxies.hydraulics}
          failed={hasHydraulicFailure}
        />
        <StatusIndicator 
          label="Exoskeleton" 
          health={health.exoskeleton} 
          proxy={proxies.exoskeleton}
          failed={hasExoskeletonFailure}
        />
        <StatusIndicator 
          label="Locomotion" 
          health={health.locomotion} 
          proxy={proxies.locomotion}
          failed={hasLocomotionFailure}
        />
      </div>
    </div>
  );
};

interface StatusIndicatorProps {
  label: string;
  health: number;
  proxy: number;
  failed?: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ label, health, proxy, failed = false }) => {
  const getColor = (value: number, isFailed: boolean) => {
    if (isFailed) return '#dc2626';
    if (value >= 70) return '#a6e3a1';
    if (value >= 40) return '#facc15';
    return '#f38ba8';
  };

  return (
    <div className={`status-indicator ${failed ? 'failed' : ''}`}>
      <span className="indicator-label">
        {failed && <span className="failed-icon">💀</span>}
        {label}
      </span>
      <div className="indicator-bar-container">
        <div 
          className={`indicator-bar ${failed ? 'failed-bar' : ''}`}
          style={{ 
            width: `${health}%`,
            backgroundColor: getColor(health, failed)
          }}
        />
        {failed && <div className="failure-stripe" />}
      </div>
      <span className={`indicator-value ${failed ? 'failed-value' : ''}`}>{health.toFixed(0)}%</span>
      <span className="indicator-proxy">({proxy.toFixed(2)})</span>
    </div>
  );
};
