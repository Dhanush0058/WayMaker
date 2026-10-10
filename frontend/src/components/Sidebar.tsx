import React from 'react';
import {
  Map,
  ClipboardList,
  Bus,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const navItems = [
    { id: 'live-map', label: 'Live Map', icon: Map },
    { id: 'tickets', label: 'Tickets', icon: ClipboardList },
    { id: 'buses', label: 'Transit Buses', icon: Bus },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col justify-between shrink-0 h-[calc(100vh-61px)]">
      {/* Navigation Menu */}
      <div>
        <p className="text-[11px] font-semibold uppercase text-gray-400 tracking-wider px-3 mb-2">
          Control Center
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
                    ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200/60'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
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

      {/* Subtle Platform Status Footer */}
      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-500 space-y-1">
        <div className="flex items-center gap-1.5 font-semibold text-gray-700">
          <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
          <span>Municipal AI Active</span>
        </div>
        <p className="text-[11px] text-gray-500">Continuous telematics & SLA enforcement.</p>
      </div>
    </aside>
  );
};
