import React from 'react';
import {
  Map,
  AlertTriangle,
  Bus,
  Ambulance,
  TrafficCone,
  BarChart3,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { SimEvent } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  events: SimEvent[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  events = [],
}) => {
  const navItems = [
    { id: 'live-map', label: 'Live Emergency Map', icon: Map },
    { id: 'incidents', label: 'Incidents & Hazards', icon: AlertTriangle },
    { id: 'ambulances', label: 'Ambulances', icon: Ambulance },
    { id: 'buses', label: 'Transit Buses', icon: Bus },
    { id: 'signals', label: 'Traffic Signals', icon: TrafficCone },
    { id: 'analytics', label: 'Analytics & Benchmarks', icon: BarChart3 },
  ];

  // Derive recent events list from real dynamic events
  const recentEvents = events.slice(-8).reverse();

  return (
    <aside className="w-64 bg-white border-r border-gray-200/80 p-4 flex flex-col justify-between shrink-0 h-[calc(100vh-65px)]">
      {/* Navigation Menu */}
      <div>
        <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider px-3 mb-2">
          Operations
        </p>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? 'bg-[#EBF8EE] text-[#16A34A] shadow-xs'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#16A34A]' : 'text-gray-500'}`} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Real-time Dynamic Event Stream */}
      <div className="pt-4 border-t border-gray-150 flex flex-col min-h-0 flex-1 mt-4">
        <div className="flex items-center justify-between mb-2.5 px-1 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
            <h3 className="font-extrabold text-xs text-gray-900">Live Event Feed</h3>
          </div>
          <span className="text-[10px] text-gray-400 font-semibold">{recentEvents.length} events</span>
        </div>

        <div className="space-y-2 overflow-y-auto pr-1 flex-1">
          {recentEvents.length === 0 ? (
            <div className="p-3 text-center text-xs text-gray-400 bg-gray-50 rounded-xl border border-gray-100">
              <Clock className="w-4 h-4 mx-auto mb-1 text-gray-300" />
              Waiting for live telemetry events...
            </div>
          ) : (
            recentEvents.map((evt) => {
              const category = evt.category?.toLowerCase() || '';
              const isHazard = category.includes('hazard') || category.includes('water') || evt.severity === 'danger';
              const isSignal = category.includes('signal') || category.includes('green');
              const isAmbulance = category.includes('ambulance') || category.includes('route');

              const badgeColor = isHazard
                ? 'text-[#DC2626] bg-red-50 border-red-200'
                : isSignal
                ? 'text-[#16A34A] bg-emerald-50 border-emerald-200'
                : isAmbulance
                ? 'text-blue-700 bg-blue-50 border-blue-200'
                : 'text-gray-700 bg-gray-50 border-gray-200';

              const targetTab = isHazard
                ? 'incidents'
                : isSignal
                ? 'signals'
                : isAmbulance
                ? 'ambulances'
                : 'buses';

              return (
                <div
                  key={evt.id}
                  onClick={() => setActiveTab(targetTab)}
                  className="p-2.5 rounded-xl border border-gray-100 hover:border-[#16A34A]/40 bg-gray-50/60 hover:bg-white transition flex items-center justify-between text-xs cursor-pointer shadow-2xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${badgeColor}`}>
                        {evt.title || evt.category || 'EVENT'}
                      </span>
                      <span className="text-[10px] text-gray-400">{evt.time}</span>
                    </div>
                    <p className="text-[11px] font-bold text-gray-800 mt-1 truncate">
                      {evt.description}
                    </p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
};
