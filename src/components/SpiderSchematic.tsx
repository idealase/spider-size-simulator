import React from 'react';
import { ModelOutput } from '../model';
import './SpiderSchematic.css';

interface SpiderSchematicProps {
  modelOutput: ModelOutput;
  bodyLength: number;
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

export const SpiderSchematic: React.FC<SpiderSchematicProps> = ({ 
  modelOutput, 
  bodyLength 
}) => {
  const { health, proxies } = modelOutput;
  
  // Determine warning states
  const respirationWarning = health.respiration < 50;
  const hydraulicsWarning = health.hydraulics < 50;
  const exoskeletonWarning = health.exoskeleton < 50;
  const locomotionWarning = health.locomotion < 50;
  
  // Calculate visual scale (clamped between 0.3 and 1.5 for display)
  const displayScale = Math.min(1.5, Math.max(0.3, 
    0.3 + (Math.log10(bodyLength) - Math.log10(0.005)) / 
          (Math.log10(3) - Math.log10(0.005)) * 1.2
  ));

  // Exoskeleton crack opacity based on stress
  const crackOpacity = exoskeletonWarning ? Math.min(1, (50 - health.exoskeleton) / 50) : 0;
  
  // Pulse animation speed based on distress level
  const pulseSpeed = Math.max(0.5, 2 - (modelOutput.viabilityIndex / 100) * 1.5);

  return (
    <div className="spider-schematic">
      <h2>🕷️ Spider Visualization</h2>
      
      <div className="schematic-container">
        <svg 
          viewBox="0 0 200 180" 
          className="spider-svg"
          style={{ 
            transform: `scale(${displayScale})`,
            transition: 'transform 0.3s ease-out'
          }}
        >
          {/* Abdomen */}
          <ellipse
            cx="100"
            cy="110"
            rx="35"
            ry="42"
            fill="#3d3d3d"
            stroke={exoskeletonWarning ? '#ef4444' : '#555'}
            strokeWidth={exoskeletonWarning ? 3 : 1.5}
            className={respirationWarning ? 'pulsing' : ''}
            style={{ 
              '--pulse-speed': `${pulseSpeed}s`,
              filter: respirationWarning ? 'drop-shadow(0 0 8px #f38ba8)' : 'none'
            } as React.CSSProperties}
          />
          
          {/* Abdomen glow for respiration */}
          {respirationWarning && (
            <ellipse
              cx="100"
              cy="110"
              rx="30"
              ry="36"
              fill="rgba(243, 139, 168, 0.3)"
              className="glow-overlay"
            />
          )}
          
          {/* Cephalothorax (head) */}
          <ellipse
            cx="100"
            cy="55"
            rx="22"
            ry="18"
            fill="#4a4a4a"
            stroke={exoskeletonWarning ? '#ef4444' : '#666'}
            strokeWidth={exoskeletonWarning ? 2.5 : 1.5}
          />
          
          {/* Eyes */}
          <circle cx="92" cy="50" r="4" fill="#ff6b6b" />
          <circle cx="108" cy="50" r="4" fill="#ff6b6b" />
          <circle cx="95" cy="43" r="2.5" fill="#ff6b6b" />
          <circle cx="105" cy="43" r="2.5" fill="#ff6b6b" />
          
          {/* Legs - with joint highlights */}
          <g 
            stroke={hydraulicsWarning ? '#facc15' : '#3d3d3d'} 
            strokeWidth={hydraulicsWarning ? 4 : 3} 
            fill="none" 
            strokeLinecap="round"
            className={locomotionWarning ? 'legs-warning' : ''}
            style={{
              filter: hydraulicsWarning ? 'drop-shadow(0 0 4px #facc15)' : 'none'
            }}
          >
            {/* Left legs */}
            <path d="M78 50 Q40 35 15 15" />
            <path d="M78 55 Q30 50 8 60" />
            <path d="M80 60 Q35 75 15 100" />
            <path d="M82 68 Q45 90 25 130" />
            
            {/* Right legs */}
            <path d="M122 50 Q160 35 185 15" />
            <path d="M122 55 Q170 50 192 60" />
            <path d="M120 60 Q165 75 185 100" />
            <path d="M118 68 Q155 90 175 130" />
          </g>
          
          {/* Joint warning dots */}
          {hydraulicsWarning && (
            <>
              <circle cx="40" cy="35" r="3" fill="#facc15" className="joint-warning" />
              <circle cx="30" cy="50" r="3" fill="#facc15" className="joint-warning" />
              <circle cx="35" cy="75" r="3" fill="#facc15" className="joint-warning" />
              <circle cx="45" cy="90" r="3" fill="#facc15" className="joint-warning" />
              <circle cx="160" cy="35" r="3" fill="#facc15" className="joint-warning" />
              <circle cx="170" cy="50" r="3" fill="#facc15" className="joint-warning" />
              <circle cx="165" cy="75" r="3" fill="#facc15" className="joint-warning" />
              <circle cx="155" cy="90" r="3" fill="#facc15" className="joint-warning" />
            </>
          )}
          
          {/* Exoskeleton cracks */}
          {exoskeletonWarning && (
            <g 
              stroke="#ef4444" 
              strokeWidth="1.5" 
              fill="none"
              opacity={crackOpacity}
              className="cracks"
            >
              <path d="M90 90 L85 105 L80 95" />
              <path d="M110 100 L118 115 L125 108" />
              <path d="M95 125 L90 140 L100 145" />
              <path d="M75 110 L65 115" />
              <path d="M125 105 L135 100" />
            </g>
          )}
          
          {/* Book lungs indicator */}
          {respirationWarning && (
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
        
        <div className="size-label">
          <span className="size-value">{formatLength(bodyLength)}</span>
          <span className="scale-factor">
            ({modelOutput.scaleFactor.toFixed(1)}× baseline)
          </span>
        </div>
      </div>
      
      <div className="status-indicators">
        <StatusIndicator 
          label="Respiration" 
          health={health.respiration} 
          proxy={proxies.respiration}
        />
        <StatusIndicator 
          label="Hydraulics" 
          health={health.hydraulics} 
          proxy={proxies.hydraulics}
        />
        <StatusIndicator 
          label="Exoskeleton" 
          health={health.exoskeleton} 
          proxy={proxies.exoskeleton}
        />
        <StatusIndicator 
          label="Locomotion" 
          health={health.locomotion} 
          proxy={proxies.locomotion}
        />
      </div>
    </div>
  );
};

interface StatusIndicatorProps {
  label: string;
  health: number;
  proxy: number;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ label, health, proxy }) => {
  const getColor = (value: number) => {
    if (value >= 70) return '#a6e3a1';
    if (value >= 40) return '#facc15';
    return '#f38ba8';
  };

  return (
    <div className="status-indicator">
      <span className="indicator-label">{label}</span>
      <div className="indicator-bar-container">
        <div 
          className="indicator-bar"
          style={{ 
            width: `${health}%`,
            backgroundColor: getColor(health)
          }}
        />
      </div>
      <span className="indicator-value">{health.toFixed(0)}%</span>
      <span className="indicator-proxy">({proxy.toFixed(2)})</span>
    </div>
  );
};
