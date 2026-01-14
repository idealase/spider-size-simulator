/**
 * Failure Mode Definitions for Spider Size Simulator
 * 
 * Failure modes are first-class entities representing discrete physiological
 * breakdown events that occur when scaling constraints exceed viable limits.
 */

import { ModelOutput, ScalingProxies, computeModelArray, generateSizeArray } from './calculations';
import { SIZE_RANGE, ModelMode } from './modelConfig';

export type FailureSeverity = 'soft' | 'hard' | 'catastrophic';
export type Subsystem = 'respiration' | 'hydraulics' | 'exoskeleton' | 'locomotion';

export interface VisualCueConfig {
  animation: string;
  highlightColor: string;
  glowIntensity: number;
  additionalEffects?: string[];
}

export interface FailureModeDefinition {
  id: string;
  subsystem: Subsystem;
  severity: FailureSeverity;
  title: string;
  shortDescription: string;
  longDescription: string;
  visualCueConfig: VisualCueConfig;
  recoveryHint: string | null;
  proxyThreshold: number;
  stressThreshold: number;
}

export interface FailureEvent {
  failureId: string;
  triggeredAtSize: number;
  triggeredAtScale: number;
  timestamp: number;
  isActive: boolean;
  isResolved: boolean;
  isIrreversible: boolean;
}

export interface FailureState {
  activeFailures: FailureEvent[];
  newlyTriggeredFailures: FailureEvent[];
  failureHistory: FailureEvent[];
}

/**
 * All defined failure modes in the system
 */
