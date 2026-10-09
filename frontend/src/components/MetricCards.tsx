import React from 'react';
import { Ambulance, Bus, AlertTriangle, TrafficCone } from 'lucide-react';
import { DashboardSummary } from '../types';

interface MetricCardsProps {
  summary?: DashboardSummary;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      {/* 1. Active Ambulances */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex items-center gap-4 hover:shadow-md transition">
        <div className="w-12 h-12 rounded-xl bg-[#EBF8EE] text-[#16A34A] flex items-center justify-center shrink-0">
          <Ambulance className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-gray-900 leading-none">
            {summary?.active_ambulances ?? 3}
          </h3>
          <p className="text-xs font-semibold text-gray-700 mt-1">Active Ambulances</p>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#16A34A] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
            <span>All on track</span>
          </div>
        </div>
      </div>

      {/* 2. Buses on Road */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex items-center gap-4 hover:shadow-md transition">
        <div className="w-12 h-12 rounded-xl bg-[#EBF8EE] text-[#16A34A] flex items-center justify-center shrink-0">
          <Bus className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-gray-900 leading-none">
            {summary?.reporting_buses ?? 42}
          </h3>
          <p className="text-xs font-semibold text-gray-700 mt-1">Buses on Road</p>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#16A34A] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
            <span>Live Tracking</span>
          </div>
        </div>
      </div>

      {/* 3. Hazards Detected */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex items-center gap-4 hover:shadow-md transition">
        <div className="w-12 h-12 rounded-xl bg-red-50 text-[#DC2626] flex items-center justify-center shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-gray-900 leading-none">
            {summary?.active_hazards ?? 6}
          </h3>
          <p className="text-xs font-semibold text-gray-700 mt-1">Hazards Detected</p>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#DC2626] font-bold">
            <span>+ 2 New</span>
          </div>
        </div>
      </div>

      {/* 4. Traffic Signals */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex items-center gap-4 hover:shadow-md transition">
        <div className="w-12 h-12 rounded-xl bg-[#EBF8EE] text-[#16A34A] flex items-center justify-center shrink-0">
          <div className="w-4 h-7 bg-gray-800 rounded flex flex-col items-center justify-around py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shadow-sm shadow-[#22C55E]"></span>
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-black text-gray-900 leading-none">
            {summary?.signals_monitored ?? 126}
          </h3>
          <p className="text-xs font-semibold text-gray-700 mt-1">Traffic Signals</p>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#16A34A] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
            <span>98 Synced</span>
          </div>
        </div>
      </div>
    </div>
  );
};
