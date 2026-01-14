/**
 * Core model calculations for Spider Size Simulator
 * 
 * Pure functions that compute scaling proxies, health scores, and viability.
 */

import {
  ModelMode,
  SCALING_PARAMS,
  HEALTH_PARAMS,
  FAILURE_THRESHOLDS,
  VIABILITY_WEIGHTS,
  FAILURE_LABELS,
} from './modelConfig';

export interface ModelInput {
  bodyLength: number;      // Current body length in meters
  baselineLength: number;  // Baseline body length for selected species
  o2Fraction: number;      // Atmospheric O2 fraction (default 0.21)
  gravityMultiplier: number; // Gravity multiplier (default 1.0)
  mode: ModelMode;         // 'simple' or 'extended'
}

export interface ScalingProxies {
  respiration: number;
  hydraulics: number;
  exoskeleton: number;
  locomotion: number;
}

export interface HealthScores {
  respiration: number;
  hydraulics: number;
  exoskeleton: number;
  locomotion: number;
}

export interface FailureMode {
  key: string;
  label: string;
  active: boolean;
}

export interface ModelOutput {
  scaleFactor: number;
  mass: number;           // Relative mass (s^3)
  surfaceArea: number;    // Relative surface area (s^2)
  weightFactor: number;   // s^3 * gMult
  proxies: ScalingProxies;
  health: HealthScores;
  failureModes: FailureMode[];
  viabilityIndex: number;
}

/**
 * Clamp a value between min and max
 */
const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Sigmoid function for extended mode health mapping
 */
const sigmoid = (x: number, steepness: number, critical: number): number => {
  return 1 / (1 + Math.exp(-steepness * (x - critical)));
};

/**
 * Calculate respiration capacity proxy
 * Rcap ~ (O2frac/0.21) * (1/s)
 * Extended: multiply by 1/(1 + k*(s-1))
 */
const calcRespirationProxy = (
  scaleFactor: number,
  o2Fraction: number,
  mode: ModelMode
): number => {
  const baseCapacity = (o2Fraction / 0.21) * (1 / scaleFactor);
  
  if (mode === 'extended') {
    const diffusionFactor = 1 / (1 + SCALING_PARAMS.respirationDiffusionK * (scaleFactor - 1));
    return baseCapacity * diffusionFactor;
  }
  
  return baseCapacity;
};

/**
 * Calculate hydraulic actuation proxy
 * Hcap ~ (s^beta) / (W^alpha)
 */
const calcHydraulicsProxy = (
  scaleFactor: number,
  weightFactor: number,
  mode: ModelMode
): number => {
  const beta = mode === 'simple' 
    ? SCALING_PARAMS.hydraulicBetaSimple 
    : SCALING_PARAMS.hydraulicBetaExtended;
  const alpha = SCALING_PARAMS.hydraulicAlpha;
  
  return Math.pow(scaleFactor, beta) / Math.pow(weightFactor, alpha);
};

/**
 * Calculate exoskeleton structural proxy
 * Ecap = 1 / (s^p * gMult)
 */
const calcExoskeletonProxy = (
  scaleFactor: number,
  gravityMultiplier: number,
  mode: ModelMode
): number => {
  const p = mode === 'simple'
    ? SCALING_PARAMS.exoskeletonPSimple
    : SCALING_PARAMS.exoskeletonPExtended;
  
  return 1 / (Math.pow(scaleFactor, p) * gravityMultiplier);
};

/**
 * Calculate locomotion proxy
 * Lcap = 1 / (s^gamma * gMult)
 */
const calcLocomotionProxy = (
  scaleFactor: number,
  gravityMultiplier: number,
  mode: ModelMode
): number => {
  const gamma = mode === 'simple'
    ? SCALING_PARAMS.locomotionGammaSimple
    : SCALING_PARAMS.locomotionGammaExtended;
  
  return 1 / (Math.pow(scaleFactor, gamma) * gravityMultiplier);
};

/**
 * Convert proxy value to health score (0-100)
 */
