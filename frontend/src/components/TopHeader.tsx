import React from 'react';
import { Search, Bell, ChevronDown, Radio, BarChart2 } from 'lucide-react';
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
    <header className="bg-white border-b border-gray-200/80 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      {/* Left: WayMaker Brand */}
      <div className="flex items-center gap-3 min-w-[240px]">
        <div className="w-9 h-9 rounded-full bg-[#16A34A] flex items-center justify-center text-white shadow-sm shadow-[#16A34A]/30">
          <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
            <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z"/>
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 leading-tight">WayMaker</h1>
          <p className="text-[11px] text-gray-500 font-medium">Smart Routes. Safer Cities.</p>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-xl mx-8">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search location, bus, incident, or road..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50/80 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#16A34A] focus:border-[#16A34A] transition"
          />
        </div>
      </div>

      {/* Right: Date, Live Pill, Bell, Profile */}
      <div className="flex items-center gap-5">
        {/* Date & Time */}
        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold text-gray-800">Thu, 10 Oct 2026</p>
          <p className="text-[11px] font-bold text-gray-900">
            {summary?.simulation_time || '10:24 AM'}
          </p>
        </div>

        {/* Live Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF8EE] border border-[#BBF7D0] text-[#16A34A] text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
          <span>Live</span>
        </div>

        {/* Benchmark Metrics shortcut */}
        <button
          onClick={onOpenMetrics}
          className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 transition border border-gray-200 cursor-pointer"
          title="Open Evaluation & Benchmark Metrics"
        >
          <BarChart2 className="w-4 h-4 text-[#16A34A]" />
        </button>

        {/* Notification Bell */}
        <div className="relative cursor-pointer p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-0 right-0 w-4 h-4 bg-[#DC2626] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            3
          </span>
        </div>

        {/* City Admin Profile */}
        <div className="flex items-center gap-2 pl-3 border-l border-gray-200 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-700 font-bold text-xs">
            CA
          </div>
          <div className="text-left hidden md:block">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-gray-900">City Admin</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </div>
            <p className="text-[10px] text-gray-500 font-medium">Control Center</p>
          </div>
        </div>
      </div>
    </header>
  );
};
