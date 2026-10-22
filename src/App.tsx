import { useEffect, useMemo, useRef, useState } from 'react';
import { animate } from 'motion';
import {
  AlertTriangle,
  BookOpen,
  Compass,
  ExternalLink,
  FileText,
  Gauge,
  Layers,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import {
  CoatingFilterMode,
  computeQualitativeSpectrum,
  computeTimelineState,
  FPS,
  GeometryArchitecture,
  PolarizationMode,
  TIMELINE_PHASES,
  TOTAL_FRAMES,
} from './data/beamsplitterTimeline';
import { AnatomyStage } from './components/AnatomyStage';
import { TimelineControls } from './components/TimelineControls';
import { SpecRequestModal } from './components/SpecRequestModal';

const TICKER_ITEMS = [
  'VERTICAL: PRECISION OPTICAL COMPONENTS',
  'TIMELINE: 34.00s @ 30 FPS (1,020 DETERMINISTIC FRAMES 0–1019)',
  'STAGE PALETTE: #0B1019 TECHNICAL STAGE | #00E5FF SIGNAL | #FFD166 ENERGY | #9D4EDD DIELECTRIC STACK',
  'OPTICAL CONDITION: n · d · cos(θ) = λ₀ / 4 QUARTER-WAVE INTERFERENCE',
  'LIMITATIONS: WAVELENGTH, AOI, COATING & POLARIZATION DEPENDENT. NO PERFECT SPLIT OR ZERO LOSS',
];

export function App() {
  const [frame, setFrame] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  const [filterMode, setFilterMode] = useState<CoatingFilterMode>('longpass');
  const [architecture, setArchitecture] = useState<GeometryArchitecture>('plate');
  const [polarization, setPolarization] = useState<PolarizationMode>('unpolarized');
  const [userAoiDeg, setUserAoiDeg] = useState<number>(45);
  const [isSpecModalOpen, setIsSpecModalOpen] = useState<boolean>(false);

  // Damped spring pointer follower (Pattern C from UI / Motion lane)
  const cursorDotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const dot = cursorDotRef.current;
      if (!dot) return;
      animate(
        dot,
        {
          transform: `translate3d(${e.clientX - 10}px, ${e.clientY - 10}px, 0)`,
        },
        {
          type: 'spring',
          stiffness: 420,
          damping: 28,
        }
      );
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  // Deterministic 30 fps playback loop
  useEffect(() => {
    if (!isPlaying) return;

    let animationFrameId: number;
    let lastTimestamp = performance.now();
    const frameIntervalMs = 1000 / (FPS * playbackSpeed);
    let accumulator = 0;

    const tick = (now: number) => {
      const delta = now - lastTimestamp;
      lastTimestamp = now;
      accumulator += delta;

      if (accumulator >= frameIntervalMs) {
        const framesToAdvance = Math.max(1, Math.floor(accumulator / frameIntervalMs));
        accumulator = accumulator % frameIntervalMs;
        setFrame((prev) => (prev + framesToAdvance) % TOTAL_FRAMES);
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, playbackSpeed]);

  const timeline = useMemo(() => computeTimelineState(frame), [frame]);

  const effectiveAoi = useMemo(
    () => Math.round((userAoiDeg + timeline.aoISweepDeg) * 10) / 10,
    [userAoiDeg, timeline.aoISweepDeg]
  );

  const spectralData = useMemo(
    () =>
      computeQualitativeSpectrum({
        filterMode,
        architecture,
        polarization,
        nominalAoiDeg: effectiveAoi,
      }),
    [filterMode, architecture, polarization, effectiveAoi]
  );

  return (
    <div className="min-h-screen bg-[#0B1019] text-[#E6EDF3] relative">
      {/* Subtle Damped Spring Pointer Follower (Desktop only, non-blocking) */}
      <div
        ref={cursorDotRef}
        style={{ willChange: 'transform' }}
        className="pointer-events-none fixed top-0 left-0 z-50 hidden h-5 w-5 rounded-full border border-[#00E5FF]/45 bg-[#00E5FF]/10 lg:block"
      />

      {/* Pattern A: Zero-maintenance Infinite Marquee Telemetry Header */}
      <div className="overflow-hidden border-b border-[#1E2D45] bg-[#080C14] py-1.5 text-[11px] font-mono-tech text-[#94A3B8]">
        <div className="marquee-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
            <span key={idx} className="mx-6 inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00E5FF]" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Top Navigation & Identity Header */}
      <header className="border-b border-[#1E2D45] bg-[#0B1019]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#00E5FF]/40 bg-[#111826] shadow-inner">
              <Layers className="h-5 w-5 text-[#00E5FF]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono-tech text-[10px] font-bold uppercase tracking-widest text-[#00E5FF]">
                  Precision Optical Components
                </span>
                <span className="rounded bg-[#9D4EDD]/20 px-1.5 py-0.5 font-mono-tech text-[10px] text-[#C77DFF] border border-[#9D4EDD]/40">
                  1,020 Frames @ 30 fps
                </span>
              </div>
              <h1 className="text-lg font-bold tracking-tight text-[#E6EDF3] sm:text-xl">
                Dichroic Beamsplitter: Code-Driven Anatomy Explainer
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <a
              href="./visualization-Cursor.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#283B5B] bg-[#131C2B] px-3 py-1.5 font-medium text-[#E6EDF3] transition hover:border-[#00E5FF]"
            >
              <Compass className="h-3.5 w-3.5 text-[#00E5FF]" />
              Standalone Schematic HTML
            </a>
            <a
              href="./dashboard-Cursor.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#9D4EDD]/50 bg-[#9D4EDD]/15 px-3 py-1.5 font-medium text-[#E6EDF3] transition hover:bg-[#9D4EDD]/25"
            >
              <Gauge className="h-3.5 w-3.5 text-[#C77DFF]" />
              7-Theme Strategy Dashboard
            </a>
            <a
              href="#editorial-deep-dive"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#00E5FF] px-3 py-1.5 font-bold text-[#0B1019] transition hover:bg-[#38BDF8]"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Read Technical Article
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6">
        {/* Primary Interactive Stage + Sidebar Inspector Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left 8 Columns: SVG Stage + Frame-Locked Scrubber */}
          <div className="space-y-4 lg:col-span-8">
            <AnatomyStage
              timeline={timeline}
              filterMode={filterMode}
              architecture={architecture}
              polarization={polarization}
              userAoiDeg={userAoiDeg}
              spectralData={spectralData}
            />

            <TimelineControls
              timeline={timeline}
              isPlaying={isPlaying}
              playbackSpeed={playbackSpeed}
              onTogglePlay={() => setIsPlaying((p) => !p)}
              onSeekFrame={(f) => {
                setIsPlaying(false);
                setFrame(f);
              }}
              onChangeSpeed={(spd) => setPlaybackSpeed(spd)}
              filterMode={filterMode}
              onChangeFilterMode={setFilterMode}
              architecture={architecture}
              onChangeArchitecture={setArchitecture}
              polarization={polarization}
              onChangePolarization={setPolarization}
              userAoiDeg={userAoiDeg}
              onChangeUserAoiDeg={setUserAoiDeg}
              onOpenSpecModal={() => setIsSpecModalOpen(true)}
            />
          </div>

          {/* Right 4 Columns: Causal Inspector, Active Callouts & Technical Boundaries */}
          <aside className="space-y-4 lg:col-span-4">
            {/* Active Act Inspector Card */}
            <div className="glass-panel rounded-xl p-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#1E2D45] pb-3">
                <div>
                  <span className="font-mono-tech text-[11px] font-bold text-[#00E5FF]">
                    FRAMES {timeline.currentPhase.startFrame}–{timeline.currentPhase.endFrame} |{' '}
                    {timeline.currentPhase.startTimeSec}–{timeline.currentPhase.endTimeSec}s
                  </span>
                  <h2 className="mt-0.5 text-base font-bold text-[#E6EDF3]">
                    Act {timeline.currentPhase.index}: {timeline.currentPhase.title}
                  </h2>
                </div>
                <span className="rounded-full bg-[#162032] px-2.5 py-1 font-mono-tech text-xs font-semibold text-[#FFD166] border border-[#283B5B]">
                  {Math.round(timeline.phaseLocalProgress * 100)}%
                </span>
              </div>

              <div className="mt-3.5 space-y-3 text-xs leading-relaxed">
                <div>
                  <div className="font-mono-tech text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                    Causal Stage Action
                  </div>
                  <p className="mt-1 text-[#E6EDF3]">{timeline.currentPhase.causalSummary}</p>
                </div>

                <div className="rounded-lg border border-[#1E2D45] bg-[#0B1019]/80 p-3">
                  <div className="font-mono-tech text-[10px] font-semibold uppercase tracking-wider text-[#9D4EDD]">
                    Underlying Physical Mechanism
                  </div>
                  <p className="mt-1 text-[#94A3B8]">{timeline.currentPhase.physicalMechanism}</p>
                </div>

                <div>
                  <div className="mb-1.5 font-mono-tech text-[10px] font-semibold uppercase tracking-wider text-[#00E5FF]">
                    Active Stage Callouts
                  </div>
                  <ul className="space-y-1.5">
                    {timeline.currentPhase.activeCallouts.map((callout, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 rounded border border-[#1E2D45] bg-[#0E1522] px-2.5 py-1.5 text-[11px] text-[#E6EDF3]"
                      >
                        <span className="mt-0.5 font-mono-tech text-[10px] font-bold text-[#00E5FF]">
                          0{idx + 1}
                        </span>
                        <span>{callout}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Scale, Time & Energy Accounting Card */}
            <div className="glass-panel rounded-xl p-5">
              <div className="mb-3 flex items-center gap-2 border-b border-[#1E2D45] pb-2.5">
                <Scale className="h-4 w-4 text-[#FFD166]" />
                <h3 className="text-sm font-bold text-[#E6EDF3]">
                  Scale, Time &amp; Conservation Ledger
                </h3>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="rounded-lg border border-[#1E2D45] bg-[#0E1522] p-2.5">
                  <span className="block font-mono-tech text-[10px] font-semibold text-[#00E5FF]">
                    SPATIAL SCALE DISCLOSURE
                  </span>
                  <span className="mt-0.5 block text-[#94A3B8]">
                    {timeline.currentPhase.scaleAndTimeNotes.spatialScale}
                  </span>
                </div>
                <div className="rounded-lg border border-[#1E2D45] bg-[#0E1522] p-2.5">
                  <span className="block font-mono-tech text-[10px] font-semibold text-[#FFD166]">
                    TEMPORAL CADENCE DISCLOSURE
                  </span>
                  <span className="mt-0.5 block text-[#94A3B8]">
                    {timeline.currentPhase.scaleAndTimeNotes.temporalScale}
                  </span>
                </div>
                <div className="rounded-lg border border-[#1E2D45] bg-[#0E1522] p-2.5">
                  <span className="block font-mono-tech text-[10px] font-semibold text-[#C77DFF]">
                    CONSERVATION OF ENERGY
                  </span>
                  <span className="mt-0.5 block text-[#94A3B8]">
                    {timeline.currentPhase.scaleAndTimeNotes.energyAccounting}
                  </span>
                </div>
              </div>
            </div>

            {/* Production Rules & Technical Limits Guardrail Card */}
            <div className="rounded-xl border border-[#FFD166]/35 bg-[#14131E] p-4 text-xs">
              <div className="flex items-center gap-2 font-bold text-[#FFD166]">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Technical Boundaries &amp; Reference Scope</span>
              </div>
              <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-[#94A3B8]">
                <li>
                  • <strong className="text-[#E6EDF3]">Design Dependence:</strong> Optical response
                  depends on wavelength, angle of incidence (AOI), coating stack, and s/p
                  polarization state.
                </li>
                <li>
                  • <strong className="text-[#E6EDF3]">No Idealized Claims:</strong> No physical
                  dichroic achieves a zero-width transition edge, zero absorption/scatter loss, or
                  universal bandwidth.
                </li>
                <li>
                  • <strong className="text-[#E6EDF3]">Explicit Schematic Scope:</strong> Layer count
                  and spectral curves are qualitative educational schematics, not a proprietary layer
                  recipe or measured datasheet.
                </li>
              </ul>
              <div className="mt-3 border-t border-[#283B5B] pt-2.5 flex flex-col gap-1.5">
                <span className="font-mono-tech text-[10px] font-semibold uppercase text-[#00E5FF]">
                  Reference Starting Points (Verify Before Release):
                </span>
                <a
                  href="https://www.edmundoptics.com/knowledge-center/application-notes/optics/what-are-beamsplitters/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-[#E6EDF3] underline decoration-[#00E5FF]/50 hover:text-[#00E5FF]"
                >
                  Edmund Optics: What Are Beamsplitters?
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href="https://www.edmundoptics.com/knowledge-center/application-notes/optics/introduction-to-optical-prisms/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-[#E6EDF3] underline decoration-[#00E5FF]/50 hover:text-[#00E5FF]"
                >
                  Edmund Optics: Introduction to Optical Prisms
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </aside>
        </div>

        {/* 5-Act Camera & Timing Breakdown Table */}
        <section className="glass-panel rounded-xl p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-mono-tech text-xs font-semibold uppercase tracking-wider text-[#00E5FF]">
                Deterministic Choreography Matrix
              </span>
              <h2 className="text-lg font-bold text-[#E6EDF3]">
                5-Act Camera &amp; Causal Timing Architecture (1,020 Frames @ 30 fps)
              </h2>
            </div>
            <span className="font-mono-tech text-xs text-[#94A3B8]">
              Click any row to lock playhead to that Act’s opening frame
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#283B5B] bg-[#0E1522] font-mono-tech text-[11px] text-[#94A3B8]">
                  <th className="py-3 px-3">Act</th>
                  <th className="py-3 px-3">Frame Window</th>
                  <th className="py-3 px-3">Time Window</th>
                  <th className="py-3 px-3">Narrative Focus</th>
                  <th className="py-3 px-3">Camera &amp; Cutaway Action</th>
                  <th className="py-3 px-3">Physical Mechanism Illustrated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2D45]">
                {TIMELINE_PHASES.map((phase) => {
                  const active = timeline.currentPhase.id === phase.id;
                  return (
                    <tr
                      key={phase.id}
                      onClick={() => {
                        setIsPlaying(false);
                        setFrame(phase.startFrame);
                      }}
                      className={`cursor-pointer transition ${
                        active ? 'bg-[#00E5FF]/10' : 'hover:bg-[#131C2B]/70'
                      }`}
                    >
                      <td className="py-3 px-3 font-mono-tech font-bold text-[#00E5FF]">
                        Act {phase.index}
                      </td>
                      <td className="py-3 px-3 font-mono-tech text-[#E6EDF3]">
                        {phase.startFrame}–{phase.endFrame}
                      </td>
                      <td className="py-3 px-3 font-mono-tech text-[#FFD166]">
                        {phase.startTimeSec}–{phase.endTimeSec}s
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#E6EDF3]">{phase.title}</td>
                      <td className="py-3 px-3 text-[#94A3B8]">{phase.causalSummary}</td>
                      <td className="py-3 px-3 text-[#94A3B8]">{phase.physicalMechanism}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Engineering Trade-Off Matrix: Plate vs. Cube Dichroic Beamsplitters */}
        <section className="glass-panel rounded-xl p-6">
          <div className="mb-4">
            <span className="font-mono-tech text-xs font-semibold uppercase tracking-wider text-[#9D4EDD]">
              Hardware Selection Matrix
            </span>
            <h2 className="text-lg font-bold text-[#E6EDF3]">
              Plate vs. Cube Dichroic Beamsplitter Architecture Trade-Offs
            </h2>
            <p className="mt-1 text-xs text-[#94A3B8]">
              Grounded in Edmund Optics application notes on beamsplitters and optical prisms. Select
              geometry based on collimation, laser fluence, ghosting sensitivity, and mechanical
              packaging.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#283B5B] bg-[#0E1522] font-mono-tech text-[11px] text-[#94A3B8]">
                  <th className="py-3 px-3">Decision Criterion</th>
                  <th className="py-3 px-3 text-[#00E5FF]">45° Dichroic Plate Beamsplitter</th>
                  <th className="py-3 px-3 text-[#C77DFF]">Cemented Dichroic Cube Beamsplitter</th>
                  <th className="py-3 px-3 text-[#FFD166]">System Design Consequence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2D45] text-[#94A3B8]">
                <tr>
                  <td className="py-3 px-3 font-semibold text-[#E6EDF3]">
                    Transmitted Beam Deviation (Walk-Off Δs)
                  </td>
                  <td className="py-3 px-3">
                    Refracts laterally by Δs = t · sin(θ₁ - θ₂) / cos(θ₂) due to finite plate
                    thickness t.
                  </td>
                  <td className="py-3 px-3">
                    Zero lateral walk-off at normal entrance/exit faces; symmetric optical path in
                    both arms.
                  </td>
                  <td className="py-3 px-3">
                    Plate drop-in insertion shifts downstream alignment; cube preserves coaxial
                    detector centering.
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-[#E6EDF3]">
                    Rear-Surface Ghost Reflection
                  </td>
                  <td className="py-3 px-3">
                    Present unless mitigated by a high-performance rear AR coating or wedged rear
                    substrate face.
                  </td>
                  <td className="py-3 px-3">
                    Hypotenuse coating is index-matched between prisms; exterior faces still require
                    AR coatings.
                  </td>
                  <td className="py-3 px-3">
                    In imaging paths, unmitigated plate ghost rays create secondary low-contrast
                    double images.
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-[#E6EDF3]">
                    Astigmatism in Converging/Diverging Beams
                  </td>
                  <td className="py-3 px-3">
                    Tilted plane-parallel plate introduces astigmatism and coma when placed in
                    non-collimated space.
                  </td>
                  <td className="py-3 px-3">
                    Lower asymmetric aberration at normal incidence, though spherical aberration
                    scales with glass path.
                  </td>
                  <td className="py-3 px-3">
                    Place plate dichroics strictly in infinity-corrected (collimated) optical spaces.
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-[#E6EDF3]">
                    High-Power Laser Damage Threshold (LIDT)
                  </td>
                  <td className="py-3 px-3">
                    High LIDT when refractory oxide coatings (TiO₂/SiO₂, Ta₂O₅/SiO₂) are deposited
                    on fused silica without organic adhesives.
                  </td>
                  <td className="py-3 px-3">
                    Standard optical cement layer on the hypotenuse limits CW power and pulsed laser
                    fluence (unless optically contacted).
                  </td>
                  <td className="py-3 px-3">
                    High-power laser combiners and pump-probe setups strongly favor dielectric plates.
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-[#E6EDF3]">
                    Mechanical Footprint &amp; Weight
                  </td>
                  <td className="py-3 px-3">
                    Thin, low-mass profile; lower thermal mass and minimal glass absorption path.
                  </td>
                  <td className="py-3 px-3">
                    Bulkier, heavier prism pair; easier to mount flush on flat reference surfaces.
                  </td>
                  <td className="py-3 px-3">
                    Filter-wheel turrets and compact fluorescence cubes typically standardize on
                    thin rectangular plates.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Full Embedded Editorial Article + Hero Visual Section */}
        <section id="editorial-deep-dive" className="glass-panel rounded-xl p-6 sm:p-8">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E2D45] pb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#00E5FF]" />
                <span className="font-mono-tech text-xs font-bold uppercase tracking-wider text-[#00E5FF]">
                  Senior Editor / Product / Developer-Writer Feature
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <a
                  href="./dichroic-beamsplitter-medium-article-Cursor.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FFD166] underline hover:text-white"
                >
                  Download Markdown (`-Cursor.md`)
                </a>
                <a
                  href="./dichroic-beamsplitter-medium-article-Claude.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#C77DFF] underline hover:text-white"
                >
                  Download Markdown (`-Claude.md`)
                </a>
              </div>
            </div>

            {/* Hero Image Figure */}
            <figure className="overflow-hidden rounded-xl border border-[#283B5B] bg-[#080C14]">
              <img
                src="./assets/dichroic-hero.png"
                alt="Hero technical illustration of a Dichroic Beamsplitter separating a mixed polychromatic beam into orthogonal cyan and gold wavelength channels across a violet dielectric thin-film stack"
                className="max-h-[420px] w-full object-cover"
                loading="lazy"
              />
              <figcaption className="border-t border-[#1E2D45] px-4 py-2.5 font-mono-tech text-[11px] text-[#94A3B8]">
                Figure 1. Explanatory hero schematic of a 45° dichroic beamsplitter stage (#0B1019)
                illustrating mixed-wavelength incidence, thin-film dielectric stack interference
                (#9D4EDD), and orthogonal spectral routing (#00E5FF short-λ vs. #FFD166 long-λ).
              </figcaption>
            </figure>

            <article className="space-y-5 text-sm leading-relaxed text-[#C5C6C7]">
              <h2 className="text-2xl font-bold tracking-tight text-[#E6EDF3] sm:text-3xl">
                Inside the Dichroic Beamsplitter: How Quarter-Wave Dielectric Stacks Route Light by
                Wavelength, and How We Built a 1,020-Frame Deterministic Explainer
              </h2>

              <p className="text-base font-medium text-[#E6EDF3]">
                <strong>BLUF:</strong> A dichroic beamsplitter separates a mixed-wavelength optical
                beam into two distinct spectral channels through thin-film interference rather than
                bulk absorption. By depositing alternating high-index and low-index dielectric
                layers of quarter-wave optical thickness onto an optical substrate, engineers force
                selected wavelengths to sum constructively in reflection while allowing the remaining
                passband to interfere destructively in reflection and propagate forward. However,
                every real dichroic optic is bounded by four coupled variables: wavelength, angle of
                incidence (AOI), polarization state (s-pol vs. p-pol), and substrate geometry (plate
                vs. cube).
              </p>

              <h3 className="text-lg font-bold text-[#E6EDF3]">
                1. Why Absorption Filters Fail Where Dichroic Interference Wins
              </h3>
              <p>
                When an optical instrument needs to separate excitation light from fluorescence
                emission, or combine two laser wavelengths onto a single coaxial path, absorbing
                colored glass is the wrong tool. Absorptive glass blocks unwanted wavelengths by
                converting photon energy into lattice heat inside the substrate. That thermal load
                wastes half the optical budget, induces thermal lensing under high-power
                illumination, and discards the rejected spectral band.
              </p>
              <p>
                A dichroic beamsplitter solves spectral routing through coherent electromagnetic
                interference. Instead of absorbing the stopband, the dielectric coating redirects it
                along a predictable reflection vector (nominally 90 degrees to the incident axis
                when mounted at a 45-degree angle of incidence) while transmitting the passband
                along the original axis. Both wavelength channels remain available for downstream
                detectors, cameras, or excitation feedback loops.
              </p>

              <h3 className="text-lg font-bold text-[#E6EDF3]">
                2. The Physics of the Quarter-Wave Stack: Phase Shifts and Optical Path Difference
              </h3>
              <p>
                Inside the sectional cutaway (Frames 150–299 of our explainer), the active surface
                consists of alternating thin films of a high-refractive-index dielectric (such as
                titanium dioxide, TiO₂, or tantalum pentoxide, Ta₂O₅) and a low-refractive-index
                dielectric (such as silicon dioxide, SiO₂).
              </p>
              <p>
                At every boundary between adjacent layers, Fresnel equations govern the fraction of
                the electric field amplitude that reflects and transmits. Two mechanisms determine
                whether those partial reflections reinforce or cancel each other:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  <strong className="text-[#E6EDF3]">Boundary Phase Inversion:</strong> A wave
                  reflecting off a medium with a higher refractive index (low-to-high transition)
                  undergoes a 180-degree (π radian) phase shift. A wave reflecting off a medium with
                  a lower refractive index (high-to-low transition) reflects with zero phase
                  inversion.
                </li>
                <li>
                  <strong className="text-[#E6EDF3]">Quarter-Wave Optical Thickness:</strong> Each
                  layer is engineered so that its physical thickness <code>d</code>, multiplied by
                  its refractive index <code>n</code> and the cosine of the internal refraction
                  angle <code>cos(θ)</code>, equals one-quarter of the target center wavelength:{' '}
                  <code>n · d · cos(θ) = λ₀ / 4</code>.
                </li>
              </ul>
              <p>
                Because a wave traversing a quarter-wave layer twice accumulates a round-trip path
                of <code>λ₀ / 2</code> (another π radians of phase delay), the geometric path delay
                and the boundary phase inversion align all reflected wavelets in-phase across the
                target stopband. Across dozens of alternating layers, constructive interference
                builds reflectance close to unity for the stopband, while wavelengths outside that
                band experience destructive interference in reflection and pass through the
                substrate.
              </p>

              <h3 className="text-lg font-bold text-[#E6EDF3]">
                3. Four Real-World Engineering Limits Every Optical Architect Must Account For
              </h3>
              <p>
                Idealized block diagrams treat a dichroic mirror as a step-function switch. In
                production optical systems, four physical constraints govern performance (illustrated
                across Frames 510–1019):
              </p>
              <ol className="list-decimal space-y-2 pl-6">
                <li>
                  <strong className="text-[#E6EDF3]">
                    Angle-of-Incidence (AOI) Blue-Shift:
                  </strong>{' '}
                  Because the phase condition scales with <code>cos(θ)</code>, tilting a dichroic
                  optic to a steeper angle reduces the effective optical path difference for a given
                  wavelength. As AOI increases, the entire transmission/reflection edge shifts
                  toward shorter wavelengths (blue-shift). Conversely, if an uncollimated,
                  high-numerical-aperture cone of light strikes the coating, rays at the outer edges
                  of the cone see a different cutoff wavelength than the chief ray, smearing the
                  transition slope.
                </li>
                <li>
                  <strong className="text-[#E6EDF3]">
                    S-Polarization (TE) vs. P-Polarization (TM) Splitting:
                  </strong>{' '}
                  At normal incidence (0 degrees), s-polarized and p-polarized light are
                  indistinguishable. At a 45-degree AOI, the effective optical admittance of each
                  layer diverges between electric fields oscillating perpendicular to the plane of
                  incidence (s-pol) and parallel to the plane of incidence (p-pol). S-polarized
                  light experiences higher per-interface reflectance and a wider stopband, whereas
                  p-polarized light exhibits a narrower stopband and a shifted cutoff wavelength. For
                  unpolarized light, the net transfer curve exhibits a stepped or broadened
                  shoulder between the s and p cutoffs.
                </li>
                <li>
                  <strong className="text-[#E6EDF3]">
                    Plate Walk-Off and Rear-Surface Ghosting vs. Cube Cement Limits:
                  </strong>{' '}
                  As detailed in Edmund Optics’ application notes on beamsplitters and optical
                  prisms, a tilted plate beamsplitter refracts the transmitted beam laterally
                  (walk-off <code>Δs</code>) and introduces astigmatism if placed in a converging
                  beam. Furthermore, the uncoated or imperfectly AR-coated rear surface can produce
                  a parallel ghost reflection. Cemented cube beamsplitters eliminate beam walk-off
                  and rear-air-interface ghosting by sandwiching the dielectric stack between two
                  matched right-angle glass prisms, but the optical adhesive layer limits laser
                  damage thresholds (LIDT) compared to air-spaced or monolithic fused-silica plates.
                </li>
                <li>
                  <strong className="text-[#E6EDF3]">
                    Finite Transition Slope, Passband Ripple, and Insertion Loss:
                  </strong>{' '}
                  Conservation of energy dictates <code>R(λ) + T(λ) + Loss(λ) = 1</code>. Even with
                  ion-beam sputtered (IBS) coatings, the transition from high reflection to high
                  transmission spans a finite spectral width, passbands exhibit residual impedance
                  ripple, and interface scattering plus bulk absorption remain non-zero.
                </li>
              </ol>

              <h3 className="text-lg font-bold text-[#E6EDF3]">
                4. Architecting a Deterministic Frame-Driven Explainer in TypeScript
              </h3>
              <p>
                Most web animations rely on stateful, fire-and-forget CSS transitions or frame-delta
                physics accumulators that drift when a user scrubs backward or switches tabs. To
                make this optical schematic behave like a precision inspection instrument, the entire
                34-second sequence (1,020 frames at 30 fps, indexed <code>0..1019</code>) is driven
                by a pure deterministic state function: <code>state = f(frameIndex, userParams)</code>.
              </p>
              <p>
                Whether you press Play at 30 fps, step frame-by-frame with <code>+1f / -1f</code>,
                or drag the scrubber directly to Frame 215 (Act 2 sectional cutaway) or Frame 840
                (Act 5 AOI &amp; polarization envelope), the camera transform, cutaway layer
                expansion, coherent wavepacket phase, and qualitative spectral plot compute
                identically from the frame index.
              </p>
            </article>
          </div>
        </section>
      </main>

      {/* Footer with Governance & Provenance Notice */}
      <footer className="mt-12 border-t border-[#1E2D45] bg-[#080C14] py-6 text-xs text-[#64748B]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#00E5FF]" />
            <span>
              Educational Mechanism Schematic. Verify specific product performance against
              manufacturer datasheets prior to engineering release.
            </span>
          </div>
          <div className="flex items-center gap-4 font-mono-tech">
            <a
              href="./visualization-Cursor.html"
              className="hover:text-[#00E5FF]"
            >
              visualization-Cursor.html
            </a>
            <a
              href="./dashboard-Cursor.html"
              className="hover:text-[#00E5FF]"
            >
              dashboard-Cursor.html
            </a>
            <a
              href="./dashboard-Claude.html"
              className="hover:text-[#00E5FF]"
            >
              dashboard-Claude.html
            </a>
          </div>
        </div>
      </footer>

      {/* Conversion / Engineering Specification Worksheet Modal */}
      <SpecRequestModal
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
        filterMode={filterMode}
        architecture={architecture}
        polarization={polarization}
        userAoiDeg={userAoiDeg}
      />
    </div>
  );
}

export default App;