const proxyToHealth = (proxy: number, mode: ModelMode): number => {
  const clampedProxy = clamp(proxy, HEALTH_PARAMS.proxyMin, HEALTH_PARAMS.proxyMax);
  
  if (mode === 'simple') {
    // Piecewise linear
    const { failureThreshold } = HEALTH_PARAMS;
    const normalized = (clampedProxy - failureThreshold) / (1 - failureThreshold);
    return 100 * clamp(normalized, 0, 1);
  } else {
    // Sigmoid for extended mode
    const { sigmoidCritical, sigmoidSteepness } = HEALTH_PARAMS;
    return 100 * sigmoid(clampedProxy, sigmoidSteepness, sigmoidCritical);
  }
};

/**
 * Calculate viability index using weighted geometric mean
 * v = exp( Σ wi * ln(health_i/100 + eps) )
 */
const calcViabilityIndex = (health: HealthScores): number => {
  const eps = 1e-6;
  const weights = VIABILITY_WEIGHTS;
  
  const logSum = 
    weights.respiration * Math.log(health.respiration / 100 + eps) +
    weights.exoskeleton * Math.log(health.exoskeleton / 100 + eps) +
    weights.hydraulics * Math.log(health.hydraulics / 100 + eps) +
    weights.locomotion * Math.log(health.locomotion / 100 + eps);
  
  return 100 * Math.exp(logSum);
};

/**
 * Determine active failure modes
 */
const getFailureModes = (proxies: ScalingProxies): FailureMode[] => {
  return [
    {
      key: 'respiration',
      label: FAILURE_LABELS.respiration,
      active: proxies.respiration < FAILURE_THRESHOLDS.respiration,
    },
    {
      key: 'hydraulics',
      label: FAILURE_LABELS.hydraulics,
      active: proxies.hydraulics < FAILURE_THRESHOLDS.hydraulics,
    },
    {
      key: 'exoskeleton',
      label: FAILURE_LABELS.exoskeleton,
      active: proxies.exoskeleton < FAILURE_THRESHOLDS.exoskeleton,
    },
    {
      key: 'locomotion',
      label: FAILURE_LABELS.locomotion,
      active: proxies.locomotion < FAILURE_THRESHOLDS.locomotion,
    },
  ];
};

/**
 * Main model computation function
 */
export const computeModel = (input: ModelInput): ModelOutput => {
  const { bodyLength, baselineLength, o2Fraction, gravityMultiplier, mode } = input;
  
  // Scale factor
  const scaleFactor = bodyLength / baselineLength;
  
  // Derived quantities
  const mass = Math.pow(scaleFactor, 3);
  const surfaceArea = Math.pow(scaleFactor, 2);
  const weightFactor = mass * gravityMultiplier;
  
  // Calculate proxies
  const proxies: ScalingProxies = {
    respiration: calcRespirationProxy(scaleFactor, o2Fraction, mode),
    hydraulics: calcHydraulicsProxy(scaleFactor, weightFactor, mode),
    exoskeleton: calcExoskeletonProxy(scaleFactor, gravityMultiplier, mode),
    locomotion: calcLocomotionProxy(scaleFactor, gravityMultiplier, mode),
  };
  
  // Convert to health scores
  const health: HealthScores = {
    respiration: proxyToHealth(proxies.respiration, mode),
    hydraulics: proxyToHealth(proxies.hydraulics, mode),
    exoskeleton: proxyToHealth(proxies.exoskeleton, mode),
    locomotion: proxyToHealth(proxies.locomotion, mode),
  };
  
  // Get failure modes
  const failureModes = getFailureModes(proxies);
  
  // Calculate viability index
  const viabilityIndex = calcViabilityIndex(health);
  
  return {
    scaleFactor,
    mass,
    surfaceArea,
    weightFactor,
    proxies,
    health,
    failureModes,
    viabilityIndex,
  };
};

/**
 * Generate log-spaced size array for chart plotting
 */
export const generateSizeArray = (
  min: number,
  max: number,
  count: number = 100
): number[] => {
  const logMin = Math.log10(min);
  const logMax = Math.log10(max);
  const step = (logMax - logMin) / (count - 1);
  
  return Array.from({ length: count }, (_, i) => 
    Math.pow(10, logMin + i * step)
  );
};

/**
 * Compute model outputs for an array of sizes (for charts)
 */
export const computeModelArray = (
  sizes: number[],
  baselineLength: number,
  o2Fraction: number,
  gravityMultiplier: number,
  mode: ModelMode
): ModelOutput[] => {
  return sizes.map(size => computeModel({
    bodyLength: size,
    baselineLength,
    o2Fraction,
    gravityMultiplier,
    mode,
  }));
};
