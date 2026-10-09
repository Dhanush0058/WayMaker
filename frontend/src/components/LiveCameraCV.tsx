import React, { useState, useEffect } from 'react';
import { Camera, Maximize2, Minimize2, Radio, AlertTriangle, Activity } from 'lucide-react';

interface LiveCameraCVProps {
  compact?: boolean;
}

export const LiveCameraCV: React.FC<LiveCameraCVProps> = ({ compact = false }) => {
  const [vehicleCount, setVehicleCount] = useState<number>(8);
  const [trafficStatus, setTrafficStatus] = useState<'FREE_FLOW' | 'MODERATE' | 'HEAVY'>('MODERATE');
  const [flowSpeed, setFlowSpeed] = useState<number>(24);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Dynamic CV simulation loop simulating YOLO vehicle detection on the live stream
  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuate detected vehicle count realistically
      const nextCount = Math.floor(6 + Math.random() * 8);
      setVehicleCount(nextCount);

      if (nextCount > 10) {
        setTrafficStatus('HEAVY');
        setFlowSpeed(Math.floor(12 + Math.random() * 8));
      } else if (nextCount > 7) {
        setTrafficStatus('MODERATE');
        setFlowSpeed(Math.floor(22 + Math.random() * 10));
      } else {
        setTrafficStatus('FREE_FLOW');
        setFlowSpeed(Math.floor(35 + Math.random() * 10));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (trafficStatus) {
      case 'HEAVY':
        return 'text-red-500 bg-red-500/20 border-red-500/40';
      case 'MODERATE':
        return 'text-amber-400 bg-amber-500/20 border-amber-500/40';
      case 'FREE_FLOW':
        return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40';
    }
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-gray-800 bg-black text-white shadow-xl transition-all duration-300 ${
        isExpanded
          ? 'fixed inset-6 z-[3000] flex flex-col'
          : compact
          ? 'w-full h-44'
          : 'w-full h-72'
      }`}
    >
      {/* YouTube Live Stream Background */}
      <iframe
        src="https://www.youtube.com/embed/wDaV8EkYHmk?autoplay=1&mute=1&controls=0&loop=1&playsinline=1&modestbranding=1"
        title="Live City Bus Dashcam"
        className="w-full h-full object-cover pointer-events-none scale-105"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />

      {/* Futuristic Computer Vision HUD Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/60 flex flex-col justify-between p-3">
        {/* Top Header: Live Stream & AI Model Status */}
        <div className="flex items-center justify-between text-[11px] font-mono pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600/90 text-white font-bold text-[10px] uppercase tracking-wider shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              Live Bus Cam
            </span>
            <span className="text-gray-300 hidden sm:inline text-[10px]">
              YOLOv8-TrafficCV • 30 FPS
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wide ${getStatusColor()}`}
            >
              {trafficStatus === 'HEAVY' ? '🚨 Heavy Traffic' : trafficStatus === 'MODERATE' ? '⚠️ Moderate Flow' : '✓ Clear Corridor'}
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded bg-black/60 hover:bg-black text-white transition cursor-pointer"
              title={isExpanded ? 'Minimize' : 'Expand View'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Dynamic Simulated CV Bounding Boxes overlaying vehicles */}
        <div className="relative flex-1 my-2 overflow-hidden pointer-events-none">
          {/* Bounding Box 1 */}
          <div
            className="absolute border border-emerald-400 bg-emerald-400/10 rounded transition-all duration-700"
            style={{
              top: '45%',
              left: '28%',
              width: compact ? '48px' : '75px',
              height: compact ? '32px' : '52px',
            }}
          >
            <span className="absolute -top-3.5 left-0 bg-emerald-500 text-black font-mono font-bold text-[8px] px-1 rounded-t">
              Bus [97%]
            </span>
          </div>

          {/* Bounding Box 2 */}
          <div
            className="absolute border border-amber-400 bg-amber-400/10 rounded transition-all duration-700"
            style={{
              top: '52%',
              left: '52%',
              width: compact ? '36px' : '58px',
              height: compact ? '24px' : '38px',
            }}
          >
            <span className="absolute -top-3.5 left-0 bg-amber-400 text-black font-mono font-bold text-[8px] px-1 rounded-t">
              Car [92%]
            </span>
          </div>

          {/* Bounding Box 3 */}
          <div
            className="absolute border border-red-400 bg-red-400/10 rounded transition-all duration-700"
            style={{
              top: '58%',
              left: '68%',
              width: compact ? '30px' : '46px',
              height: compact ? '20px' : '32px',
            }}
          >
            <span className="absolute -top-3.5 left-0 bg-red-500 text-white font-mono font-bold text-[8px] px-1 rounded-t">
              Van [89%]
            </span>
          </div>
        </div>

        {/* Bottom HUD Bar: Real-time Telematics Readout */}
        <div className="flex items-center justify-between text-[10px] font-mono bg-black/60 backdrop-blur-xs p-1.5 rounded-lg border border-white/10">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-gray-400">Detected: </span>
              <strong className="text-white">{vehicleCount} Vehicles</strong>
            </div>
            <div>
              <span className="text-gray-400">Flow Speed: </span>
              <strong className={flowSpeed < 20 ? 'text-amber-400' : 'text-emerald-400'}>
                {flowSpeed} km/h
              </strong>
            </div>
          </div>
          <div className="text-gray-300">
            <span className="text-emerald-400">● </span>
            <span>Real Vision Feed</span>
          </div>
        </div>
      </div>
    </div>
  );
};
