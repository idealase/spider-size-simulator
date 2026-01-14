/**
 * Model Configuration for Spider Size Simulator
 * 
 * All constants can be easily tuned here to adjust the scaling behavior.
 */

export type ModelMode = 'simple' | 'extended';

export interface SpeciesPreset {
  name: string;
  baselineLength: number; // meters
  description: string;
}

export const SPECIES_PRESETS: SpeciesPreset[] = [
  {
    name: 'House Spider',
    baselineLength: 0.008, // 8mm body length
    description: 'Common house spider (Parasteatoda tepidariorum)',
  },
  {
    name: 'Tarantula',
    baselineLength: 0.05, // 50mm body length
    description: 'Typical tarantula (Theraphosidae)',
  },
  {
    name: 'Jumping Spider',
    baselineLength: 0.005, // 5mm body length
    description: 'Small jumping spider (Salticidae)',
  },
];

// Size slider range
export const SIZE_RANGE = {
  min: 0.005, // 5mm
  max: 3.0,   // 3m (elephant-ish)
};

// Environmental defaults
export const ENV_DEFAULTS = {
  o2Fraction: 0.21,
  gravityMultiplier: 1.0,
};

// Environmental ranges
export const ENV_RANGES = {
  o2Fraction: { min: 0.10, max: 0.35 },
  gravityMultiplier: { min: 0.1, max: 2.0 },
};

// Scaling exponents and coefficients
export const SCALING_PARAMS = {
  // Respiration
  respirationDiffusionK: 0.15, // Extended mode diffusion distance factor
  
  // Hydraulic actuation
  hydraulicAlpha: 0.65, // Weight exponent
  hydraulicBetaSimple: 0,
  hydraulicBetaExtended: 0.3,
  
  // Exoskeleton structural
  exoskeletonPSimple: 1.0,
  exoskeletonPExtended: 1.3,
  
  // Locomotion
  locomotionGammaSimple: 0.85,
  locomotionGammaExtended: 1.1,
};

// Health score mapping parameters
export const HEALTH_PARAMS = {
  // Simple mode: piecewise linear
  failureThreshold: 0.3,
  
  // Extended mode: sigmoid
  sigmoidCritical: 0.6,
  sigmoidSteepness: 8,
  
  // Clamp proxy values
  proxyMin: 0,
  proxyMax: 1.2,
};

// Failure mode thresholds
export const FAILURE_THRESHOLDS = {
  respiration: 0.35,
  hydraulics: 0.35,
  exoskeleton: 0.35,
  locomotion: 0.35,
};

// Viability index weights (must sum to 1)
export const VIABILITY_WEIGHTS = {
  respiration: 0.35,
  exoskeleton: 0.30,
  hydraulics: 0.20,
  locomotion: 0.15,
};

// Labels for failure modes
export const FAILURE_LABELS = {
  respiration: '🫁 Oxygen diffusion fails — book lungs cannot supply tissues',
  hydraulics: '🦵 Hydraulic pressure insufficient — legs cannot extend properly',
  exoskeleton: '🦴 Cuticle buckling risk HIGH — structural collapse imminent',
  locomotion: '🚶 Locomotion energy deficit — movement becomes impossible',
};

// Viability index thresholds and labels
export const VIABILITY_THRESHOLDS = [
  { min: 80, max: 101, label: 'Viable-ish', color: '#4ade80', emoji: '✅' },
  { min: 50, max: 80, label: 'Strained', color: '#facc15', emoji: '⚠️' },
  { min: 20, max: 50, label: 'Nonviable', color: '#fb923c', emoji: '🔶' },
  { min: -1, max: 20, label: 'Catastrophic', color: '#ef4444', emoji: '💀' },
];

export const getViabilityStatus = (viability: number) => {
  // Handle edge cases
  if (typeof viability !== 'number' || isNaN(viability)) {
    return VIABILITY_THRESHOLDS[0]; // Default to viable if something went wrong
  }
  
  for (const threshold of VIABILITY_THRESHOLDS) {
    if (viability >= threshold.min && viability < threshold.max) {
      return threshold;
    }
  }
  // Fallback: return based on actual value
  if (viability >= 80) return VIABILITY_THRESHOLDS[0];
  if (viability >= 50) return VIABILITY_THRESHOLDS[1];
  if (viability >= 20) return VIABILITY_THRESHOLDS[2];
  return VIABILITY_THRESHOLDS[3];
};