export const FAILURE_MODES: Record<string, FailureModeDefinition> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // RESPIRATION FAILURES
  // ═══════════════════════════════════════════════════════════════════════════
  
  OXYGEN_DIFFUSION_FAILURE: {
    id: 'OXYGEN_DIFFUSION_FAILURE',
    subsystem: 'respiration',
    severity: 'catastrophic',
    title: 'Oxygen Diffusion Collapse',
    shortDescription: 'Book lungs cannot deliver oxygen to tissues. The spider suffocates from the inside out.',
    longDescription: `
**The Physics of Failure**

Spider respiration relies on *passive diffusion* through book lungs—thin, stacked plates that maximize surface area for gas exchange. This works brilliantly at small scales, but diffusion obeys an unforgiving law:

**Diffusion time scales with the square of distance.**

As our spider grows, two things happen simultaneously:
1. **Body volume (and oxygen demand) increases as L³**
2. **Lung surface area increases only as L²**

The surface-to-volume ratio collapses. Oxygen must travel further through increasingly inadequate tissue. At this size, diffusion simply cannot deliver oxygen fast enough to meet metabolic demands.

**The Result**

Internal tissues become hypoxic. Muscles fail. Neurons misfire. The spider's body becomes a suffocating prison of its own mass.

**Why This Is Unavoidable**

Real large animals solve this with *active* circulatory systems—hearts, blood vessels, hemoglobin. Spiders have hemolymph (blood equivalent), but it circulates passively. There is no "heart upgrade" available.

This is why insects were enormous in the Carboniferous period (when O₂ was ~35%) and shrunk as oxygen levels dropped. The math simply doesn't permit large diffusion-breathing organisms at current atmospheric oxygen levels.
    `.trim(),
    visualCueConfig: {
      animation: 'respiratoryCollapse',
      highlightColor: '#dc2626',
      glowIntensity: 1.0,
      additionalEffects: ['abdomenPulseStop', 'colorDesaturation', 'hypoxiaOverlay'],
    },
    recoveryHint: 'Increase atmospheric O₂ above 30%, or reduce body size below the diffusion limit.',
    proxyThreshold: 0.35,
    stressThreshold: 0.6,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HYDRAULIC FAILURES
  // ═══════════════════════════════════════════════════════════════════════════

  HYDRAULIC_EXTENSION_FAILURE: {
    id: 'HYDRAULIC_EXTENSION_FAILURE',
    subsystem: 'hydraulics',
    severity: 'hard',
    title: 'Hydraulic Leg Extension Failure',
    shortDescription: 'Internal pressure cannot overcome leg weight. The spider can no longer walk.',
    longDescription: `
**The Physics of Failure**

Unlike insects and vertebrates, spiders don't use muscles to *extend* their legs. They use **hydraulic pressure**.

Here's how it works:
1. Spider contracts muscles in the prosoma (front body segment)
2. This increases hemolymph (blood) pressure
3. Pressurized fluid forces legs to extend
4. Muscles in the legs only handle *flexion* (pulling in)

This is elegant and efficient at spider scale. But hydraulics have a scaling problem.

**The Pressure Equation**

To extend a leg, internal pressure must overcome:
- **Leg mass** (scales as L³)
- **Gravity** (constant, unless you're on the Moon)
- **Joint resistance** (scales roughly as L²)

The pressure the spider can generate scales poorly:
- **Prosoma muscle force** ∝ L² (cross-sectional area)
- **Prosoma volume** ∝ L³

Net effect: **Pressure generation actually *decreases* relative to demand.**

**The Result**

At this size, the spider's legs collapse under their own weight. The prosoma muscles contract, but the hemolymph pressure generated is nowhere near sufficient to lift legs that now weigh kilograms, not milligrams.

The spider is trapped—legs folded, unable to extend, unable to move.

**Why This Matters**

This is why there are no large hydraulic-locomotion animals. The physics simply don't permit it. Large animals universally use muscle-driven skeletal systems.
    `.trim(),
    visualCueConfig: {
      animation: 'hydraulicCollapse',
      highlightColor: '#eab308',
      glowIntensity: 0.9,
      additionalEffects: ['legBuckle', 'bodyDrop', 'jointStressMarkers'],
    },
    recoveryHint: 'Reduce gravity below 0.3g, or reduce body size significantly.',
    proxyThreshold: 0.35,
    stressThreshold: 0.6,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EXOSKELETON FAILURES
  // ═══════════════════════════════════════════════════════════════════════════

  EXOSKELETON_BUCKLING_FAILURE: {
    id: 'EXOSKELETON_BUCKLING_FAILURE',
    subsystem: 'exoskeleton',
    severity: 'catastrophic',
    title: 'Exoskeleton Structural Collapse',
    shortDescription: 'The cuticle cannot support body mass. Catastrophic buckling imminent.',
    longDescription: `
**The Physics of Failure**

An exoskeleton is a brilliant engineering solution—at small scales. The cuticle provides:
- Structural support
- Protection from desiccation
- Attachment points for muscles
- Defense against predators

But exoskeletons face a fundamental scaling constraint known as the **square-cube law**.

**The Square-Cube Law**

- **Cross-sectional area** (and thus load-bearing capacity) scales as L²
- **Volume** (and thus mass/weight) scales as L³

For every doubling of size:
- Weight increases 8× (2³)
- Structural capacity increases only 4× (2²)

**The Failure Mode**

At this size, the exoskeleton experiences stresses far beyond its material limits:

1. **Compressive buckling**: Leg segments collapse inward
2. **Tensile failure**: Joints tear apart under load
3. **Shear stress**: Cuticle plates slide and crack

The exoskeleton would need to be proportionally *much* thicker, which would:
- Add even more weight
- Reduce flexibility to near-zero
- Make molting impossible

**The Result**

The spider's own weight crushes its structural framework. Legs fracture. The abdomen sags. Internal organs are compressed against an unyielding outer shell.

**Why Vertebrates Evolved Endoskeletons**

Internal skeletons (bones) scale better because:
- Bone can be optimally distributed where stress is highest
- Cross-section can increase without proportionally increasing total mass
- Growth doesn't require vulnerable molting phases

Exoskeletons are geometrically incompatible with large body sizes.
    `.trim(),
    visualCueConfig: {
      animation: 'exoskeletonCollapse',
      highlightColor: '#f97316',
      glowIntensity: 1.0,
      additionalEffects: ['crackPropagation', 'structuralDeformation', 'segmentSag'],
    },
    recoveryHint: 'Reduce gravity below 0.2g. Even then, structural margins are minimal.',
    proxyThreshold: 0.35,
    stressThreshold: 0.6,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LOCOMOTION FAILURES
  // ═══════════════════════════════════════════════════════════════════════════

  LOCOMOTION_ENERGY_FAILURE: {
    id: 'LOCOMOTION_ENERGY_FAILURE',
    subsystem: 'locomotion',
    severity: 'hard',
    title: 'Locomotion Energy Deficit',
    shortDescription: 'Movement cost exceeds metabolic capacity. The spider is immobilized.',
    longDescription: `
**The Physics of Failure**

Movement requires energy. For terrestrial animals, the cost of locomotion depends on:
1. **Body mass** (what you're moving)
2. **Speed** (how fast you're moving it)
3. **Efficiency** (how well your locomotion system converts energy to motion)

**The Scaling Problem**

As body size increases:
- **Mass increases as L³**
- **Muscle cross-section (force output) increases as L²**
- **Metabolic rate scales as ~L^0.75** (Kleiber's Law)

The net effect: **Relative power output decreases with size.**

A spider at normal size has abundant metabolic headroom—it can run, jump, and hunt with energy to spare. At giant scale, even *standing still* consumes most available energy.

**The Energy Budget**

At this size, the spider's metabolic machinery cannot produce ATP fast enough to:
- Maintain posture against gravity
- Generate hydraulic pressure for leg extension
- Power any meaningful locomotion

The spider becomes metabolically bankrupt. Every movement attempt depletes reserves that cannot be replenished fast enough.

**The Result**

The spider enters a state of forced immobility. Attempting to move results in rapid exhaustion, trembling, and collapse. The creature is alive but trapped—unable to hunt, flee, or perform any survival behavior.

**Why Large Animals Move Slowly**

This is why elephants don't sprint like cheetahs. Large animals must conserve energy through:
- Slow, efficient gaits
- Reduced movement frequency
- Extended rest periods

A spider's hunting strategy (burst ambush predation) is categorically impossible at this scale.
    `.trim(),
    visualCueConfig: {
      animation: 'locomotionFailure',
      highlightColor: '#3b82f6',
      glowIntensity: 0.8,
      additionalEffects: ['movementTremor', 'exhaustionPose', 'energyDepleted'],
    },
    recoveryHint: 'Reduce gravity significantly, or reduce body size to restore power-to-weight ratio.',
    proxyThreshold: 0.35,
    stressThreshold: 0.6,
  },
};

/**
 * Get failure mode definition by ID
 */
export const getFailureMode = (id: string): FailureModeDefinition | undefined => {
  return FAILURE_MODES[id];
};

/**
 * Get all failure modes for a specific subsystem
 */
export const getFailureModesForSubsystem = (subsystem: Subsystem): FailureModeDefinition[] => {
  return Object.values(FAILURE_MODES).filter(fm => fm.subsystem === subsystem);
};

/**
 * Check if a specific proxy value has crossed the failure threshold
 */
export const isProxyInFailure = (proxyValue: number, threshold: number): boolean => {
  return proxyValue < threshold;
};

/**
 * Check if a proxy is in stress state (but not yet failed)
 */
export const isProxyStressed = (proxyValue: number, stressThreshold: number, failureThreshold: number): boolean => {
  return proxyValue < stressThreshold && proxyValue >= failureThreshold;
};

/**
 * Detect all active failures based on current model state
 */
export const detectFailures = (proxies: ScalingProxies): string[] => {
  const activeFailureIds: string[] = [];

  // Check each failure mode
  if (isProxyInFailure(proxies.respiration, FAILURE_MODES.OXYGEN_DIFFUSION_FAILURE.proxyThreshold)) {
    activeFailureIds.push('OXYGEN_DIFFUSION_FAILURE');
  }
  
  if (isProxyInFailure(proxies.hydraulics, FAILURE_MODES.HYDRAULIC_EXTENSION_FAILURE.proxyThreshold)) {
    activeFailureIds.push('HYDRAULIC_EXTENSION_FAILURE');
  }
  
  if (isProxyInFailure(proxies.exoskeleton, FAILURE_MODES.EXOSKELETON_BUCKLING_FAILURE.proxyThreshold)) {
    activeFailureIds.push('EXOSKELETON_BUCKLING_FAILURE');
  }
  
  if (isProxyInFailure(proxies.locomotion, FAILURE_MODES.LOCOMOTION_ENERGY_FAILURE.proxyThreshold)) {
    activeFailureIds.push('LOCOMOTION_ENERGY_FAILURE');
  }

  return activeFailureIds;
};

/**
 * Compute failure state by comparing current failures with previous state
 */
export const computeFailureState = (
  currentFailureIds: string[],
  previousFailureHistory: FailureEvent[],
  currentSize: number,
  currentScale: number
): FailureState => {
  const now = Date.now();
  const previousActiveIds = new Set(
    previousFailureHistory.filter(f => f.isActive).map(f => f.failureId)
  );

  const newlyTriggeredFailures: FailureEvent[] = [];
  const updatedHistory: FailureEvent[] = [...previousFailureHistory];

  // Check for newly triggered failures
  for (const failureId of currentFailureIds) {
    if (!previousActiveIds.has(failureId)) {
      // This is a new failure!
      const failureMode = FAILURE_MODES[failureId];
      const newFailure: FailureEvent = {
        failureId,
        triggeredAtSize: currentSize,
        triggeredAtScale: currentScale,
        timestamp: now,
        isActive: true,
        isResolved: false,
        isIrreversible: failureMode?.severity === 'catastrophic',
      };
      newlyTriggeredFailures.push(newFailure);
      updatedHistory.push(newFailure);
    }
  }

  // Update existing failures - check for resolution (soft failures only)
  const currentFailureSet = new Set(currentFailureIds);
  for (const failure of updatedHistory) {
    if (failure.isActive && !currentFailureSet.has(failure.failureId)) {
      const failureMode = FAILURE_MODES[failure.failureId];
      // Only soft failures can resolve
      if (failureMode?.severity === 'soft') {
        failure.isActive = false;
        failure.isResolved = true;
      }
      // Hard and catastrophic failures remain active (latched)
    }
  }

  // Get all currently active failures
  const activeFailures = updatedHistory.filter(f => f.isActive || f.isIrreversible);

  return {
    activeFailures,
    newlyTriggeredFailures,
    failureHistory: updatedHistory,
  };
};

/**
 * Failure point information for chart markers
 */
export interface FailurePoint {
  failureId: string;
  sizeAtFailure: number;
  subsystem: Subsystem;
  severity: FailureSeverity;
  title: string;
}

/**
 * Find the exact size at which a failure would trigger
 * (Used for chart markers)
 */
export const findFailurePoint = (
  modelOutputs: ModelOutput[],
  sizes: number[],
  failureId: string
): { size: number; index: number } | null => {
  const failureMode = FAILURE_MODES[failureId];
  if (!failureMode) return null;

  const subsystem = failureMode.subsystem;
  const threshold = failureMode.proxyThreshold;

  for (let i = 0; i < modelOutputs.length; i++) {
    const proxy = modelOutputs[i].proxies[subsystem];
    if (proxy < threshold) {
      return { size: sizes[i], index: i };
    }
  }

  return null;
};

/**
 * Get all failure points for chart visualization
 */
export const getAllFailurePoints = (
  baselineLength: number,
  o2Fraction: number,
  gravityMultiplier: number,
  mode: ModelMode
): FailurePoint[] => {
  const sizes = generateSizeArray(SIZE_RANGE.min, SIZE_RANGE.max, 100);
  const modelOutputs = computeModelArray(sizes, baselineLength, o2Fraction, gravityMultiplier, mode);
  
  const failurePoints: FailurePoint[] = [];

  for (const [failureId, failureMode] of Object.entries(FAILURE_MODES)) {
    const point = findFailurePoint(modelOutputs, sizes, failureId);
    if (point) {
      failurePoints.push({
        failureId,
        sizeAtFailure: point.size,
        subsystem: failureMode.subsystem,
        severity: failureMode.severity,
        title: failureMode.title,
      });
    }
  }

  // Sort by size
  failurePoints.sort((a, b) => a.sizeAtFailure - b.sizeAtFailure);

  return failurePoints;
};
