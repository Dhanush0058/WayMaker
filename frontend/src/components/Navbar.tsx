import React from 'react';
import { ShieldAlert, Activity, Clock, Bell, User, BarChart2, Radio } from 'lucide-react';
import { DashboardSummary } from '../types';

interface NavbarProps {
  summary?: DashboardSummary;
  isConnected: boolean;
  onOpenMetrics: () => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  summary,
  isConnected,
  onOpenMetrics,
  unreadCount = 2,
}) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 px-6 py-3 shadow-xs">
      <div className="flex items-center justify-between">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-md shadow-brand-600/30 text-white font-bold text-xl">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-gray-900">WayMaker</span>
                <span className="bg-brand-50 text-brand-800 text-xs px-2 py-0.5 rounded-full font-semibold border border-brand-200">
                  v1.0 OPS
                </span>
              </div>
              <p className="text-xs text-gray-700 font-medium tracking-wide">
                Smarter Roads. Safer Lives.
              </p>
            </div>
          </div>
        </div>

        {/* Live Status & Clock */}
        <div className="flex items-center gap-5">
          {/* Live System Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
            <span className="relative flex h-3 w-3">
              {isConnected ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-600"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              )}
            </span>
            <span className="text-xs font-semibold text-gray-700">
              {isConnected ? 'LIVE TELEMETRY STREAM' : 'OFFLINE'}
            </span>
            <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-brand-600 animate-pulse' : 'text-gray-400'}`} />
          </div>

          {/* Simulation Time */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-brand-50 border border-brand-200 text-brand-900">
            <Clock className="w-4 h-4 text-brand-700" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-750">Sim Clock:</span>
            <span className="font-mono text-sm font-extrabold text-brand-900">
              {summary?.simulation_time || '08:15:00'}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
              summary?.simulation_state === 'RUNNING' 
                ? 'bg-brand-600 text-white' 
                : summary?.simulation_state === 'PAUSED'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}>
              {summary?.simulation_state || 'IDLE'}
            </span>
          </div>

          {/* Evaluation Metrics Modal Trigger */}
          <button
            onClick={onOpenMetrics}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-750 text-xs font-semibold transition border border-gray-250 cursor-pointer"
            title="View Evaluation & Benchmarks"
          >
            <BarChart2 className="w-4 h-4 text-brand-700" />
            <span>Benchmark Metrics</span>
          </button>

          {/* Notifications */}
          <div className="relative cursor-pointer p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>

          {/* Operator Profile */}
          <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
            <div className="w-8 h-8 rounded-full bg-brand-100 border border-brand-300 flex items-center justify-center text-brand-800">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-gray-900 leading-tight">Cmdr. J. Vance</p>
              <p className="text-[10px] text-gray-500 font-medium">Metro Traffic Ops</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
