import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import {
  Maximize2,
  X,
  Volume2,
  VolumeX,
  Radio,
  Activity,
  Car,
  Compass,
  Cpu,
  RefreshCw,
  Video,
} from 'lucide-react';

interface LiveCameraCVProps {
  compact?: boolean;
}

interface DetectedEntity {
  id: string;
  label: string;
  confidence: number;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}

export const LiveCameraCV: React.FC<LiveCameraCVProps> = ({ compact = false }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [showHUD, setShowHUD] = useState<boolean>(true);
  const [activeFeed, setActiveFeed] = useState<'AI_REAL' | 'YOUTUBE_LIVE'>('AI_REAL');

  // AI Model state
  const [isModelLoading, setIsModelLoading] = useState<boolean>(true);
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [detectedEntities, setDetectedEntities] = useState<DetectedEntity[]>([]);
  const [inferenceTime, setInferenceTime] = useState<number>(14);

  // Video references
  const inlineVideoRef = useRef<HTMLVideoElement | null>(null);
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);

  // Load TensorFlow COCO-SSD model once
  useEffect(() => {
    let isMounted = true;
    const loadAI = async () => {
      try {
        setIsModelLoading(true);
        const loadedModel = await cocoSsd.load({ base: 'mobilenet_v2' });
        if (isMounted) {
          setModel(loadedModel);
          setIsModelLoading(false);
        }
      } catch (err) {
        console.error('Failed to load COCO-SSD model:', err);
        if (isMounted) setIsModelLoading(false);
      }
    };

    loadAI();
    return () => {
      isMounted = false;
    };
  }, []);

  // Frame detection loop running on the active video element
  useEffect(() => {
    if (!model || activeFeed !== 'AI_REAL') return;

    let animFrameId: number;
    let isDetecting = false;

    const detectFrame = async () => {
      const activeVideo = isExpanded ? modalVideoRef.current : inlineVideoRef.current;

      if (
        activeVideo &&
        activeVideo.readyState >= 2 &&
        !isDetecting &&
        activeVideo.videoWidth > 0
      ) {
        isDetecting = true;
        const t0 = performance.now();

        try {
          const predictions = await model.detect(activeVideo, 10, 0.35);
          const t1 = performance.now();
          setInferenceTime(Math.round(t1 - t0));

          const vW = activeVideo.videoWidth;
          const vH = activeVideo.videoHeight;

          const entities: DetectedEntity[] = predictions
            .filter((p) =>
              ['car', 'truck', 'bus', 'motorcycle', 'bicycle', 'person', 'traffic light'].includes(
                p.class.toLowerCase()
              )
            )
            .map((p, idx) => {
              const [bx, by, bw, bh] = p.bbox;

              // Color coding by vehicle class
              let color = '#3B82F6'; // Default Car Blue
              if (p.class === 'bus') color = '#10B981'; // Bus Green
              else if (p.class === 'truck') color = '#8B5CF6'; // Truck Purple
              else if (p.class === 'motorcycle' || p.class === 'bicycle') color = '#F59E0B'; // Amber
              else if (p.class === 'person') color = '#EC4899'; // Pink
              else if (p.class === 'traffic light') color = '#EF4444'; // Red

              return {
                id: `#TRK-${idx + 101}`,
                label: p.class.toUpperCase(),
                confidence: Math.round(p.score * 100),
                x: Math.max(0, (bx / vW) * 100),
                y: Math.max(0, (by / vH) * 100),
                w: Math.min(100, (bw / vW) * 100),
                h: Math.min(100, (bh / vH) * 100),
                color,
              };
            });

          setDetectedEntities(entities);
        } catch {
          // ignore transient frame detection errors
        } finally {
          isDetecting = false;
        }
      }

      animFrameId = requestAnimationFrame(detectFrame);
    };

    animFrameId = requestAnimationFrame(detectFrame);
    return () => cancelAnimationFrame(animFrameId);
  }, [model, isExpanded, activeFeed]);

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

  const vehicleCount = detectedEntities.length;
  const trafficStatus = vehicleCount >= 5 ? 'HEAVY' : vehicleCount >= 2 ? 'MODERATE' : 'FREE_FLOW';

  const getStatusBadge = () => {
    switch (trafficStatus) {
      case 'HEAVY':
        return { text: '🚨 HEAVY TRAFFIC', color: 'bg-red-500/90 text-white border-red-400' };
      case 'MODERATE':
        return { text: '⚠️ MODERATE FLOW', color: 'bg-amber-500/90 text-white border-amber-400' };
      case 'FREE_FLOW':
        return { text: '✓ CLEAR CORRIDOR', color: 'bg-emerald-500/90 text-white border-emerald-400' };
    }
  };

  const badge = getStatusBadge();

  // Content renderer for the live stream + real CV bounding boxes
  const renderStreamContent = (isModal: boolean) => (
    <div className="relative w-full h-full overflow-hidden bg-black select-none group">
      {/* 1. Video Source: Real Video (AI Enabled) OR YouTube Live Stream */}
      {activeFeed === 'AI_REAL' ? (
        <video
          ref={isModal ? modalVideoRef : inlineVideoRef}
          src="/traffic_feed.mp4"
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <iframe
          src={`https://www.youtube.com/embed/wDaV8EkYHmk?autoplay=1&mute=${isMuted ? '1' : '0'}&controls=0&loop=1&playsinline=1&modestbranding=1`}
          title="Live London Bus Transit Stream"
          className="w-full h-full object-cover pointer-events-none scale-105"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      )}

      {/* 2. Scanning Laser Sweep Line Animation */}
      {showHUD && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#22C55E] to-transparent opacity-60 animate-[bounce_4s_infinite]" />
        </div>
      )}

      {/* 3. REAL DETECTED VEHICLE BOUNDING BOXES (TensorFlow.js COCO-SSD) */}
      {showHUD && activeFeed === 'AI_REAL' && (
        <div className="absolute inset-0 pointer-events-none">
          {detectedEntities.map((entity) => (
            <div
              key={entity.id}
              className="absolute transition-all duration-75 ease-out"
              style={{
                top: `${entity.y}%`,
                left: `${entity.x}%`,
                width: `${entity.w}%`,
                height: `${entity.h}%`,
              }}
            >
              {/* Outer Bounding Box */}
              <div
                className="w-full h-full rounded-sm relative"
                style={{
                  border: `2px solid ${entity.color}`,
                  backgroundColor: `${entity.color}15`,
                  boxShadow: `0 0 12px ${entity.color}50`,
                }}
              >
                {/* Crosshairs */}
                <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2" style={{ borderColor: entity.color }} />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2" style={{ borderColor: entity.color }} />
                <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2" style={{ borderColor: entity.color }} />
                <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2" style={{ borderColor: entity.color }} />

                {/* AI Label & Real Confidence Score */}
                <div
                  className="absolute -top-5 left-0 px-1.5 py-0.5 rounded-t text-[9px] font-mono font-black text-black flex items-center gap-1 shadow-sm whitespace-nowrap"
                  style={{ backgroundColor: entity.color }}
                >
                  <span>{entity.label}</span>
                  <span className="opacity-90">[{entity.confidence}%]</span>
                </div>
              </div>
            </div>
          ))}

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
        <div className="flex items-center justify-between pointer-events-auto gap-2">
          {/* Left: Live indicator + Model status */}
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] uppercase tracking-wider shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              Live CV
            </span>

            {isModelLoading ? (
              <span className="text-amber-300 text-[10px] font-mono bg-black/70 px-2 py-0.5 rounded flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Loading AI Model...
              </span>
            ) : (
              <span className="text-emerald-300 hidden sm:inline text-[10px] font-mono bg-black/70 px-2 py-0.5 rounded border border-emerald-500/30">
                TensorFlow AI Active • {inferenceTime}ms
              </span>
            )}
          </div>

          {/* Right: Feed Toggle, Mute, and Maximize button */}
          <div className="flex items-center gap-1.5">
            {/* Feed Switcher Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveFeed(activeFeed === 'AI_REAL' ? 'YOUTUBE_LIVE' : 'AI_REAL');
              }}
              className="px-2 py-1 rounded-lg bg-black/80 hover:bg-black text-white text-[10px] font-bold border border-white/20 transition cursor-pointer flex items-center gap-1"
              title="Switch Camera Feed"
            >
              <Video className="w-3 h-3 text-emerald-400" />
              <span>{activeFeed === 'AI_REAL' ? 'AI Cam' : 'YouTube'}</span>
            </button>

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
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold text-[11px] shadow-lg shadow-black/60 cursor-pointer transition hover:scale-105 active:scale-95 border border-green-400/50"
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
              <Car className="w-3 h-3 text-blue-400" />
              <span className="text-gray-400">Detected:</span>
              <strong className="text-white font-bold">{vehicleCount} Vehicles</strong>
            </div>

            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-400" />
              <span className="text-gray-400">Latency:</span>
              <strong className="text-emerald-400 font-bold">{inferenceTime}ms</strong>
            </div>

            <span className={`px-1.5 py-0.2 rounded font-black text-[9px] ${badge.color}`}>
              {trafficStatus}
            </span>
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
              {showHUD ? 'AI HUD: ON' : 'AI HUD: OFF'}
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
            <span>Maximize Live AI Stream (Pop Window)</span>
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
                      Live Fleet AI Camera Feed — Real-Time TensorFlow Object Detection
                    </h3>
                    <p className="text-[11px] text-gray-400 font-mono">
                      Neural Network COCO-SSD / MobileNetV2 • Real Vehicle Tracking & Telematics
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
                    ● Real AI Model Active ({inferenceTime}ms)
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
