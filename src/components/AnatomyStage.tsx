import React from 'react';
import {
  CoatingFilterMode,
  GeometryArchitecture,
  InterpolatedTimelineState,
  PolarizationMode,
  QualitativeSpectralPoint,
} from '../data/beamsplitterTimeline';

interface AnatomyStageProps {
  timeline: InterpolatedTimelineState;
  filterMode: CoatingFilterMode;
  architecture: GeometryArchitecture;
  polarization: PolarizationMode;
  userAoiDeg: number;
  spectralData: {
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
  };
}

/**
 * Generates an SVG path for a coherent sinusoidal wave along a line segment from (x1,y1) to (x2,y2).
 */
function buildCoherentWavePath(params: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  wavelengthPx: number;
  amplitudePx: number;
  phaseRad: number;
  revealRatio?: number;
}): string {
  const { x1, y1, x2, y2, wavelengthPx, amplitudePx, phaseRad, revealRatio = 1 } = params;
  const clampedReveal = Math.max(0.02, Math.min(1, revealRatio));
  const targetX = x1 + (x2 - x1) * clampedReveal;
  const targetY = y1 + (y2 - y1) * clampedReveal;

  const dx = targetX - x1;
  const dy = targetY - y1;
  const length = Math.hypot(dx, dy);
  if (length < 2) return `M ${x1} ${y1}`;

  const ux = dx / length;
  const uy = dy / length;
  // Normal unit vector
  const nx = -uy;
  const ny = ux;

  const steps = Math.max(24, Math.floor(length / 3.5));
  const parts: string[] = [];

  for (let i = 0; i <= steps; i++) {
    const s = (i / steps) * length;
    // Envelope taper at ends so wave enters and terminates cleanly at boundaries
    const edgeTaper = Math.sin(Math.min(1, s / 18) * (Math.PI / 2)) *
      Math.sin(Math.min(1, (length - s) / 18) * (Math.PI / 2));
    const disp =
      Math.sin((s / wavelengthPx) * Math.PI * 2 - phaseRad) * amplitudePx * edgeTaper;

    const px = x1 + ux * s + nx * disp;
    const py = y1 + uy * s + ny * disp;
    parts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
  }

  return parts.join(' ');
}

