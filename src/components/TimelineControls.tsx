import React, { useEffect, useRef } from 'react';
import { animate } from 'motion';
import {
  FastForward,
  Pause,
  Play,
  Rewind,
  RotateCcw,
  Sliders,
  Sparkles,
  Layers,
} from 'lucide-react';
import {
  CoatingFilterMode,
  FPS,
  GeometryArchitecture,
  InterpolatedTimelineState,
  PolarizationMode,
  TIMELINE_PHASES,
  TOTAL_FRAMES,
} from '../data/beamsplitterTimeline';

interface TimelineControlsProps {
  timeline: InterpolatedTimelineState;
  isPlaying: boolean;
  playbackSpeed: number;
  onTogglePlay: () => void;
  onSeekFrame: (frame: number) => void;
  onChangeSpeed: (speed: number) => void;
  filterMode: CoatingFilterMode;
  onChangeFilterMode: (mode: CoatingFilterMode) => void;
  architecture: GeometryArchitecture;
  onChangeArchitecture: (arch: GeometryArchitecture) => void;
  polarization: PolarizationMode;
  onChangePolarization: (pol: PolarizationMode) => void;
  userAoiDeg: number;
  onChangeUserAoiDeg: (deg: number) => void;
  onOpenSpecModal: () => void;
}

/**
 * Pattern B: Value interpolator / Animated Counter using Motion core animate()
 */
const AnimatedValueCounter: React.FC<{ value: number; suffix?: string; decimals?: number }> = ({
  value,
  suffix = '',
  decimals = 0,
}) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const prevValueRef = useRef<number>(value);

  useEffect(() => {
    const node = spanRef.current;
    if (!node) return;
    const fromVal = prevValueRef.current;
    prevValueRef.current = value;

    const controls = animate(fromVal, value, {
      duration: 0.18,
      ease: 'easeOut',
      onUpdate: (latest) => {
        node.textContent = `${latest.toFixed(decimals)}${suffix}`;
      },
    });

    return () => controls.stop();
  }, [value, suffix, decimals]);

  return (
    <span ref={spanRef} className="font-mono-tech tabular-nums">
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
};

