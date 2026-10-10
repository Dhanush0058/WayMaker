import React from 'react';
import { BarChart2, Radio } from 'lucide-react';
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
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      {/* Brand & System Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#16A34A] flex items-center justify-center text-white shadow-sm shadow-[#16A34A]/20">
          <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
            <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-gray-900 leading-none">WayMaker</h1>
            <span className="bg-emerald-50 text-[#16A34A] text-[11px] font-semibold px-2 py-0.5 rounded border border-emerald-200">
              Control Center
            </span>
          </div>
          <p className="text-xs text-gray-500 font-normal mt-0.5">Emergency Routing & Municipal Coordination</p>
        </div>
      </div>

      {/* Right Actions: Live Status & Benchmark Trigger */}
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
          isConnected
            ? 'bg-emerald-50 border-emerald-200 text-[#16A34A]'
            : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          <span className="relative flex h-2 w-2">
            {isConnected ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            )}
          </span>
          <span>{isConnected ? 'System Online' : 'Offline'}</span>
        </div>

        <button
          onClick={onOpenMetrics}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-black text-white text-xs font-semibold transition cursor-pointer"
        >
          <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>System Metrics</span>
        </button>
      </div>
    </header>
  );
};