export const AnatomyStage: React.FC<AnatomyStageProps> = ({
  timeline,
  filterMode,
  architecture,
  polarization,
  userAoiDeg,
  spectralData,
}) => {
  const effectiveAoi = Math.round((userAoiDeg + timeline.aoISweepDeg) * 10) / 10;

  // Center of active dichroic incidence on the main schematic stage
  const cx = 470;
  const cy = 310;

  // Plate or hypotenuse rotation angle in SVG coordinates
  // At 45 deg AOI with horizontal input beam (from left to right), normal is at -135 deg,
  // and the dichroic surface runs from bottom-left to top-right (-45 deg from horizontal).
  const surfaceTiltDeg = -(90 - effectiveAoi);
  const surfaceTiltRad = (surfaceTiltDeg * Math.PI) / 180;

  // Input beam start (left collimator port) -> incidence point (cx, cy)
  const inStartX = 115;
  const inStartY = cy;

  // Reflected beam direction depends on surface tilt: theta_refl = -90 deg + 2 * (AOI - 45 deg)
  // At nominal 45 deg AOI, reflected beam goes straight UP (cx, 58)
  const deltaAoiRad = ((effectiveAoi - 45) * Math.PI) / 180;
  const reflLength = 252;
  const reflAngleRad = -Math.PI / 2 + deltaAoiRad * 2;
  const reflEndX = cx + Math.cos(reflAngleRad) * reflLength;
  const reflEndY = cy + Math.sin(reflAngleRad) * reflLength;

  // Exact Snell's Law refraction through tilted plate of thickness t = 28 px (n_sub = 1.50)
  const plateThickness = 28;
  const nSubstrate = 1.5;
  const aoiRad = (effectiveAoi * Math.PI) / 180;
  const theta2Rad = Math.asin(Math.sin(aoiRad) / nSubstrate);
  const localRearX = plateThickness * Math.tan(theta2Rad);

  const rearExitX =
    architecture === 'plate'
      ? cx + localRearX * Math.cos(surfaceTiltRad) - plateThickness * Math.sin(surfaceTiltRad)
      : cx;
  const rearExitY =
    architecture === 'plate'
      ? cy + localRearX * Math.sin(surfaceTiltRad) + plateThickness * Math.cos(surfaceTiltRad)
      : cy;
  const transEndX = 835;
  const transEndY = rearExitY;

  // Ghost reflection from rear surface of plate: bounces internally to front face at (2*localRearX, 0) then exits parallel to reflected beam
  const ghostFrontX = cx + 2 * localRearX * Math.cos(surfaceTiltRad);
  const ghostFrontY = cy + 2 * localRearX * Math.sin(surfaceTiltRad);
  const ghostEndX = ghostFrontX + Math.cos(reflAngleRad) * 195;
  const ghostEndY = ghostFrontY + Math.sin(reflAngleRad) * 195;

  // Channel assignment based on Longpass vs Shortpass
  // Cyan (#00E5FF) = primary transport / short-wavelength band
  // Gold (#FFD166) = energy / actuation / long-wavelength band
  // Longpass transmits long λ (Gold) and reflects short λ (Cyan)
  // Shortpass transmits short λ (Cyan) and reflects long λ (Gold)
  const reflectedColor = filterMode === 'longpass' ? '#00E5FF' : '#FFD166';
  const transmittedColor = filterMode === 'longpass' ? '#FFD166' : '#00E5FF';
  const reflectedWavelengthPx = filterMode === 'longpass' ? 22 : 38;
  const transmittedWavelengthPx = filterMode === 'longpass' ? 38 : 22;

  const reflectedLabel =
    filterMode === 'longpass'
      ? 'Reflected Stopband (Short-λ Channel)'
      : 'Reflected Stopband (Long-λ Channel)';
  const transmittedLabel =
    filterMode === 'longpass'
      ? 'Transmitted Passband (Long-λ Channel)'
      : 'Transmitted Passband (Short-λ Channel)';

  // Camera transform string for the SVG stage group
  const stageTransform = `translate(${timeline.panX.toFixed(1)}, ${timeline.panY.toFixed(1)}) translate(${cx}, ${cy}) scale(${timeline.zoom.toFixed(3)}) translate(${-cx}, ${-cy})`;

  // Build qualitative spectrum polyline paths for the Act 4 / persistent inset panel
  const graphW = 300;
  const graphH = 108;
  const toGraphX = (normFreq: number) => (normFreq / 100) * graphW;
  const toGraphY = (val: number) => graphH - val * (graphH - 14) - 6;

  const incidentPolyline = spectralData.points
    .map((pt) => `${toGraphX(pt.normFreq).toFixed(1)},${toGraphY(pt.incident).toFixed(1)}`)
    .join(' ');
  const transmittedPolyline = spectralData.points
    .map((pt) => `${toGraphX(pt.normFreq).toFixed(1)},${toGraphY(pt.transmittedActive).toFixed(1)}`)
    .join(' ');
  const reflectedPolyline = spectralData.points
    .map((pt) => `${toGraphX(pt.normFreq).toFixed(1)},${toGraphY(pt.reflectedActive).toFixed(1)}`)
    .join(' ');
  const sPolPolyline = spectralData.points
    .map((pt) => `${toGraphX(pt.normFreq).toFixed(1)},${toGraphY(pt.transmittedS).toFixed(1)}`)
    .join(' ');
  const pPolPolyline = spectralData.points
    .map((pt) => `${toGraphX(pt.normFreq).toFixed(1)},${toGraphY(pt.transmittedP).toFixed(1)}`)
    .join(' ');

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-[#1E2D45] bg-[#0B1019] shadow-2xl">
      {/* Top HUD Bar inside the stage */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E2D45] bg-[#0E1522]/90 px-4 py-2.5 text-xs">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded bg-[#00E5FF]/10 px-2 py-0.5 font-mono-tech font-semibold text-[#00E5FF] border border-[#00E5FF]/30">
            ACT {timeline.currentPhase.index}/5
          </span>
          <span className="font-semibold text-[#E6EDF3]">{timeline.currentPhase.title}</span>
          <span className="hidden text-[#94A3B8] md:inline">
            ({timeline.currentPhase.subtitle})
          </span>
        </div>

        <div className="flex items-center gap-4 font-mono-tech text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#00E5FF]" />
            <span className="text-[#94A3B8]">Short-λ Signal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#FFD166]" />
            <span className="text-[#94A3B8]">Long-λ Energy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#9D4EDD]" />
            <span className="text-[#94A3B8]">Dielectric Stack / State</span>
          </div>
          <span className="rounded bg-[#162032] px-2 py-0.5 text-[#E6EDF3] border border-[#283B5B]">
            FRAME {String(timeline.frame).padStart(4, '0')} / 1019 ({timeline.timeSec.toFixed(2)}s)
          </span>
        </div>
      </div>

      {/* Main Deterministic SVG Technical Viewport */}
      <div className="relative aspect-[16/10] w-full select-none bg-tech-grid">
        <svg
          viewBox="0 0 960 600"
          className="h-full w-full"
          role="img"
          aria-label="Deterministic code-driven anatomy schematic of a Dichroic Beamsplitter across 1,020 frames"
        >
          <defs>
            <linearGradient id="substrateGlass" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" stopOpacity="0.72" />
              <stop offset="50%" stopColor="#0F172A" stopOpacity="0.82" />
              <stop offset="100%" stopColor="#334155" stopOpacity="0.68" />
            </linearGradient>

            <linearGradient id="dielectricStackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#9D4EDD" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#C77DFF" stopOpacity="1" />
              <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="arCoatingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.25" />
            </linearGradient>

            <radialGradient id="activeZoneGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#9D4EDD" stopOpacity="0.28" />
              <stop offset="55%" stopColor="#00E5FF" stopOpacity="0.09" />
              <stop offset="100%" stopColor="#0B1019" stopOpacity="0" />
            </radialGradient>

            <marker
              id="arrowCyan"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#00E5FF" />
            </marker>
            <marker
              id="arrowGold"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#FFD166" />
            </marker>
            <marker
              id="arrowViolet"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#9D4EDD" />
            </marker>
          </defs>

          {/* Animated Camera Group */}
          <g transform={stageTransform}>
            {/* Coordinate Reference Axes & Optical Bench Datum */}
            <g opacity="0.45">
              <line
                x1="70"
                y1={cy}
                x2="890"
                y2={cy}
                stroke="#334155"
                strokeWidth="1"
                strokeDasharray="6 6"
              />
              <line
                x1={cx}
                y1="40"
                x2={cx}
                y2="540"
                stroke="#334155"
                strokeWidth="1"
                strokeDasharray="6 6"
              />
              <circle
                cx={cx}
                cy={cy}
                r="175"
                fill="none"
                stroke="#1E293B"
                strokeWidth="1"
                strokeDasharray="3 5"
              />
            </g>

            {/* Subtle Active Interference Zone Halo */}
            <circle cx={cx} cy={cy} r="130" fill="url(#activeZoneGlow)" />

            {/* PORT 1: Input Collimator Assembly (Left) */}
            <g transform={`translate(56, ${cy - 34})`}>
              <rect
                x="0"
                y="0"
                width="58"
                height="68"
                rx="4"
                fill="#131C2B"
                stroke="#475569"
                strokeWidth="1.5"
              />
              <rect
                x="48"
                y="10"
                width="8"
                height="48"
                rx="2"
                fill="#1E293B"
                stroke="#00E5FF"
                strokeWidth="1"
              />
              <line x1="8" y1="14" x2="40" y2="14" stroke="#334155" strokeWidth="2" />
              <line x1="8" y1="54" x2="40" y2="54" stroke="#334155" strokeWidth="2" />
              <text
                x="29"
                y="-10"
                textAnchor="middle"
                fill="#E6EDF3"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
              >
                INPUT PORT
              </text>
              <text
                x="29"
                y="84"
                textAnchor="middle"
                fill="#94A3B8"
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
              >
                Polychromatic
              </text>
            </g>

            {/* PORT 2: Orthogonal Reflected Output Sensor / Port (Top) */}
            <g transform={`translate(${reflEndX - 34}, 22)`}>
              <rect
                x="0"
                y="0"
                width="68"
                height="36"
                rx="4"
                fill="#131C2B"
                stroke={reflectedColor}
                strokeWidth="1.5"
              />
              <line
                x1="12"
                y1="32"
                x2="56"
                y2="32"
                stroke={reflectedColor}
                strokeWidth="2.5"
              />
              <text
                x="34"
                y="15"
                textAnchor="middle"
                fill={reflectedColor}
                fontSize="9.5"
                fontWeight="600"
                fontFamily="JetBrains Mono, monospace"
              >
                90° REFLECTED
              </text>
              <text
                x="34"
                y="26"
                textAnchor="middle"
                fill="#94A3B8"
                fontSize="8.5"
                fontFamily="JetBrains Mono, monospace"
              >
                Stopband R(λ)
              </text>
            </g>

            {/* PORT 3: Transmitted Output Sensor / Port (Right) */}
            <g transform={`translate(838, ${transEndY - 34})`}>
              <rect
                x="0"
                y="0"
                width="58"
                height="68"
                rx="4"
                fill="#131C2B"
                stroke={transmittedColor}
                strokeWidth="1.5"
              />
              <line
                x1="4"
                y1="12"
                x2="4"
                y2="56"
                stroke={transmittedColor}
                strokeWidth="2.5"
              />
              <text
                x="29"
                y="-10"
                textAnchor="middle"
                fill={transmittedColor}
                fontSize="9.5"
                fontWeight="600"
                fontFamily="JetBrains Mono, monospace"
              >
                0° TRANSMITTED
              </text>
              <text
                x="29"
                y="84"
                textAnchor="middle"
                fill="#94A3B8"
                fontSize="8.5"
                fontFamily="JetBrains Mono, monospace"
              >
                Passband T(λ)
              </text>
            </g>

            {/* CENTRAL OPTIC ASSEMBLY: Plate vs. Cube Architecture */}
            <g transform={`translate(${cx}, ${cy})`}>
              {/* Kinematic Mount Ring (Structural Material) */}
              <circle
                cx="0"
                cy="0"
                r="104"
                fill="none"
                stroke="#334155"
                strokeWidth="6"
                strokeDasharray="24 8"
                opacity={1 - timeline.cutawayRatio * 0.45}
              />
              <circle
                cx="0"
                cy="0"
                r="96"
                fill="none"
                stroke="#475569"
                strokeWidth="1.5"
              />

              {architecture === 'plate' ? (
                /* PLATE BEAMSPLITTER GEOMETRY */
                <g transform={`rotate(${surfaceTiltDeg})`}>
                  {/* Fused Silica Substrate Body (shifted +Y so front surface lies exactly along Y=0) */}
                  <rect
                    x="-78"
                    y="0"
                    width="156"
                    height="28"
                    rx="2"
                    fill="url(#substrateGlass)"
                    stroke="#64748B"
                    strokeWidth="1.5"
                  />
                  {/* Substrate Hatch Lines */}
                  <line x1="-55" y1="6" x2="-40" y2="22" stroke="#475569" strokeWidth="1" />
                  <line x1="-15" y1="6" x2="0" y2="22" stroke="#475569" strokeWidth="1" />
                  <line x1="25" y1="6" x2="40" y2="22" stroke="#475569" strokeWidth="1" />

                  {/* Rear-Surface Anti-Reflective (AR) Coating */}
                  <rect
                    x="-78"
                    y="26.5"
                    width="156"
                    height="3"
                    fill="url(#arCoatingGrad)"
                  />

                  {/* Front-Surface Multi-Layer Dielectric Stack (Exaggerated in Cutaway) */}
                  <g>
                    {[0, 1, 2, 3, 4].map((layerIdx) => {
                      const layerOffset = -layerIdx * (1.2 + timeline.cutawayRatio * 1.4);
                      const isHighIndex = layerIdx % 2 === 0;
                      return (
                        <rect
                          key={layerIdx}
                          x="-78"
                          y={layerOffset - 2}
                          width="156"
                          height={1.6 + timeline.cutawayRatio * 0.9}
                          fill={isHighIndex ? '#9D4EDD' : '#00E5FF'}
                          opacity={isHighIndex ? 0.92 : 0.75}
                        />
                      );
                    })}
                  </g>

                  {/* Surface Normal Vector Indicator */}
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="-68"
                    stroke="#9D4EDD"
                    strokeWidth="1.3"
                    strokeDasharray="4 3"
                    markerEnd="url(#arrowViolet)"
                  />
                  <text
                    x="8"
                    y="-56"
                    fill="#C77DFF"
                    fontSize="9.5"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    n̂ (Normal, θ_i={effectiveAoi}°)
                  </text>
                </g>
              ) : (
                /* CEMENTED CUBE BEAMSPLITTER GEOMETRY */
                <g transform={`rotate(${effectiveAoi - 45})`}>
                  {/* Top-Left Input Right-Angle Prism */}
                  <polygon
                    points="-64,-64 64,-64 -64,64"
                    fill="url(#substrateGlass)"
                    stroke="#64748B"
                    strokeWidth="1.5"
                  />
                  {/* Bottom-Right Output Right-Angle Prism */}
                  <polygon
                    points="64,64 64,-64 -64,64"
                    fill="url(#substrateGlass)"
                    stroke="#64748B"
                    strokeWidth="1.5"
                  />
                  {/* Exterior AR Coatings on Cube Faces */}
                  <line x1="-64" y1="-64" x2="-64" y2="64" stroke="#00E5FF" strokeWidth="2.5" strokeOpacity="0.5" />
                  <line x1="-64" y1="-64" x2="64" y2="-64" stroke="#00E5FF" strokeWidth="2.5" strokeOpacity="0.5" />
                  <line x1="64" y1="-64" x2="64" y2="64" stroke="#00E5FF" strokeWidth="2.5" strokeOpacity="0.5" />

                  {/* Internal Hypotenuse Dielectric Coating + Optical Cement Layer */}
                  <line
                    x1="-64"
                    y1="64"
                    x2="64"
                    y2="-64"
                    stroke="url(#dielectricStackGrad)"
                    strokeWidth={4 + timeline.cutawayRatio * 3.5}
                  />
                  <text
                    x="0"
                    y="82"
                    textAnchor="middle"
                    fill="#94A3B8"
                    fontSize="9.5"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    Matched-Index Cemented Prisms (Zero Beam Walk-Off)
                  </text>
                </g>
              )}
            </g>

            {/* INCIDENT POLYCHROMATIC BEAM (Frames 0-1019) */}
            <g opacity={timeline.inputBeamReveal}>
              {/* Collimated Beam Envelope */}
              <line
                x1={inStartX}
                y1={inStartY}
                x2={cx}
                y2={cy}
                stroke="#E6EDF3"
                strokeWidth="14"
                strokeOpacity="0.07"
              />
              {/* Short-Wavelength Co-Propagating Wave (Cyan) */}
              <path
                d={buildCoherentWavePath({
                  x1: inStartX,
                  y1: inStartY - 3,
                  x2: cx,
                  y2: cy - 3,
                  wavelengthPx: 22,
                  amplitudePx: 6.5,
                  phaseRad: timeline.wavePhaseRad * 1.35,
                  revealRatio: timeline.inputBeamReveal,
                })}
                fill="none"
                stroke="#00E5FF"
                strokeWidth="2.2"
              />
              {/* Long-Wavelength Co-Propagating Wave (Gold) */}
              <path
                d={buildCoherentWavePath({
                  x1: inStartX,
                  y1: inStartY + 3,
                  x2: cx,
                  y2: cy + 3,
                  wavelengthPx: 38,
                  amplitudePx: 7.5,
                  phaseRad: timeline.wavePhaseRad * 0.85,
                  revealRatio: timeline.inputBeamReveal,
                })}
                fill="none"
                stroke="#FFD166"
                strokeWidth="2.2"
              />
            </g>

            {/* SEPARATED WAVELENGTH PATHS (Reflected Stopband + Transmitted Passband) */}
            <g opacity={timeline.splitBeamReveal}>
              {/* 1. REFLECTED STOPBAND PATH (90 deg nominal upward) */}
              <line
                x1={cx}
                y1={cy}
                x2={reflEndX}
                y2={reflEndY}
                stroke={reflectedColor}
                strokeWidth="12"
                strokeOpacity="0.09"
              />
              <path
                d={buildCoherentWavePath({
                  x1: cx,
                  y1: cy,
                  x2: reflEndX,
                  y2: reflEndY,
                  wavelengthPx: reflectedWavelengthPx,
                  amplitudePx: 7 * Math.sqrt(spectralData.energySummary.reflectedFraction + 0.35),
                  phaseRad: timeline.wavePhaseRad * (filterMode === 'longpass' ? 1.35 : 0.85),
                  revealRatio: timeline.splitBeamReveal,
                })}
                fill="none"
                stroke={reflectedColor}
                strokeWidth="2.5"
              />

              {/* 2. INTERNAL SUBSTRATE REFRACTION SEGMENT (For Plate Geometry) */}
              {architecture === 'plate' && (
                <g>
                  <line
                    x1={cx}
                    y1={cy}
                    x2={rearExitX}
                    y2={rearExitY}
                    stroke={transmittedColor}
                    strokeWidth="2.2"
                    strokeDasharray="3 2"
                  />
                  {/* Residual Rear-Surface Ghost Reflection (Internal bounce + parallel ghost exit) */}
                  <polyline
                    points={`${rearExitX.toFixed(1)},${rearExitY.toFixed(1)} ${ghostFrontX.toFixed(1)},${ghostFrontY.toFixed(1)} ${ghostEndX.toFixed(1)},${ghostEndY.toFixed(1)}`}
                    fill="none"
                    stroke={transmittedColor}
                    strokeWidth="1.2"
                    strokeDasharray="4 4"
                    strokeOpacity={0.38 + timeline.boundaryOverlayStrength * 0.35}
                  />
                  {(timeline.currentPhase.index === 3 || timeline.currentPhase.index === 5) && (
                    <g transform={`translate(${rearExitX + 12}, ${rearExitY + 26})`}>
                      <rect
                        x="0"
                        y="-12"
                        width="192"
                        height="32"
                        rx="4"
                        fill="#0E1522"
                        stroke="#475569"
                        strokeWidth="1"
                      />
                      <text
                        x="8"
                        y="1"
                        fill="#E6EDF3"
                        fontSize="9"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        Plate Walk-Off Δs + Rear AR Face
                      </text>
                      <text
                        x="8"
                        y="13"
                        fill="#94A3B8"
                        fontSize="8.5"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        Residual ghost ray (&lt;0.5% w/ AR)
                      </text>
                    </g>
                  )}
                </g>
              )}

              {/* 3. TRANSMITTED PASSBAND PATH (Rightward to 0 deg port) */}
              <line
                x1={rearExitX}
                y1={rearExitY}
                x2={transEndX}
                y2={transEndY}
                stroke={transmittedColor}
                strokeWidth="12"
                strokeOpacity="0.09"
              />
              <path
                d={buildCoherentWavePath({
                  x1: rearExitX,
                  y1: rearExitY,
                  x2: transEndX,
                  y2: transEndY,
                  wavelengthPx: transmittedWavelengthPx,
                  amplitudePx: 7 * Math.sqrt(spectralData.energySummary.transmittedFraction + 0.35),
                  phaseRad: timeline.wavePhaseRad * (filterMode === 'longpass' ? 0.85 : 1.35),
                  revealRatio: timeline.splitBeamReveal,
                })}
                fill="none"
                stroke={transmittedColor}
                strokeWidth="2.5"
              />
            </g>

            {/* ACT 1 & ACT 3 CAUSAL PATHWAY CALLOUT LABELS */}
            <g>
              {/* Incident Callout */}
              <g transform={`translate(185, ${cy - 54})`}>
                <rect
                  x="0"
                  y="0"
                  width="195"
                  height="34"
                  rx="4"
                  fill="#111826"
                  fillOpacity="0.9"
                  stroke="#283B5B"
                  strokeWidth="1"
                />
                <text
                  x="10"
                  y="14"
                  fill="#E6EDF3"
                  fontSize="9.5"
                  fontWeight="600"
                  fontFamily="Space Grotesk, sans-serif"
                >
                  Mixed Polychromatic Input
                </text>
                <text
                  x="10"
                  y="26"
                  fill="#94A3B8"
                  fontSize="8.5"
                  fontFamily="JetBrains Mono, monospace"
                >
                  Co-propagating λ_short + λ_long
                </text>
              </g>

              {/* Reflected Callout */}
              <g transform={`translate(${cx - 218}, 95)`}>
                <rect
                  x="0"
                  y="0"
                  width="196"
                  height="36"
                  rx="4"
                  fill="#111826"
                  fillOpacity="0.92"
                  stroke={reflectedColor}
                  strokeWidth="1"
                  strokeOpacity="0.6"
                />
                <text
                  x="10"
                  y="14"
                  fill={reflectedColor}
                  fontSize="9.5"
                  fontWeight="600"
                  fontFamily="Space Grotesk, sans-serif"
                >
                  {reflectedLabel}
                </text>
                <text
                  x="10"
                  y="27"
                  fill="#94A3B8"
                  fontSize="8.5"
                  fontFamily="JetBrains Mono, monospace"
                >
                  Constructive in-phase reflection
                </text>
              </g>

              {/* Transmitted Callout */}
              <g transform={`translate(605, ${transEndY - 62})`}>
                <rect
                  x="0"
                  y="0"
                  width="206"
                  height="36"
                  rx="4"
                  fill="#111826"
                  fillOpacity="0.92"
                  stroke={transmittedColor}
                  strokeWidth="1"
                  strokeOpacity="0.6"
                />
                <text
                  x="10"
                  y="14"
                  fill={transmittedColor}
                  fontSize="9.5"
                  fontWeight="600"
                  fontFamily="Space Grotesk, sans-serif"
                >
                  {transmittedLabel}
                </text>
                <text
                  x="10"
                  y="27"
                  fill="#94A3B8"
                  fontSize="8.5"
                  fontFamily="JetBrains Mono, monospace"
                >
                  Destructive R(λ) → Forward T(λ)
                </text>
              </g>
            </g>

            {/* ACT 5 OVERLAY: Angular Acceptance Cone & Design Boundaries */}
            {timeline.boundaryOverlayStrength > 0.18 && (
              <g opacity={timeline.boundaryOverlayStrength}>
                {/* Angular Acceptance Cone on Input Beam */}
                <polygon
                  points={`${inStartX},${inStartY} ${cx},${cy - 28} ${cx},${cy + 28}`}
                  fill="#9D4EDD"
                  fillOpacity="0.08"
                  stroke="#9D4EDD"
                  strokeWidth="1"
                  strokeDasharray="4 3"
                />
                {/* Shifted Reflected Cone */}
                <line
                  x1={cx}
                  y1={cy}
                  x2={cx + Math.cos(reflAngleRad - 0.14) * 190}
                  y2={cy + Math.sin(reflAngleRad - 0.14) * 190}
                  stroke="#9D4EDD"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />
                <line
                  x1={cx}
                  y1={cy}
                  x2={cx + Math.cos(reflAngleRad + 0.14) * 190}
                  y2={cy + Math.sin(reflAngleRad + 0.14) * 190}
                  stroke="#9D4EDD"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />

                <g transform={`translate(${cx - 145}, ${cy + 118})`}>
                  <rect
                    x="0"
                    y="0"
                    width="315"
                    height="52"
                    rx="6"
                    fill="#141126"
                    stroke="#9D4EDD"
                    strokeWidth="1.4"
                  />
                  <text
                    x="12"
                    y="17"
                    fill="#E6EDF3"
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="Space Grotesk, sans-serif"
                  >
                    DESIGN DEPENDENCE BOUNDARY (AOI = {effectiveAoi}°)
                  </text>
                  <text
                    x="12"
                    y="31"
                    fill="#C77DFF"
                    fontSize="9"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    • Oblique AOI shifts cutoff edge: λ_θ = λ_0 √(1 - (sin θ / n_eff)²)
                  </text>
                  <text
                    x="12"
                    y="44"
                    fill="#94A3B8"
                    fontSize="8.5"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    • S-Pol (TE) &amp; P-Pol (TM) admittance diverge at non-normal incidence
                  </text>
                </g>
              </g>
            )}

            {/* Leader Line from Active Dichroic Surface to Magnified Thin-Film Cutaway Inset */}
            {timeline.microInsetStrength > 0.08 && (
              <g opacity={timeline.microInsetStrength}>
                <circle
                  cx={cx}
                  cy={cy}
                  r="22"
                  fill="none"
                  stroke="#9D4EDD"
                  strokeWidth="1.8"
                  strokeDasharray="4 2"
                />
                <line
                  x1={cx - 16}
                  y1={cy + 15}
                  x2="290"
                  y2="415"
                  stroke="#9D4EDD"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
              </g>
            )}
          </g>

          {/* =======================================================================
              HUD INSET 1 (Bottom-Left): Magnified Thin-Film Interference Cutaway
              Highlighted strongly in Act 2 (Frames 150-299) and retained for context
             ======================================================================= */}
          <g
            transform="translate(20, 395)"
            opacity={Math.max(0.45, timeline.microInsetStrength)}
          >
            <rect
              x="0"
              y="0"
              width="320"
              height="185"
              rx="8"
              fill="#0E1524"
              fillOpacity="0.95"
              stroke={timeline.currentPhase.index === 2 ? '#9D4EDD' : '#283B5B'}
              strokeWidth={timeline.currentPhase.index === 2 ? '2' : '1.2'}
            />
            <rect
              x="0"
              y="0"
              width="320"
              height="24"
              rx="8"
              fill="#162032"
            />
            <text
              x="10"
              y="16"
              fill="#E6EDF3"
              fontSize="10"
              fontWeight="700"
              fontFamily="JetBrains Mono, monospace"
            >
              SECTIONAL CUTAWAY: QUARTER-WAVE STACK (SCHEMATIC)
            </text>

            {/* Alternating High/Low Index Layers */}
            <g transform="translate(16, 34)">
              <text
                x="0"
                y="10"
                fill="#94A3B8"
                fontSize="8.5"
                fontFamily="JetBrains Mono, monospace"
              >
                Incident Medium (Air, n₀ ≈ 1.00)
              </text>

              {[
                { label: 'Layer 1: High-Index (n_H, e.g. TiO₂/Ta₂O₅)', color: '#9D4EDD', y: 18 },
                { label: 'Layer 2: Low-Index (n_L, e.g. SiO₂)', color: '#00E5FF', y: 38 },
                { label: 'Layer 3: High-Index (n_H, n·d·cosθ = λ₀/4)', color: '#9D4EDD', y: 58 },
                { label: 'Layer 4: Low-Index (n_L, n·d·cosθ = λ₀/4)', color: '#00E5FF', y: 78 },
              ].map((layer, idx) => (
                <g key={idx} transform={`translate(0, ${layer.y})`}>
                  <rect
                    x="0"
                    y="0"
                    width="182"
                    height="18"
                    fill={layer.color}
                    fillOpacity={idx % 2 === 0 ? '0.28' : '0.18'}
                    stroke={layer.color}
                    strokeWidth="1"
                  />
                  <text
                    x="6"
                    y="12"
                    fill="#E6EDF3"
                    fontSize="8"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {layer.label}
                  </text>
                  {/* Partial Fresnel reflection wavelet at boundary */}
                  <circle
                    cx={25 + idx * 24}
                    cy="0"
                    r="2.5"
                    fill={reflectedColor}
                  />
                  <path
                    d={`M ${25 + idx * 24} 0 L ${12 + idx * 24} -14`}
                    stroke={reflectedColor}
                    strokeWidth="1.4"
                    markerEnd={
                      filterMode === 'longpass' ? 'url(#arrowCyan)' : 'url(#arrowGold)'
                    }
                  />
                </g>
              ))}

              {/* Glass Substrate Base */}
              <rect
                x="0"
                y="98"
                width="182"
                height="24"
                fill="#1E293B"
                stroke="#64748B"
                strokeWidth="1"
              />
              <text
                x="6"
                y="113"
                fill="#94A3B8"
                fontSize="8"
                fontFamily="JetBrains Mono, monospace"
              >
                Optical Substrate (n_sub ≈ 1.46–1.52)
              </text>

              {/* Phase Superposition Math Box (Right side of inset) */}
              <g transform="translate(192, 16)">
                <rect
                  x="0"
                  y="0"
                  width="100"
                  height="106"
                  rx="4"
                  fill="#0B1019"
                  stroke="#283B5B"
                  strokeWidth="1"
                />
                <text
                  x="8"
                  y="15"
                  fill="#C77DFF"
                  fontSize="8.5"
                  fontWeight="700"
                  fontFamily="JetBrains Mono, monospace"
                >
                  PHASE CONDITION
                </text>
                <text
                  x="8"
                  y="30"
                  fill="#E6EDF3"
                  fontSize="8"
                  fontFamily="JetBrains Mono, monospace"
                >
                  OPD = 2·n·d·cos(θ)
                </text>
                <text
                  x="8"
                  y="44"
                  fill="#00E5FF"
                  fontSize="8"
                  fontFamily="JetBrains Mono, monospace"
                >
                  Stopband: Δφ = 2πm
                </text>
                <text
                  x="8"
                  y="56"
                  fill="#94A3B8"
                  fontSize="7.5"
                  fontFamily="JetBrains Mono, monospace"
                >
                  In-phase reflections sum
                </text>
                <text
                  x="8"
                  y="73"
                  fill="#FFD166"
                  fontSize="8"
                  fontFamily="JetBrains Mono, monospace"
                >
                  Passband: Δφ ≈ (2m+1)π
                </text>
                <text
                  x="8"
                  y="85"
                  fill="#94A3B8"
                  fontSize="7.5"
                  fontFamily="JetBrains Mono, monospace"
                >
                  Reflections cancel
                </text>
                <text
                  x="8"
                  y="99"
                  fill="#64748B"
                  fontSize="7"
                  fontFamily="JetBrains Mono, monospace"
                >
                  Scale: ~25,000× schematic
                </text>
              </g>
            </g>
          </g>

          {/* =======================================================================
              HUD INSET 2 (Bottom-Right): Qualitative Spectral Transfer Plot
              Highlighted in Act 4 (Frames 510-749) & Act 5 (Frames 750-1019)
             ======================================================================= */}
          <g
            transform="translate(612, 395)"
            opacity={Math.max(0.55, timeline.spectralOverlayStrength)}
          >
            <rect
              x="0"
              y="0"
              width="328"
              height="185"
              rx="8"
              fill="#0E1524"
              fillOpacity="0.95"
              stroke={
                timeline.currentPhase.index >= 4 ? '#00E5FF' : '#283B5B'
              }
              strokeWidth={timeline.currentPhase.index >= 4 ? '2' : '1.2'}
            />
            <rect x="0" y="0" width="328" height="24" rx="8" fill="#162032" />
            <text
              x="10"
              y="16"
              fill="#E6EDF3"
              fontSize="10"
              fontWeight="700"
              fontFamily="JetBrains Mono, monospace"
            >
              QUALITATIVE SPECTRAL RESPONSE (NON-NUMERICAL)
            </text>

            {/* Plot Area */}
            <g transform="translate(16, 34)">
              {/* Grid lines */}
              <line x1="0" y1="0" x2="0" y2={graphH} stroke="#475569" strokeWidth="1" />
              <line
                x1="0"
                y1={graphH}
                x2={graphW}
                y2={graphH}
                stroke="#475569"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1={graphH * 0.5}
                x2={graphW}
                y2={graphH * 0.5}
                stroke="#1E293B"
                strokeWidth="1"
                strokeDasharray="3 3"
              />

              {/* Nominal Cutoff Marker Line */}
              <line
                x1={toGraphX(spectralData.activeCutoff)}
                y1="0"
                x2={toGraphX(spectralData.activeCutoff)}
                y2={graphH}
                stroke="#9D4EDD"
                strokeWidth="1.4"
                strokeDasharray="3 2"
              />
              <text
                x={Math.min(graphW - 42, Math.max(8, toGraphX(spectralData.activeCutoff) + 4))}
                y="11"
                fill="#C77DFF"
                fontSize="8"
                fontFamily="JetBrains Mono, monospace"
              >
                λ_cutoff(θ)
              </text>

              {/* Incident Broadband Envelope (Muted Dashed) */}
              <polyline
                fill="none"
                stroke="#64748B"
                strokeWidth="1.3"
                strokeDasharray="2 2"
                points={incidentPolyline}
              />

              {/* S-Pol and P-Pol Split Ghost Curves (Visible in Act 5 or when Unpolarized) */}
              {(timeline.polarizationSplitVisibility > 0.1 || polarization === 'unpolarized') && (
                <g opacity="0.65">
                  <polyline
                    fill="none"
                    stroke="#C77DFF"
                    strokeWidth="1.2"
                    strokeDasharray="4 2"
                    points={sPolPolyline}
                  />
                  <polyline
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="1.2"
                    strokeDasharray="2 3"
                    points={pPolPolyline}
                  />
                </g>
              )}

              {/* Active Reflected Curve R(λ) */}
              <polyline
                fill="none"
                stroke={reflectedColor}
                strokeWidth="2.2"
                points={reflectedPolyline}
              />

              {/* Active Transmitted Curve T(λ) */}
              <polyline
                fill="none"
                stroke={transmittedColor}
                strokeWidth="2.2"
                points={transmittedPolyline}
              />

              {/* Axis Labels */}
              <text
                x="2"
                y={graphH + 12}
                fill="#00E5FF"
                fontSize="8"
                fontFamily="JetBrains Mono, monospace"
              >
                ← Shorter λ
              </text>
              <text
                x={graphW * 0.5}
                y={graphH + 12}
                textAnchor="middle"
                fill="#94A3B8"
                fontSize="8"
                fontFamily="JetBrains Mono, monospace"
              >
                Qualitative Wavelength Axis (λ)
              </text>
              <text
                x={graphW - 2}
                y={graphH + 12}
                textAnchor="end"
                fill="#FFD166"
                fontSize="8"
                fontFamily="JetBrains Mono, monospace"
              >
                Longer λ →
              </text>

              {/* Legend Row */}
              <g transform={`translate(0, ${graphH + 25})`}>
                <line x1="0" y1="-3" x2="12" y2="-3" stroke={transmittedColor} strokeWidth="2.2" />
                <text x="16" y="0" fill="#E6EDF3" fontSize="8" fontFamily="JetBrains Mono, monospace">
                  T(λ) Passband
                </text>

                <line x1="92" y1="-3" x2="104" y2="-3" stroke={reflectedColor} strokeWidth="2.2" />
                <text x="108" y="0" fill="#E6EDF3" fontSize="8" fontFamily="JetBrains Mono, monospace">
                  R(λ) Stopband
                </text>

                <line
                  x1="186"
                  y1="-3"
                  x2="198"
                  y2="-3"
                  stroke="#C77DFF"
                  strokeWidth="1.4"
                  strokeDasharray="3 2"
                />
                <text x="202" y="0" fill="#C77DFF" fontSize="8" fontFamily="JetBrains Mono, monospace">
                  S/P Split (TE/TM)
                </text>
              </g>
            </g>
          </g>

          {/* =======================================================================
              TOP-LEFT SCALE, CAUSALITY & CONSERVATION HUD BADGE
             ======================================================================= */}
          <g transform="translate(20, 18)">
            <rect
              x="0"
              y="0"
              width="310"
              height="74"
              rx="6"
              fill="#0E1524"
              fillOpacity="0.88"
              stroke="#1E2D45"
              strokeWidth="1"
            />
            <text
              x="10"
              y="16"
              fill="#9D4EDD"
              fontSize="9"
              fontWeight="700"
              fontFamily="JetBrains Mono, monospace"
            >
              SCALE &amp; CONSERVATION METADATA
            </text>
            <text
              x="10"
              y="31"
              fill="#E6EDF3"
              fontSize="8.5"
              fontFamily="JetBrains Mono, monospace"
            >
              • Motion: Slowed ~10¹⁴× | Stack Inset: ~25,000×
            </text>
            <text
              x="10"
              y="45"
              fill="#94A3B8"
              fontSize="8.5"
              fontFamily="JetBrains Mono, monospace"
            >
              • Energy Balance: R(λ) + T(λ) + A_loss(λ) = 1.00
            </text>
            <text
              x="10"
              y="60"
              fill="#00E5FF"
              fontSize="8.5"
              fontFamily="JetBrains Mono, monospace"
            >
              • Split Flux: T={(spectralData.energySummary.transmittedFraction * 100).toFixed(0)}% | R=
              {(spectralData.energySummary.reflectedFraction * 100).toFixed(0)}% | Loss/Ghost=
              {(spectralData.energySummary.ghostAndLossFraction * 100).toFixed(1)}%
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};