export const TimelineControls: React.FC<TimelineControlsProps> = ({
  timeline,
  isPlaying,
  playbackSpeed,
  onTogglePlay,
  onSeekFrame,
  onChangeSpeed,
  filterMode,
  onChangeFilterMode,
  architecture,
  onChangeArchitecture,
  polarization,
  onChangePolarization,
  userAoiDeg,
  onChangeUserAoiDeg,
  onOpenSpecModal,
}) => {
  return (
    <div className="space-y-4">
      {/* Primary Frame-Locked Scrubber & Transport Deck */}
      <div className="glass-panel rounded-xl p-4 shadow-xl">
        {/* Phase Segment Bar (5 Acts across 1,020 frames) */}
        <div className="mb-3 grid grid-cols-1 gap-1.5 sm:grid-cols-5">
          {TIMELINE_PHASES.map((phase) => {
            const isActive = timeline.currentPhase.id === phase.id;
            const isPast = timeline.frame > phase.endFrame;
            return (
              <button
                key={phase.id}
                type="button"
                onClick={() => onSeekFrame(phase.startFrame)}
                className={`group relative flex flex-col items-start rounded-lg border px-2.5 py-2 text-left transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#00E5FF] bg-[#00E5FF]/12 text-[#E6EDF3]'
                    : isPast
                      ? 'border-[#283B5B] bg-[#131C2B]/80 text-[#94A3B8] hover:border-[#00E5FF]/50'
                      : 'border-[#1E2D45] bg-[#0E1522]/70 text-[#64748B] hover:border-[#283B5B]'
                }`}
              >
                <div className="flex w-full items-center justify-between font-mono-tech text-[10px]">
                  <span className={isActive ? 'text-[#00E5FF] font-bold' : 'text-[#94A3B8]'}>
                    ACT {phase.index} ({phase.startTimeSec}–{phase.endTimeSec}s)
                  </span>
                  <span>
                    F{phase.startFrame}–{phase.endFrame}
                  </span>
                </div>
                <div className="mt-0.5 line-clamp-1 text-xs font-semibold text-[#E6EDF3]">
                  {phase.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Continuous Frame Range Input (0 to 1019) */}
        <div className="relative mb-3">
          <label htmlFor="frame-scrubber" className="sr-only">
            Timeline Frame Scrubber (0 to 1019)
          </label>
          <input
            id="frame-scrubber"
            type="range"
            min={0}
            max={TOTAL_FRAMES - 1}
            step={1}
            value={timeline.frame}
            onChange={(e) => onSeekFrame(Number(e.target.value))}
            className="h-2.5 w-full cursor-pointer appearance-none rounded-lg bg-[#162032] accent-[#00E5FF]"
          />
          <div className="mt-1 flex justify-between font-mono-tech text-[10px] text-[#64748B]">
            <span>Frame 0 (0.0s)</span>
            <span>Frame 150 (5.0s)</span>
            <span>Frame 300 (10.0s)</span>
            <span>Frame 510 (17.0s)</span>
            <span>Frame 750 (25.0s)</span>
            <span>Frame 1019 (34.0s)</span>
          </div>
        </div>

        {/* Transport Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onTogglePlay}
              className="inline-flex items-center gap-2 rounded-lg bg-[#00E5FF] px-4 py-2 text-xs font-bold text-[#0B1019] transition hover:bg-[#38BDF8] cursor-pointer"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? 'PAUSE' : 'PLAY 30 FPS'}
            </button>

            <button
              type="button"
              onClick={() => onSeekFrame(0)}
              title="Reset to Frame 0"
              className="inline-flex items-center gap-1 rounded-lg border border-[#283B5B] bg-[#131C2B] px-2.5 py-2 text-xs text-[#E6EDF3] hover:border-[#00E5FF] cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[#00E5FF]" />
              Reset
            </button>

            <button
              type="button"
              onClick={() => onSeekFrame(Math.max(0, timeline.frame - 30))}
              title="Step Back 1 Second (30 Frames)"
              className="inline-flex items-center gap-1 rounded-lg border border-[#283B5B] bg-[#131C2B] px-2.5 py-2 text-xs text-[#94A3B8] hover:text-[#E6EDF3] cursor-pointer"
            >
              <Rewind className="h-3.5 w-3.5" />
              -30f
            </button>

            <button
              type="button"
              onClick={() => onSeekFrame(Math.max(0, timeline.frame - 1))}
              title="Step Back 1 Frame"
              className="rounded-lg border border-[#283B5B] bg-[#131C2B] px-2.5 py-2 font-mono-tech text-xs text-[#94A3B8] hover:text-[#E6EDF3] cursor-pointer"
            >
              -1f
            </button>

            <button
              type="button"
              onClick={() => onSeekFrame(Math.min(TOTAL_FRAMES - 1, timeline.frame + 1))}
              title="Step Forward 1 Frame"
              className="rounded-lg border border-[#283B5B] bg-[#131C2B] px-2.5 py-2 font-mono-tech text-xs text-[#94A3B8] hover:text-[#E6EDF3] cursor-pointer"
            >
              +1f
            </button>

            <button
              type="button"
              onClick={() => onSeekFrame(Math.min(TOTAL_FRAMES - 1, timeline.frame + 30))}
              title="Step Forward 1 Second (30 Frames)"
              className="inline-flex items-center gap-1 rounded-lg border border-[#283B5B] bg-[#131C2B] px-2.5 py-2 text-xs text-[#94A3B8] hover:text-[#E6EDF3] cursor-pointer"
            >
              +30f
              <FastForward className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Speed & Deterministic Readout */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg border border-[#283B5B] bg-[#0E1522] p-1 text-xs">
              {[0.5, 1, 1.5, 2].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => onChangeSpeed(spd)}
                  className={`rounded px-2 py-1 font-mono-tech text-[11px] transition cursor-pointer ${
                    playbackSpeed === spd
                      ? 'bg-[#9D4EDD] font-bold text-white'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {spd}×
                </button>
              ))}
            </div>

            <div className="rounded-lg border border-[#283B5B] bg-[#0E1522] px-3 py-1.5 text-xs text-[#94A3B8]">
              Elapsed:{' '}
              <span className="font-bold text-[#00E5FF]">
                <AnimatedValueCounter value={timeline.timeSec} decimals={2} suffix="s" />
              </span>{' '}
              / 34.00s ({FPS} fps)
            </div>
          </div>
        </div>
      </div>

      {/* Physical Parameter Bench (Interactive Overrides for Coating, Geometry, AOI, Polarization) */}
      <div className="glass-panel rounded-xl p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#1E2D45] pb-2.5">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-[#9D4EDD]" />
            <h2 className="text-sm font-bold text-[#E6EDF3]">
              Optical Bench Parameter Controls (Real-Time Physical Dependence)
            </h2>
          </div>
          <button
            type="button"
            onClick={onOpenSpecModal}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#FFD166]/50 bg-[#FFD166]/10 px-3 py-1 text-xs font-semibold text-[#FFD166] transition hover:bg-[#FFD166]/20 cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Configure Custom Dichroic Spec / RFQ Checklist
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* 1. Coating Passband Type */}
          <div className="rounded-lg border border-[#1E2D45] bg-[#0E1522]/90 p-3">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-semibold text-[#94A3B8]">1. Spectral Coating Mode</span>
              <Layers className="h-3.5 w-3.5 text-[#00E5FF]" />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => onChangeFilterMode('longpass')}
                className={`rounded px-2.5 py-1.5 font-mono-tech text-xs transition cursor-pointer ${
                  filterMode === 'longpass'
                    ? 'border border-[#FFD166] bg-[#FFD166]/15 font-bold text-[#FFD166]'
                    : 'border border-[#283B5B] bg-[#131C2B] text-[#94A3B8]'
                }`}
              >
                Longpass (T: Long λ)
              </button>
              <button
                type="button"
                onClick={() => onChangeFilterMode('shortpass')}
                className={`rounded px-2.5 py-1.5 font-mono-tech text-xs transition cursor-pointer ${
                  filterMode === 'shortpass'
                    ? 'border border-[#00E5FF] bg-[#00E5FF]/15 font-bold text-[#00E5FF]'
                    : 'border border-[#283B5B] bg-[#131C2B] text-[#94A3B8]'
                }`}
              >
                Shortpass (T: Short λ)
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-[#64748B]">
              Swaps quarter-wave stack stopband vs. passband assignment.
            </p>
          </div>

          {/* 2. Substrate Architecture */}
          <div className="rounded-lg border border-[#1E2D45] bg-[#0E1522]/90 p-3">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-semibold text-[#94A3B8]">2. Substrate Geometry</span>
              <span className="font-mono-tech text-[10px] text-[#9D4EDD]">EDMUND REF</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => onChangeArchitecture('plate')}
                className={`rounded px-2.5 py-1.5 font-mono-tech text-xs transition cursor-pointer ${
                  architecture === 'plate'
                    ? 'border border-[#00E5FF] bg-[#00E5FF]/15 font-bold text-[#00E5FF]'
                    : 'border border-[#283B5B] bg-[#131C2B] text-[#94A3B8]'
                }`}
              >
                45° Plate Optic
              </button>
              <button
                type="button"
                onClick={() => onChangeArchitecture('cube')}
                className={`rounded px-2.5 py-1.5 font-mono-tech text-xs transition cursor-pointer ${
                  architecture === 'cube'
                    ? 'border border-[#9D4EDD] bg-[#9D4EDD]/20 font-bold text-[#C77DFF]'
                    : 'border border-[#283B5B] bg-[#131C2B] text-[#94A3B8]'
                }`}
              >
                Cemented Cube
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-[#64748B]">
              Plate shows Snell walk-off Δs &amp; rear AR; Cube eliminates walk-off.
            </p>
          </div>

          {/* 3. Polarization State */}
          <div className="rounded-lg border border-[#1E2D45] bg-[#0E1522]/90 p-3">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-semibold text-[#94A3B8]">3. Input Polarization</span>
              <span className="font-mono-tech text-[10px] text-[#C77DFF]">TE / TM</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {(
                [
                  { id: 'unpolarized', label: 'Unpol' },
                  { id: 's-polarized', label: 'S-Pol (TE)' },
                  { id: 'p-polarized', label: 'P-Pol (TM)' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChangePolarization(item.id)}
                  className={`rounded px-1.5 py-1.5 font-mono-tech text-[11px] transition cursor-pointer ${
                    polarization === item.id
                      ? 'border border-[#9D4EDD] bg-[#9D4EDD]/25 font-bold text-white'
                      : 'border border-[#283B5B] bg-[#131C2B] text-[#94A3B8]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-[#64748B]">
              Oblique incidence splits s-pol and p-pol cutoff wavelengths.
            </p>
          </div>

          {/* 4. Nominal Angle of Incidence (AOI) */}
          <div className="rounded-lg border border-[#1E2D45] bg-[#0E1522]/90 p-3">
            <div className="mb-1 flex items-center justify-between text-xs">
              <label htmlFor="aoi-slider" className="font-semibold text-[#94A3B8]">
                4. Nominal Angle (AOI)
              </label>
              <span className="font-mono-tech font-bold text-[#00E5FF]">{userAoiDeg}°</span>
            </div>
            <input
              id="aoi-slider"
              type="range"
              min={30}
              max={60}
              step={1}
              value={userAoiDeg}
              onChange={(e) => onChangeUserAoiDeg(Number(e.target.value))}
              className="mt-1 h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#162032] accent-[#9D4EDD]"
            />
            <div className="mt-1 flex justify-between font-mono-tech text-[10px] text-[#64748B]">
              <span>30° (Red-Shift)</span>
              <span>45° Design</span>
              <span>60° (Blue-Shift)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
