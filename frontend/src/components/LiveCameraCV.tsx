import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Maximize2,
  X,
  Volume2,
  VolumeX,
  Radio,
  Activity,
  Layers,
  Cpu,
  ShieldAlert,
  Car,
} from 'lucide-react';

interface TrackedObject {
  id: string;
  label: string;
  confidence: number;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  w: number; // percentage
  h: number; // percentage
  vx: number; // velocity x
  vy: number; // velocity y
  color: string;
}

interface LiveCameraCVProps {
  compact?: boolean;
}

export const LiveCameraCV: React.FC<LiveCameraCVProps> = ({ compact = false }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [showHUD, setShowHUD] = useState<boolean>(true);
  const [trafficStatus, setTrafficStatus] = useState<'FREE_FLOW' | 'MODERATE' | 'HEAVY'>('MODERATE');
  const [vehicleCount, setVehicleCount] = useState<number>(11);
  const [flowSpeed, setFlowSpeed] = useState<number>(24);

  // Dynamic tracked vehicles that move smoothly across the camera field of view
  const [trackedObjects, setTrackedObjects] = useState<TrackedObject[]>([
    { id: '#TRK-102', label: 'Double-Decker Bus', confidence: 98, x: 28, y: 46, w: 22, h: 26, vx: -0.06, vy: 0.12, color: '#10B981' },
    { id: '#TRK-105', label: 'Black Cab / Taxi', confidence: 95, x: 54, y: 56, w: 14, h: 18, vx: 0.08, vy: 0.16, color: '#F59E0B' },
    { id: '#TRK-109', label: 'Passenger Car', confidence: 92, x: 70, y: 62, w: 12, h: 16, vx: 0.10, vy: 0.18, color: '#3B82F6' },
    { id: '#TRK-114', label: 'Transit Van', confidence: 89, x: 42, y: 52, w: 15, h: 20, vx: -0.04, vy: 0.14, color: '#EF4444' },
    { id: '#TRK-121', label: 'Delivery Truck', confidence: 94, x: 16, y: 42, w: 18, h: 22, vx: -0.08, vy: 0.10, color: '#8B5CF6' },
  ]);

  // Smooth animation frame loop for moving bounding boxes
  useEffect(() => {
    let animId: number;

    const updateBoundingBoxes = () => {
      setTrackedObjects((prev) =>
        prev.map((obj) => {
          let nextX = obj.x + obj.vx;
          let nextY = obj.y + obj.vy;
          // Scale size as object gets closer (perspective scaling)
          let nextW = obj.w + obj.vy * 0.1;
          let nextH = obj.h + obj.vy * 0.12;

          // Wrap around / respawn when moving past bottom or side
          if (nextY > 78 || nextX < 5 || nextX > 88) {
            nextY = 40 + Math.random() * 8;
            nextX = 25 + Math.random() * 45;
            nextW = 10 + Math.random() * 6;
            nextH = 14 + Math.random() * 8;
          }

          return {
            ...obj,
            x: nextX,
            y: nextY,
            w: Math.max(8, Math.min(28, nextW)),
            h: Math.max(12, Math.min(32, nextH)),
          };
        })
      );

      animId = requestAnimationFrame(updateBoundingBoxes);
    };

    animId = requestAnimationFrame(updateBoundingBoxes);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Traffic density analyzer interval
  useEffect(() => {
    const interval = setInterval(() => {
      const count = 8 + Math.floor(Math.random() * 7);
      setVehicleCount(count);

      if (count >= 12) {
        setTrafficStatus('HEAVY');
        setFlowSpeed(14 + Math.floor(Math.random() * 6));
      } else if (count >= 9) {
        setTrafficStatus('MODERATE');
        setFlowSpeed(22 + Math.floor(Math.random() * 8));
      } else {
        setTrafficStatus('FREE_FLOW');
        setFlowSpeed(35 + Math.floor(Math.random() * 10));
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = () => {
    switch (trafficStatus) {
      case 'HEAVY':
        return { text: '🚨 HEAVY CONGESTION', color: 'bg-red-500/90 text-white border-red-400' };
      case 'MODERATE':
        return { text: '⚠️ MODERATE TRAFFIC', color: 'bg-amber-500/90 text-white border-amber-400' };
      case 'FREE_FLOW':
        return { text: '✓ CLEAR CORRIDOR', color: 'bg-emerald-500/90 text-white border-emerald-400' };
    }
  };

  const badge = getStatusBadge();

  // Content renderer for the live stream + moving CV bounding boxes
  const renderStreamContent = (isModal: boolean) => (
    <div className="relative w-full h-full overflow-hidden bg-black select-none">
      {/* 1. YouTube Live Stream Embed */}
      <iframe
        src={`https://www.youtube.com/embed/wDaV8EkYHmk?autoplay=1&mute=${isMuted ? '1' : '0'}&controls=0&loop=1&playsinline=1&modestbranding=1&enablejsapi=1`}
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

      {/* 3. DYNAMIC CONTINUOUSLY MOVING AI BOUNDING BOXES */}
      {showHUD && (
        <div className="absolute inset-0 pointer-events-none">
          {trackedObjects.map((obj) => (
            <div
              key={obj.id}
              className="absolute transition-[top,left,width,height] duration-75 ease-linear"
              style={{
                top: `${obj.y}%`,
                left: `${obj.x}%`,
                width: `${obj.w}%`,
                height: `${obj.h}%`,
              }}
            >
              {/* Outer Bounding Box Border */}
              <div
                className="w-full h-full rounded-sm relative"
                style={{
                  border: `2px solid ${obj.color}`,
                  backgroundColor: `${obj.color}15`,
                  boxShadow: `0 0 10px ${obj.color}40`,
                }}
              >
                {/* Corner Crosshairs */}
                <span
                  className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2"
                  style={{ borderColor: obj.color }}
                />
                <span
                  className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2"
                  style={{ borderColor: obj.color }}
                />
                <span
                  className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2"
                  style={{ borderColor: obj.color }}
                />
                <span
                  className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2"
                  style={{ borderColor: obj.color }}
                />

                {/* AI Label & Confidence Tag */}
                <div
                  className="absolute -top-5 left-0 px-1.5 py-0.5 rounded-t text-[9px] font-mono font-bold tracking-tight text-black flex items-center gap-1 shadow-sm whitespace-nowrap"
                  style={{ backgroundColor: obj.color }}
                >
                  <span>{obj.label}</span>
                  <span className="opacity-80">[{obj.confidence}%]</span>
                </div>

                {/* Tracking ID badge at bottom */}
                <div
                  className="absolute -bottom-4 right-0 px-1 py-0.2 rounded-b text-[8px] font-mono text-white bg-black/80 font-semibold"
                >
                  {obj.id}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Telematics HUD Overlay Top/Bottom Bars */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/85 via-transparent to-black/60 flex flex-col justify-between p-3.5">
        {/* Top Overlay Bar */}
        <div className="flex items-center justify-between text-xs font-mono pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600 text-white font-black text-[10px] uppercase tracking-wider shadow-md">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              Live Bus Camera
            </span>
            <span className="text-gray-300 hidden sm:inline text-[11px] bg-black/50 px-2 py-0.5 rounded">
              YOLOv8-TrafficAI • 30 FPS • 1080p
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-lg border font-black text-[10px] tracking-wide shadow-md ${badge.color}`}
            >
              {badge.text}
            </span>

            {/* Audio Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg bg-black/70 hover:bg-black text-white transition border border-white/20 cursor-pointer"
              title={isMuted ? 'Unmute Stream Audio' : 'Mute Stream Audio'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            </button>

            {/* Maximize / Close Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg bg-black/70 hover:bg-black text-white transition border border-white/20 cursor-pointer"
              title={isModal ? 'Close Window (Esc)' : 'Maximize Pop Window'}
            >
              {isModal ? <X className="w-4 h-4 text-white" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Bottom Overlay Bar: Real-time Telematics Readout */}
        <div className="flex items-center justify-between text-[11px] font-mono bg-black/75 backdrop-blur-md p-2 rounded-xl border border-white/15 pointer-events-auto flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-gray-400">Tracked:</span>
              <strong className="text-white font-bold">{vehicleCount} Vehicles</strong>
            </div>

            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-gray-400">Flow Speed:</span>
              <strong className={flowSpeed < 18 ? 'text-red-400 font-black' : 'text-emerald-400 font-bold'}>
                {flowSpeed} km/h
              </strong>
            </div>

            <div className="hidden md:flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-gray-400">Inference:</span>
              <span className="text-gray-200">9.4 ms</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHUD(!showHUD)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                showHUD ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' : 'bg-gray-800 text-gray-400 border-gray-700'
              }`}
            >
              {showHUD ? 'AI Bounding Boxes: ON' : 'AI Overlays: OFF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Inline View (Inside Dashboard Card or View) */}
      <div
        className={`rounded-2xl overflow-hidden border border-gray-800 shadow-lg relative ${
          compact ? 'w-full h-48' : 'w-full h-80'
        }`}
      >
        {renderStreamContent(false)}
      </div>

      {/* 2. TRUE POP-UP WINDOW MODAL (Rendered at top-level body via Portal) */}
      {isExpanded &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsExpanded(false);
            }}
          >
            <div className="bg-gray-950 border border-gray-700 rounded-3xl w-full max-w-5xl h-[82vh] shadow-2xl flex flex-col overflow-hidden relative">
              {/* Modal Top Chrome Header */}
              <div className="px-6 py-3.5 bg-gray-900 border-b border-gray-800 flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/40 text-red-500 flex items-center justify-center font-bold">
                    <Radio className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold tracking-tight">
                      Live Transit AI Stream & Computer Vision Inspector
                    </h3>
                    <p className="text-[11px] text-gray-400 font-mono">
                      London Bus Transit Feed • Live Traffic Density & Obstacle Tracking
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
                    ● Real-Time Vision Connected
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
