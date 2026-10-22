import React, { useEffect, useRef, useState } from 'react';
import { animate } from 'motion';
import { CheckCircle2, ClipboardCheck, ShieldAlert, X } from 'lucide-react';
import {
  CoatingFilterMode,
  GeometryArchitecture,
  PolarizationMode,
} from '../data/beamsplitterTimeline';

interface SpecRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterMode: CoatingFilterMode;
  architecture: GeometryArchitecture;
  polarization: PolarizationMode;
  userAoiDeg: number;
}

export const SpecRequestModal: React.FC<SpecRequestModalProps> = ({
  isOpen,
  onClose,
  filterMode,
  architecture,
  polarization,
  userAoiDeg,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [applicationName, setApplicationName] = useState('Fluorescence Epifluorescence Cube');
  const [laserPowerClass, setLaserPowerClass] = useState('CW Low-Power (< 1 W/cm²)');
  const [coneHalfAngle, setConeHalfAngle] = useState('Collimated (< ±1.5°)');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && panelRef.current) {
      animate(
        panelRef.current,
        { opacity: [0, 1], transform: ['scale(0.95) translateY(10px)', 'scale(1) translateY(0px)'] },
        { duration: 0.22, ease: 'easeOut' }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const specSummaryText = [
    `DICHROIC BEAMSPLITTER ENGINEERING SPECIFICATION WORKSHEET`,
    `---------------------------------------------------------`,
    `1. Application Context     : ${applicationName}`,
    `2. Spectral Filter Topology: ${filterMode.toUpperCase()} (${
      filterMode === 'longpass' ? 'Reflect Short-λ / Transmit Long-λ' : 'Reflect Long-λ / Transmit Short-λ'
    })`,
    `3. Substrate Architecture  : ${
      architecture === 'plate'
        ? '45° Dichroic Plate (Requires Rear AR Coating + Beam Walk-Off Compensation)'
        : 'Cemented Right-Angle Prism Cube (Zero Walk-Off, Verify Optical Cement LIDT)'
    }`,
    `4. Nominal Incidence Angle : ${userAoiDeg}° AOI (Tolerance & Cone Half-Angle: ${coneHalfAngle})`,
    `5. Polarization State      : ${polarization.toUpperCase()} (Account for S/P Cutoff Splitting at ${userAoiDeg}°)`,
    `6. Optical Power / Fluence : ${laserPowerClass}`,
    `7. Verification Mandate    : Verify against manufacturer measured R(λ)/T(λ) curves (e.g., Edmund Optics application documentation) prior to procurement release.`,
  ].join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(specSummaryText).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="spec-modal-title"
    >
      <div
        ref={panelRef}
        style={{ willChange: 'transform, opacity' }}
        className="w-full max-w-xl rounded-2xl border border-[#283B5B] bg-[#0E1524] p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-[#1E2D45] pb-3">
          <div>
            <span className="font-mono-tech text-[11px] font-semibold uppercase tracking-wider text-[#00E5FF]">
              Static-First Engineering Worksheet
            </span>
            <h3 id="spec-modal-title" className="mt-0.5 text-lg font-bold text-[#E6EDF3]">
              Dichroic Beamsplitter Specification &amp; Verification Checklist
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#283B5B] bg-[#162032] p-1.5 text-[#94A3B8] hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-xs">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-semibold text-[#94A3B8]">
                Target Optical System
              </label>
              <input
                type="text"
                value={applicationName}
                onChange={(e) => setApplicationName(e.target.value)}
                className="w-full rounded-lg border border-[#283B5B] bg-[#0B1019] px-3 py-2 text-[#E6EDF3] focus:border-[#00E5FF] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-[#94A3B8]">
                Laser / Illumination Fluence
              </label>
              <select
                value={laserPowerClass}
                onChange={(e) => setLaserPowerClass(e.target.value)}
                className="w-full rounded-lg border border-[#283B5B] bg-[#0B1019] px-3 py-2 text-[#E6EDF3] focus:border-[#00E5FF] focus:outline-none"
              >
                <option>CW Low-Power (&lt; 1 W/cm²)</option>
                <option>High-Power CW (&gt; 10 W/cm² — Prefer Plate)</option>
                <option>Pulsed Nanosecond / Ultrafast (Verify LIDT)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block font-semibold text-[#94A3B8]">
              Beam Collimation / Angular Cone Half-Angle
            </label>
            <select
              value={coneHalfAngle}
              onChange={(e) => setConeHalfAngle(e.target.value)}
              className="w-full rounded-lg border border-[#283B5B] bg-[#0B1019] px-3 py-2 text-[#E6EDF3] focus:border-[#00E5FF] focus:outline-none"
            >
              <option>Collimated (&lt; ±1.5°)</option>
              <option>Moderately Convergent (±3° to ±6° — Expect Edge Smearing)</option>
              <option>High-NA Non-Collimated (&gt; ±8° — Blue-Shift Risk)</option>
            </select>
          </div>

          <div className="rounded-lg border border-[#1E2D45] bg-[#0B1019] p-3 font-mono-tech text-[11px] text-[#E6EDF3]">
            <pre className="whitespace-pre-wrap leading-relaxed">{specSummaryText}</pre>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-[#FFD166]/40 bg-[#FFD166]/10 p-3 text-[11px] text-[#E6EDF3]">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#FFD166]" />
            <div>
              <strong>Governance &amp; Privacy Notice:</strong> This worksheet executes 100% locally
              in your browser. No personal data, IP, or optical parameters are transmitted off-device.
              Always verify final spectral curves against manufacturer lot datasheets before release.
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#283B5B] bg-[#162032] px-4 py-2 text-xs font-semibold text-[#94A3B8] hover:text-white cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#00E5FF] px-4 py-2 text-xs font-bold text-[#0B1019] hover:bg-[#38BDF8] cursor-pointer"
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Copied Specification Worksheet
              </>
            ) : (
              <>
                <ClipboardCheck className="h-4 w-4" />
                Copy Spec Worksheet to Clipboard
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
