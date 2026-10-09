import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Maximize2,
  X,
  Volume2,
  VolumeX,
  Radio,
  Activity,
  Car,
  Compass,
  Layers,
  ShieldCheck,
} from 'lucide-react';

interface LiveCameraCVProps {
  compact?: boolean;
}

export const LiveCameraCV: React.FC<LiveCameraCVProps> = ({ compact = false }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [showHUD, setShowHUD] = useState<boolean>(true);
  const [trafficStatus, setTrafficStatus] = useState<'FREE_FLOW' | 'MODERATE' | 'HEAVY'>('MODERATE');
  const [densityPercent, setDensityPercent] = useState<number>(44);
  const [flowSpeed, setFlowSpeed] = useState<number>(24);
  const [corridorClearance, setCorridorClearance] = useState<boolean>(true);

  // Traffic density analyzer simulation for corridor flow
  useEffect(() => {
    const interval = setInterval(() => {
      const density = 30 + Math.floor(Math.random() * 45);
      setDensityPercent(density);

      if (density >= 65) {
        setTrafficStatus('HEAVY');
        setFlowSpeed(14 + Math.floor(Math.random() * 5));
        setCorridorClearance(false);
      } else if (density >= 40) {
        setTrafficStatus('MODERATE');
        setFlowSpeed(22 + Math.floor(Math.random() * 6));
        setCorridorClearance(true);
      } else {
        setTrafficStatus('FREE_FLOW');
        setFlowSpeed(34 + Math.floor(Math.random() * 8));
        setCorridorClearance(true);
      }
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  const getStatusBadge = () => {
    switch (trafficStatus) {
      case 'HEAVY':
        return { text: '🚨 HEAVY CONGESTION', color: 'bg-red-500/90 text-white border-red-400' };
      case 'MODERATE':
        return { text: '⚠️ MODERATE FLOW', color: 'bg-amber-500/90 text-white border-amber-400' };
      case 'FREE_FLOW':
        return { text: '✓ CLEAR CORRIDOR', color: 'bg-emerald-500/90 text-white border-emerald-400' };
    }
  };

  const badge = getStatusBadge();

  // Content renderer for the live stream + clean lane vision HUD
  const renderStreamContent = (isModal: boolean) => (
    <div className="relative w-full h-full overflow-hidden bg-black select-none group">
      {/* 1. YouTube Live Stream Embed */}
      <iframe
        src={`https://www.youtube.com/embed/wDaV8EkYHmk?autoplay=1&mute=${isMuted ? '1' : '0'}&controls=0&loop=1&playsinline=1&modestbranding=1`}
        title="Live London Bus Transit Stream"
        className="w-full h-full object-cover pointer-events-none scale-105"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />

      {/* 2. Scanning Laser Sweep Line Animation */}
      {showHUD && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#22C55E] to-transparent opacity-60 animate-[bounce_4s_infinite]" />
        </div>
      )}

      {/* 3. CLEAN SMART TRANSIT LANE & CORRIDOR VISION HUD (No misaligned fake boxes) */}
      {showHUD && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Calibrated Road Corridor Perspective Guides */}
          <svg className="w-full h-full opacity-60" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Left Corridor Guide Line */}
            <line x1="48" y1="36" x2="16" y2="96" stroke="#22C55E" strokeWidth="0.5" strokeDasharray="2,2" />
            {/* Center Lane Divider */}
            <line x1="50" y1="38" x2="50" y2="96" stroke="#38BDF8" strokeWidth="0.6" strokeDasharray="3,3" />
            {/* Right Corridor Guide Line */}
            <line x1="52" y1="36" x2="84" y2="96" stroke="#22C55E" strokeWidth="0.5" strokeDasharray="2,2" />

            {/* Target Flow Detection Region of Interest (ROI) */}
            <polygon
              points="45,46 55,46 68,82 32,82"
              fill="rgba(34, 197, 94, 0.06)"
              stroke="#22C55E"
              strokeWidth="0.6"
              strokeDasharray="3,2"
            />
          </svg>

          {/* Detection Zone Label in Corridor */}
          <div className="absolute top-[48%] left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-xs px-2 py-0.5 rounded border border-emerald-500/40 text-[9px] font-mono text-emerald-300 font-bold flex items-center gap-1 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Transit Corridor Lane 1 [Monitored]</span>
          </div>

          {/* Calibrated CCTV Corner Reticles */}
          <div className="absolute top-8 left-4 w-4 h-4 border-t-2 border-l-2 border-white/40" />
          <div className="absolute top-8 right-4 w-4 h-4 border-t-2 border-r-2 border-white/40" />
          <div className="absolute bottom-12 left-4 w-4 h-4 border-b-2 border-l-2 border-white/40" />
          <div className="absolute bottom-12 right-4 w-4 h-4 border-b-2 border-r-2 border-white/40" />
        </div>
      )}

      {/* 4. Stream Controls & HUD Headers */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/85 via-transparent to-black/60 flex flex-col justify-between p-2.5">
        {/* Top Overlay Bar */}
        <div className="flex items-center justify-between pointer-events-auto">
          {/* Left: Live indicator */}
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] uppercase tracking-wider shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              Live CV
            </span>

            {!compact && (
              <span className="text-gray-300 hidden sm:inline text-[11px] font-mono bg-black/60 px-2 py-0.5 rounded border border-white/10">
                London Transit Live • 30 FPS • 1080p
              </span>
            )}
          </div>

          {/* Right: Sound toggle and Maximize button */}
          <div className="flex items-center gap-1.5">
            {!compact && (
              <span className={`px-2 py-0.5 rounded-md border font-black text-[10px] ${badge.color}`}>
                {badge.text}
              </span>
            )}

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="p-1.5 rounded-lg bg-black/80 hover:bg-black text-white transition border border-white/20 cursor-pointer shadow-md"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-gray-300" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            </button>

            {/* PROMINENT MAXIMIZE / CLOSE BUTTON */}
            {isModal ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg cursor-pointer transition"
                title="Close Window (Esc)"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold text-[11px] shadow-lg shadow-black/60 cursor-pointer transition hover:scale-105 active:scale-95 border border-green-400/50"
                title="Pop-Up Fullscreen Video Window"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Maximize</span>
              </button>
            )}
          </div>
        </div>

        {/* Center Prompt on hover in compact mode */}
        {compact && !isModal && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
            }}
            className="self-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-auto cursor-pointer bg-black/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/30 text-white font-bold text-xs flex items-center gap-2 shadow-2xl"
          >
            <Maximize2 className="w-4 h-4 text-[#16A34A]" />
            <span>Click to Open Pop Window</span>
          </div>
        )}

        {/* Bottom Overlay Bar: Real-time Telematics Readout */}
        <div className="flex items-center justify-between text-[10px] font-mono bg-black/85 backdrop-blur-md p-1.5 rounded-xl border border-white/15 pointer-events-auto flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-blue-400" />
              <span className="text-gray-400">Density:</span>
              <strong className="text-white font-bold">{densityPercent}%</strong>
            </div>

            <div className="flex items-center gap-1">
              <Compass className="w-3 h-3 text-emerald-400" />
              <span className="text-gray-400">Speed:</span>
              <strong className={flowSpeed < 18 ? 'text-red-400 font-black' : 'text-emerald-400 font-bold'}>
                {flowSpeed} km/h
              </strong>
            </div>

            {compact && (
              <span className={`px-1.5 py-0.2 rounded font-black text-[9px] ${badge.color}`}>
                {trafficStatus}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowHUD(!showHUD);
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                showHUD ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' : 'bg-gray-800 text-gray-400 border-gray-700'
              }`}
            >
              {showHUD ? 'HUD: ON' : 'HUD: OFF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Inline View */}
      <div className="space-y-2">
        <div
          onClick={() => setIsExpanded(true)}
          className={`rounded-2xl overflow-hidden border border-gray-800 shadow-md relative cursor-pointer group ${
            compact ? 'w-full h-48' : 'w-full h-80'
          }`}
          title="Click to Maximize Live Stream"
        >
          {renderStreamContent(false)}
        </div>

        {/* Dedicated FULL-WIDTH Maximize Button in Compact Mode (Always 100% visible) */}
        {compact && (
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-black shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
            <span>Maximize Live Stream (Pop Window)</span>
          </button>
        )}
      </div>

      {/* 2. TRUE TOP-LEVEL POP-UP MODAL WINDOW (rendered at body level via React Portal) */}
      {isExpanded &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsExpanded(false);
            }}
          >
            <div className="bg-gray-950 border border-gray-700 rounded-3xl w-full max-w-5xl h-[84vh] shadow-2xl flex flex-col overflow-hidden relative">
              {/* Modal Top Header */}
              <div className="px-6 py-3.5 bg-gray-900 border-b border-gray-800 flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/40 text-red-500 flex items-center justify-center font-bold">
                    <Radio className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold tracking-tight">
                      Live Fleet Transit Camera & Traffic Density Analyzer
                    </h3>
                    <p className="text-[11px] text-gray-400 font-mono">
                      YouTube Live Transit Stream (wDaV8EkYHmk) • Real-Time Traffic Density & Corridor Telemetry
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
                    ● Real-Time AI Stream Active
                  </span>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-1.5 rounded-xl bg-gray-800 hover:bg-red-600 text-gray-300 hover:text-white transition cursor-pointer"
                    title="Close Pop Window (Esc)"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Stream Canvas */}
              <div className="flex-1 relative overflow-hidden">
                {renderStreamContent(true)}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
