import React from 'react';
import {
  Map,
  AlertTriangle,
  Bus,
  Ambulance,
  TrafficCone,
  BarChart3,
  FileText,
  Settings,
  ChevronRight,
  Radio,
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
  events,
}) => {
  const navItems = [
    { id: 'live-map', label: 'Live Map', icon: Map, badge: null },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle, badge: '5' },
    { id: 'buses', label: 'Buses', icon: Bus, badge: null },
    { id: 'ambulances', label: 'Ambulances', icon: Ambulance, badge: null },
    { id: 'signals', label: 'Traffic Signals', icon: TrafficCone, badge: null },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: null },
    { id: 'reports', label: 'Reports', icon: FileText, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  // Default mock feed items matching the screenshot
  const displayFeed = [
    {
      id: 'f-1',
      icon: Bus,
      iconColor: 'text-[#DC2626]',
      bgIcon: 'bg-red-50 border-red-200',
      title: 'Bus 42',
      time: '10:21 AM',
      highlight: 'Hazard Detected',
      detail: 'Pothole on 5th Avenue',
      highlightColor: 'text-[#DC2626]',
    },
    {
      id: 'f-2',
      icon: TrafficCone,
      iconColor: 'text-[#16A34A]',
      bgIcon: 'bg-emerald-50 border-emerald-200',
      title: 'Traffic Signal',
      time: '10:20 AM',
      highlight: 'Signal Synced',
      detail: 'Green for Ambulance Route',
      highlightColor: 'text-[#16A34A]',
    },
    {
      id: 'f-3',
      icon: Ambulance,
      iconColor: 'text-[#DC2626]',
      bgIcon: 'bg-red-50 border-red-200',
      title: 'Ambulance A-17',
      time: '10:19 AM',
      highlight: 'Route Updated',
      detail: 'ETA: 8 min (Saved 4 min)',
      highlightColor: 'text-[#16A34A]',
    },
    {
      id: 'f-4',
      icon: Bus,
      iconColor: 'text-[#16A34A]',
      bgIcon: 'bg-emerald-50 border-emerald-200',
      title: 'Bus 18',
      time: '10:17 AM',
      highlight: 'Rough Road Detected',
      detail: 'Location: MG Road',
      highlightColor: 'text-gray-700',
    },
    {
      id: 'f-5',
      icon: TrafficCone,
      iconColor: 'text-[#16A34A]',
      bgIcon: 'bg-emerald-50 border-emerald-200',
      title: 'Traffic Signal',
      time: '10:15 AM',
      highlight: 'Signal Synced',
      detail: 'Green for Ambulance Route',
      highlightColor: 'text-[#16A34A]',
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200/80 p-4 flex flex-col justify-between shrink-0">
      {/* Top: Nav Menu */}
      <div>
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
                    ? 'bg-[#EBF8EE] text-[#16A34A]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#16A34A]' : 'text-gray-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-[#DC2626] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Real-time Feed */}
      <div className="mt-6 pt-4 border-t border-gray-150">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-extrabold text-xs text-gray-900">Real-time Feed</h3>
          <button
            onClick={() => setActiveTab('reports')}
            className="text-[11px] font-bold text-[#16A34A] hover:underline cursor-pointer"
          >
            See All
          </button>
        </div>

        <div className="space-y-2 overflow-y-auto max-h-[320px] pr-1">
          {displayFeed.map((item) => {
            const Icon = item.icon;
            const targetTab = item.title.includes('Bus')
              ? 'buses'
              : item.title.includes('Signal')
              ? 'signals'
              : item.title.includes('Ambulance')
              ? 'ambulances'
              : 'incidents';

            return (
              <div
                key={item.id}
                onClick={() => setActiveTab(targetTab)}
                className="p-2.5 rounded-xl border border-gray-100 hover:border-[#16A34A]/50 bg-gray-50/50 hover:bg-white transition flex items-center justify-between text-xs cursor-pointer shadow-2xs hover:shadow-xs"
              >
                <div className="flex items-start gap-2.5">
                  <div className={`p-1.5 rounded-lg border ${item.bgIcon} shrink-0 mt-0.5`}>
                    <Icon className={`w-3.5 h-3.5 ${item.iconColor}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-[11px]">{item.title}</span>
                      <span className="text-[10px] text-gray-400 font-medium">{item.time}</span>
                    </div>
                    <p className={`text-[11px] font-bold mt-0.5 ${item.highlightColor}`}>
                      {item.highlight}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate max-w-[125px]">{item.detail}</p>
                  </div>
                </div>

                <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
