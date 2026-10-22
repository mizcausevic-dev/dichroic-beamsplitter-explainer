export const TOTAL_FRAMES = 1020; // Indexed 0 to 1019
export const FPS = 30;
export const DURATION_SECONDS = 34;

export type CoatingFilterMode = 'longpass' | 'shortpass';
export type GeometryArchitecture = 'plate' | 'cube';
export type PolarizationMode = 'unpolarized' | 's-polarized' | 'p-polarized';

export interface TimelinePhase {
  id: string;
  index: number;
  title: string;
  subtitle: string;
  startFrame: number;
  endFrame: number;
  startTimeSec: number;
  endTimeSec: number;
  cameraPreset: {
    zoom: number;
    panX: number;
    panY: number;
    perspectiveDeg: number;
    cutawayRatio: number;
    microInsetStrength: number;
    spectralOverlayStrength: number;
    boundaryOverlayStrength: number;
  };
  causalSummary: string;
  physicalMechanism: string;
  activeCallouts: string[];
  scaleAndTimeNotes: {
    spatialScale: string;
    temporalScale: string;
    energyAccounting: string;
  };
}

export const TIMELINE_PHASES: TimelinePhase[] = [
  {
    id: 'act-1-mixed-input',
    index: 1,
    title: 'Reveal Mixed Wavelengths',
    subtitle: 'Complete Assembly & Polychromatic Input',
    startFrame: 0,
    endFrame: 149,
    startTimeSec: 0,
    endTimeSec: 5,
    cameraPreset: {
      zoom: 1.0,
      panX: 0,
      panY: 0,
      perspectiveDeg: 18,
      cutawayRatio: 0.15,
      microInsetStrength: 0.0,
      spectralOverlayStrength: 0.15,
      boundaryOverlayStrength: 0.1,
    },
    causalSummary:
      'Collimated polychromatic light enters the optical housing along the primary optical axis and approaches the 45° dichroic interface.',
    physicalMechanism:
      'Before reaching the dielectric stack, shorter-wavelength (cyan explanatory channel) and longer-wavelength (gold explanatory channel) wavepackets co-propagate within the same collimated beam envelope.',
    activeCallouts: [
      'Collimated Polychromatic Input Port',
      'Anodized Kinematic Optical Mount (45° Nominal AOI)',
      'Fused Silica / Borosilicate Optical Substrate',
      'Active Dichroic Interface Region',
    ],
    scaleAndTimeNotes: {
      spatialScale: '1:1 Macro Assembly (25.4 mm / 1-inch nominal optic class)',
      temporalScale: 'Slowed ~10¹⁴× (femtosecond optical wavecycles rendered at human-scannable cadence)',
      energyAccounting: 'P_incident = 100% normalized input flux entering aperture',
    },
  },
  {
    id: 'act-2-thin-film-stack',
    index: 2,
    title: 'Selected Spectral Response',
    subtitle: 'Sectional Cutaway: Alternating Dielectric Stack',
    startFrame: 150,
    endFrame: 299,
    startTimeSec: 5,
    endTimeSec: 10,
    cameraPreset: {
      zoom: 1.52,
      panX: -35,
      panY: -18,
      perspectiveDeg: 8,
      cutawayRatio: 1.0,
      microInsetStrength: 1.0,
      spectralOverlayStrength: 0.35,
      boundaryOverlayStrength: 0.15,
    },
    causalSummary:
      'A sectional cutaway exposes the alternating high-index (n_H) and low-index (n_L) dielectric quarter-wave layers deposited on the front surface.',
    physicalMechanism:
      'At each layer boundary, Fresnel partial reflections occur. A half-wave (π rad) phase shift occurs at low-to-high index boundaries. When optical thickness n·d·cos(θ) equals λ₀/4, reflected waves for the stopband sum in-phase (constructive interference), while passband wavelengths interfere destructively in reflection and propagate forward.',
    activeCallouts: [
      'Illustrative Alternating Stack (n_H / n_L Quarter-Wave Schematic)',
      'Phase-Locked Boundary Reflections (Δφ = 2πm in Stopband)',
      'Optical Path Condition: n · d · cos(θ_i) = λ_0 / 4',
      'Adjacent Substrate & Rear AR Coating Orientation Retained',
    ],
    scaleAndTimeNotes: {
      spatialScale: 'Enlarged ~25,000× in Cross-Sectional Inset (nanometer thin films vs. millimeter substrate)',
      temporalScale: 'Phase-resolved wave superposition across multiple dielectric boundaries',
      energyAccounting: 'Coherent redistribution of electromagnetic field amplitude between R(λ) and T(λ)',
    },
  },
  {
    id: 'act-3-path-separation',
    index: 3,
    title: 'Separate Wavelength Paths',
    subtitle: 'Orthogonal Reflection vs. Transmission Routing',
    startFrame: 300,
    endFrame: 509,
    startTimeSec: 10,
    endTimeSec: 17,
    cameraPreset: {
      zoom: 1.16,
      panX: 12,
      panY: -6,
      perspectiveDeg: 12,
      cutawayRatio: 0.55,
      microInsetStrength: 0.35,
      spectralOverlayStrength: 0.5,
      boundaryOverlayStrength: 0.25,
    },
    causalSummary:
      'The stopband channel reflects orthogonally at 90° to the incident beam, while the passband channel refracts through the substrate and exits the rear anti-reflective (AR) face.',
    physicalMechanism:
      'In a plate dichroic beamsplitter, the transmitted beam refracts inside the substrate of thickness t according to Snell’s Law (n₁ sin θ₁ = n₂ sin θ₂), producing a lateral beam walk-off Δs and residual rear-surface ghost reflection unless mitigated by a rear AR coating or wedge angle.',
    activeCallouts: [
      'Reflected Channel (Stopband: Constructive Reflection at 90° Port)',
      'Transmitted Channel (Passband: Forward Propagation Through Substrate)',
      'Snell Refraction Walk-Off (Δs) & Rear-Surface AR Coating',
      'Residual Ghost Reflection Path (Plate vs. Cemented Cube Comparison)',
    ],
    scaleAndTimeNotes: {
      spatialScale: 'Macro beam geometry with exaggerated plate walk-off Δs for legibility',
      temporalScale: 'Causal propagation from incident wavefront to separated detector ports',
      energyAccounting: 'P_in = P_transmitted(λ) + P_reflected(λ) + P_ghost + P_scatter/absorption',
    },
  },
  {
    id: 'act-4-spectral-comparison',
    index: 4,
    title: 'Compare Incident & Output Spectra',
    subtitle: 'Qualitative Spectral Transfer & Transition Slope',
    startFrame: 510,
    endFrame: 749,
    startTimeSec: 17,
    endTimeSec: 25,
    cameraPreset: {
      zoom: 1.08,
      panX: 24,
      panY: 16,
      perspectiveDeg: 10,
      cutawayRatio: 0.4,
      microInsetStrength: 0.2,
      spectralOverlayStrength: 1.0,
      boundaryOverlayStrength: 0.35,
    },
    causalSummary:
      'Synchronized qualitative spectral plots compare the broadband incident distribution against separated reflectance R(λ) and transmittance T(λ) transfer curves.',
    physicalMechanism:
      'Real dielectric interference filters exhibit a finite transition slope around the nominal cutoff/cut-on wavelength (λ_c), passband ripple from impedance mismatch, and non-zero insertion loss. No physical coating achieves a zero-width step function.',
    activeCallouts: [
      'Qualitative Incident Spectrum vs. Partitioned Output Channels',
      'Finite Transition Slope Around Nominal Cutoff Wavelength (λ_c)',
      'Passband Ripple & Stopband Rejection Floor (Illustrative Schematic)',
      'Conservation Verification: R(λ) + T(λ) + Loss(λ) = 1',
    ],
    scaleAndTimeNotes: {
      spatialScale: 'Combined optical bench schematic + qualitative spectral transfer coordinate plane',
      temporalScale: 'Steady-state frequency-domain transfer response paired with time-domain wavepackets',
      energyAccounting: 'Explicit loss budget: bulk absorption + interface scatter + rear-surface residual reflection',
    },
  },
  {
    id: 'act-5-design-dependence',
    index: 5,
    title: 'Mark Design Dependence & Limits',
    subtitle: 'AOI Blue-Shift, S/P Polarization Splitting & Operational Envelope',
    startFrame: 750,
    endFrame: 1019,
    startTimeSec: 25,
    endTimeSec: 34,
    cameraPreset: {
      zoom: 0.96,
      panX: 0,
      panY: 0,
      perspectiveDeg: 15,
      cutawayRatio: 0.25,
      microInsetStrength: 0.25,
      spectralOverlayStrength: 0.85,
      boundaryOverlayStrength: 1.0,
    },
    causalSummary:
      'Pull back to the complete system view highlighting how angle-of-incidence (AOI) cone divergence, s/p polarization splitting, and architecture choice bound performance.',
    physicalMechanism:
      'Increasing AOI decreases cos(θ) in the phase condition, shifting the spectral edge toward shorter wavelengths (blue-shift). At oblique incidence (such as 45°), effective optical admittance diverges for s-polarized (TE) and p-polarized (TM) light, splitting the cutoff edge into two distinct curves.',
    activeCallouts: [
      'Angle-of-Incidence Sensitivity: Oblique Cone Causes Spectral Blue-Shift',
      'Polarization Splitting: S-Pol (TE) vs. P-Pol (TM) Cutoff Divergence at 45°',
      'Plate vs. Cube Trade-Offs: Ghosting/Astigmatism vs. Cement Laser Damage Limit',
      'No Proprietary Layer Recipe Claimed: Schematic Educational Model',
    ],
    scaleAndTimeNotes: {
      spatialScale: 'Complete system envelope with angular acceptance cone (±Δθ) and mechanical apertures',
      temporalScale: 'Compressed parameter sweep across AOI and polarization states',
      energyAccounting: 'Polarization-resolved energy balance: T_avg(λ) = ½[T_s(λ) + T_p(λ)] for unpolarized light',
    },
  },
];

