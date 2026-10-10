import React from 'react';
import { Radio, BarChart2, Clock, Activity } from 'lucide-react';
import { DashboardSummary } from '../types';

interface TopHeaderProps {
  summary?: DashboardSummary;
  isConnected: boolean;
  onOpenMetrics: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  summary,
  isConnected,
  onOpenMetrics,
}) => {
  return (
    <header className="bg-white border-b border-gray-200/80 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-xs">
      {/* Brand & System Tagline */}
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-[#16A34A] flex items-center justify-center text-white shadow-md shadow-[#16A34A]/25">
          <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
            <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-gray-900 leading-none">WayMaker</h1>
            <span className="bg-[#EBF8EE] text-[#16A34A] text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-[#BBF7D0]">
              OPS v1.0
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Smart Emergency Routing & Traffic Control</p>
        </div>
      </div>

      {/* Right Side: Telemetry Status, Sim Clock & Evaluation */}
      <div className="flex items-center gap-3.5">
        {/* Real-time Connection Status */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
          isConnected
            ? 'bg-[#EBF8EE] border-[#BBF7D0] text-[#16A34A]'
            : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          <span className="relative flex h-2.5 w-2.5">
            {isConnected ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#16A34A]"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            )}
          </span>
          <span className="hidden sm:inline">
            {isConnected ? 'LIVE TELEMETRY' : 'OFFLINE'}
          </span>
          <Radio className={`w-3.5 h-3.5 ${isConnected ? 'animate-pulse' : ''}`} />
        </div>

        {/* Simulation Time & Engine State */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200/80 text-gray-800 text-xs font-semibold">
          <Clock className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-gray-500 hidden md:inline">Sim Time:</span>
          <span className="font-mono font-bold text-gray-900">
            {summary?.simulation_time || '10:24 AM'}
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
            summary?.simulation_state === 'RUNNING'
              ? 'bg-[#16A34A] text-white'
              : summary?.simulation_state === 'PAUSED'
              ? 'bg-amber-500 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}>
            {summary?.simulation_state || 'IDLE'}
          </span>
        </div>

        {/* Benchmark / Evaluation Modal Trigger */}
        <button
          onClick={onOpenMetrics}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition shadow-xs cursor-pointer"
          title="Open Evaluation & Benchmark Metrics"
        >
          <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Benchmarks</span>
        </button>
      </div>
    </header>
  );
};
