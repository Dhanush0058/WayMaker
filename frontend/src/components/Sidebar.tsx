import React, { useState, useEffect } from 'react';
import {
  Map,
  ClipboardList,
  Bus,
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
    { id: 'live-map', label: 'Live Map', icon: Map },
    { id: 'tickets', label: 'Tickets', icon: ClipboardList },
    { id: 'buses', label: 'Transit Buses', icon: Bus },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  // Dynamic simulation feed state with periodic telematics pings
  const [dynamicFeed, setDynamicFeed] = useState<
    { id: string; title: string; desc: string; time: string; tag: string; tagColor: string }[]
  >([
    {
      id: 'f-1',
      title: 'Bus #42 Telematics',
      desc: 'Speed: 44 km/h • Somajiguda Corridor',
      time: '10:24 AM',
      tag: 'TELEMETRY',
      tagColor: 'bg-emerald-50 text-[#16A34A] border-emerald-200',
    },
    {
      id: 'f-2',
      title: 'Ticket #TK-108 Created',
      desc: 'Pothole verified on 5th Avenue',
      time: '10:22 AM',
      tag: 'TICKET',
      tagColor: 'bg-red-50 text-red-600 border-red-200',
    },
    {
      id: 'f-3',
      title: 'Green Wave Synced',
      desc: 'Signals clear for Corridor 4',
      time: '10:20 AM',
      tag: 'SIGNAL',
      tagColor: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      id: 'f-4',
      title: 'Bus #18 Telematics',
      desc: 'Speed: 28 km/h • MG Road Corridor',
      time: '10:18 AM',
      tag: 'TELEMETRY',
      tagColor: 'bg-emerald-50 text-[#16A34A] border-emerald-200',
    },
  ]);

  // Append real backend events when available, or simulate realistic telematics ticks
  useEffect(() => {
    if (events && events.length > 0) {
      const mapped = events.slice(-6).map((evt) => ({
        id: evt.id,
        title: evt.title || evt.category || 'System Event',
        desc: evt.description,
        time: evt.time || '10:24 AM',
        tag: evt.category?.toUpperCase() || 'EVENT',
        tagColor: evt.severity === 'danger'
          ? 'bg-red-50 text-red-600 border-red-200'
          : 'bg-emerald-50 text-[#16A34A] border-emerald-200',
      }));
      setDynamicFeed(mapped.reverse());
    }
  }, [events]);

  // Periodic heartbeat animation to keep the live feed actively moving
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const speeds = [32, 45, 28, 51, 38, 42];
      const speed = speeds[Math.floor(Math.random() * speeds.length)];
      const busNum = Math.random() > 0.5 ? '42' : '18';

      const newPing = {
        id: `ping-${Date.now()}`,
        title: `Bus #${busNum} Telematics`,
        desc: `Speed: ${speed} km/h • Corridor normal`,
        time: timeStr,
        tag: 'LIVE PING',
        tagColor: 'bg-emerald-50 text-[#16A34A] border-emerald-200',
      };

      setDynamicFeed((prev) => [newPing, ...prev.slice(0, 7)]);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col justify-between shrink-0 h-[calc(100vh-61px)]">
      {/* Navigation Menu */}
      <div>
        <p className="text-[11px] font-semibold uppercase text-gray-400 tracking-wider px-3 mb-2">
          Platform
        </p>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 text-[#16A34A]'
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

      {/* Dynamic Real-Time Live Feed */}
      <div className="pt-4 border-t border-gray-100 flex flex-col min-h-0 flex-1 mt-4">
        <div className="flex items-center justify-between mb-2.5 px-1 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
            <h3 className="font-bold text-xs text-gray-900">Live Event Feed</h3>
          </div>
          <span className="text-[11px] text-gray-400 font-medium">Real-Time</span>
        </div>

        <div className="space-y-2 overflow-y-auto pr-1 flex-1">
          {dynamicFeed.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (item.tag.includes('TICKET')) setActiveTab('tickets');
                else if (item.tag.includes('TELEMETRY')) setActiveTab('buses');
                else setActiveTab('live-map');
              }}
              className="p-2.5 rounded-lg border border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-white transition flex items-center justify-between text-xs cursor-pointer"
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded border ${item.tagColor}`}>
                    {item.tag}
                  </span>
                  <span className="text-[10px] text-gray-400">{item.time}</span>
                </div>
                <p className="text-[11px] font-semibold text-gray-800 mt-1 truncate">
                  {item.title}
                </p>
                <p className="text-[10px] text-gray-500 truncate">
                  {item.desc}
                </p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