export interface InterpolatedTimelineState {
  frame: number;
  timeSec: number;
  progress: number;
  currentPhase: TimelinePhase;
  phaseLocalProgress: number;
  zoom: number;
  panX: number;
  panY: number;
  perspectiveDeg: number;
  cutawayRatio: number;
  microInsetStrength: number;
  spectralOverlayStrength: number;
  boundaryOverlayStrength: number;
  // Deterministic physics & animation drivers derived purely from frame
  wavePhaseRad: number;
  aoISweepDeg: number;
  polarizationSplitVisibility: number;
  inputBeamReveal: number;
  splitBeamReveal: number;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Pure deterministic function mapping frame index [0..1019] to complete scene and camera state.
 * Scrubbing to frame N always yields the exact same visual state.
 */
export function computeTimelineState(rawFrame: number): InterpolatedTimelineState {
  const frame = clamp(Math.round(rawFrame), 0, TOTAL_FRAMES - 1);
  const timeSec = frame / FPS;
  const progress = frame / (TOTAL_FRAMES - 1);

  const currentPhase =
    TIMELINE_PHASES.find((p) => frame >= p.startFrame && frame <= p.endFrame) ??
    TIMELINE_PHASES[TIMELINE_PHASES.length - 1];

  const phaseSpan = currentPhase.endFrame - currentPhase.startFrame;
  const phaseLocalProgress = phaseSpan > 0 ? (frame - currentPhase.startFrame) / phaseSpan : 1;

  // Determine previous/next phase for smooth camera transitions near phase boundaries
  const phaseIdx = TIMELINE_PHASES.findIndex((p) => p.id === currentPhase.id);
  const nextPhase = TIMELINE_PHASES[Math.min(phaseIdx + 1, TIMELINE_PHASES.length - 1)];

  // Smoothly blend into next phase preset during the last 28 frames of each act
  const transitionWindow = 28;
  const framesToEnd = currentPhase.endFrame - frame;
  const blendToNext =
    phaseIdx < TIMELINE_PHASES.length - 1 && framesToEnd < transitionWindow
      ? smoothstep(0, 1, 1 - framesToEnd / transitionWindow) * 0.5
      : 0;

  // Within Act 1 (0-149), perform the requested "slow three-quarter push toward the active region"
  let baseZoom = currentPhase.cameraPreset.zoom;
  let basePanX = currentPhase.cameraPreset.panX;
  let basePanY = currentPhase.cameraPreset.panY;

  if (phaseIdx === 0) {
    const pushT = smoothstep(0, 1, phaseLocalProgress);
    baseZoom = lerp(0.94, 1.18, pushT);
    basePanX = lerp(18, -10, pushT);
    basePanY = lerp(10, -6, pushT);
  }

  const zoom = lerp(baseZoom, nextPhase.cameraPreset.zoom, blendToNext);
  const panX = lerp(basePanX, nextPhase.cameraPreset.panX, blendToNext);
  const panY = lerp(basePanY, nextPhase.cameraPreset.panY, blendToNext);
  const perspectiveDeg = lerp(
    currentPhase.cameraPreset.perspectiveDeg,
    nextPhase.cameraPreset.perspectiveDeg,
    blendToNext
  );
  const cutawayRatio = lerp(
    currentPhase.cameraPreset.cutawayRatio,
    nextPhase.cameraPreset.cutawayRatio,
    blendToNext
  );
  const microInsetStrength = lerp(
    currentPhase.cameraPreset.microInsetStrength,
    nextPhase.cameraPreset.microInsetStrength,
    blendToNext
  );
  const spectralOverlayStrength = lerp(
    currentPhase.cameraPreset.spectralOverlayStrength,
    nextPhase.cameraPreset.spectralOverlayStrength,
    blendToNext
  );
  const boundaryOverlayStrength = lerp(
    currentPhase.cameraPreset.boundaryOverlayStrength,
    nextPhase.cameraPreset.boundaryOverlayStrength,
    blendToNext
  );

  // Deterministic wave phase (rad) for coherent travelling waves
  const wavePhaseRad = frame * 0.24;

  // In Act 5 (750-1019), sweep a gentle illustrative AOI perturbation (±8°) to show design dependence
  const aoISweepDeg =
    frame >= 750 ? Math.sin(((frame - 750) / (1019 - 750)) * Math.PI * 2) * 7.5 : 0;

  const polarizationSplitVisibility = smoothstep(730, 810, frame);
  const inputBeamReveal = smoothstep(0, 45, frame);
  const splitBeamReveal = smoothstep(35, 110, frame);

  return {
    frame,
    timeSec,
    progress,
    currentPhase,
    phaseLocalProgress,
    zoom,
    panX,
    panY,
    perspectiveDeg,
    cutawayRatio,
    microInsetStrength,
    spectralOverlayStrength,
    boundaryOverlayStrength,
    wavePhaseRad,
    aoISweepDeg,
    polarizationSplitVisibility,
    inputBeamReveal,
    splitBeamReveal,
  };
}

export interface QualitativeSpectralPoint {
  normFreq: number; // Normalized spectral coordinate [0..100] (qualitative, short λ -> long λ)
  incident: number; // [0..1]
  transmittedS: number;
  transmittedP: number;
  transmittedActive: number;
  reflectedActive: number;
  loss: number;
}

/**
 * Computes qualitative spectral transfer curves R(λ), T(λ), and Loss(λ)
 * showing dependence on:
 * - Filter mode (Longpass vs Shortpass)
 * - Incident Angle (AOI shift: higher AOI shifts cutoff toward shorter wavelengths)
 * - Polarization (S-pol vs P-pol divergence at oblique incidence)
 * - Architecture (Plate vs Cube loss/ripple characteristics)
 */
export function computeQualitativeSpectrum(params: {
  filterMode: CoatingFilterMode;
  architecture: GeometryArchitecture;
  polarization: PolarizationMode;
  nominalAoiDeg: number; // e.g., 30 to 60 deg, nominal 45
}): {
  points: QualitativeSpectralPoint[];
  cutoffS: number;
  cutoffP: number;
  activeCutoff: number;
  blueShiftAmount: number;
  energySummary: {
    transmittedFraction: number;
    reflectedFraction: number;
    ghostAndLossFraction: number;
  };
} {
  const { filterMode, architecture, polarization, nominalAoiDeg } = params;

  // Effective phase shift from angle of incidence: λ_eff ~ λ_0 * sqrt(1 - (sin θ / n_eff)^2)
  // Relative to 45 deg nominal design:
  const nEff = 1.78;
  const sin45 = Math.sin((45 * Math.PI) / 180);
  const sinTheta = Math.sin((nominalAoiDeg * Math.PI) / 180);
  const cosInternal45 = Math.sqrt(1 - (sin45 * sin45) / (nEff * nEff));
  const cosInternalTheta = Math.sqrt(1 - (sinTheta * sinTheta) / (nEff * nEff));

  // Qualitative normalized cutoff position on [0..100] axis (nominal = 52)
  const shiftFactor = (cosInternalTheta - cosInternal45) * 145;
  const baseCutoff = 52 + shiftFactor;

  // At oblique angles, s-pol and p-pol have different effective Fresnel reflectances per boundary.
  // S-pol has a wider reflectance stopband than P-pol.
  const obliquity = Math.pow(sinTheta, 2) * 11.5;
  const cutoffS = filterMode === 'longpass' ? baseCutoff + obliquity * 0.55 : baseCutoff - obliquity * 0.55;
  const cutoffP = filterMode === 'longpass' ? baseCutoff - obliquity * 0.55 : baseCutoff + obliquity * 0.55;

  const slopeS = 3.2; // S-polarization has steeper stopband edge
  const slopeP = 4.6; // P-polarization has slightly broader transition

  // Base loss (absorption + scatter + residual rear ghosting if plate)
  const baseLoss = architecture === 'plate' ? 0.038 : 0.026;

  const points: QualitativeSpectralPoint[] = [];
  let sumT = 0;
  let sumR = 0;
  let sumL = 0;

  for (let i = 0; i <= 50; i++) {
    const x = i * 2; // 0 to 100

    // Qualitative broadband incident envelope (two-lobe source representing mixed short & long bands)
    const shortLobe = 0.88 * Math.exp(-Math.pow((x - 26) / 16, 2));
    const longLobe = 0.92 * Math.exp(-Math.pow((x - 76) / 16, 2));
    const continuum = 0.22 * Math.exp(-Math.pow((x - 50) / 38, 2));
    const incident = clamp(shortLobe + longLobe + continuum, 0.08, 1.0);

    // Sigmoid passband transfer function
    const sigS = 1 / (1 + Math.exp(-(x - cutoffS) / slopeS));
    const sigP = 1 / (1 + Math.exp(-(x - cutoffP) / slopeP));

    let rawTS = filterMode === 'longpass' ? sigS : 1 - sigS;
    let rawTP = filterMode === 'longpass' ? sigP : 1 - sigP;

    // Add realistic qualitative passband ripple (thin-film cavity ringing in passband)
    const rippleS = 0.028 * Math.sin(x * 0.42) * rawTS;
    const rippleP = 0.016 * Math.sin(x * 0.42 + 0.7) * rawTP;

    // Account for transition-edge scatter peak and bulk loss
    const edgeProximity = Math.exp(-Math.pow((x - baseCutoff) / 7, 2));
    const loss = clamp(baseLoss + 0.022 * edgeProximity, 0.015, 0.09);

    const maxAvailable = 1 - loss;
    const transmittedS = clamp((rawTS + rippleS) * maxAvailable, 0.008, maxAvailable);
    const transmittedP = clamp((rawTP + rippleP) * maxAvailable, 0.008, maxAvailable);

    const transmittedActive =
      polarization === 's-polarized'
        ? transmittedS
        : polarization === 'p-polarized'
          ? transmittedP
          : 0.5 * (transmittedS + transmittedP);

    const reflectedActive = clamp(1 - transmittedActive - loss, 0.005, maxAvailable);

    sumT += transmittedActive * incident;
    sumR += reflectedActive * incident;
    sumL += loss * incident;

    points.push({
      normFreq: x,
      incident,
      transmittedS,
      transmittedP,
      transmittedActive,
      reflectedActive,
      loss,
    });
  }

  const totalWeighted = sumT + sumR + sumL || 1;
  return {
    points,
    cutoffS,
    cutoffP,
    activeCutoff:
      polarization === 's-polarized'
        ? cutoffS
        : polarization === 'p-polarized'
          ? cutoffP
          : 0.5 * (cutoffS + cutoffP),
    blueShiftAmount: baseCutoff - 52,
    energySummary: {
      transmittedFraction: sumT / totalWeighted,
      reflectedFraction: sumR / totalWeighted,
      ghostAndLossFraction: sumL / totalWeighted,
    },
  };
}
