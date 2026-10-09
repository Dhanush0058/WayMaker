import React from 'react';
import { Ambulance, Bus, AlertTriangle, Cpu, Timer, TrendingUp, CheckCircle } from 'lucide-react';
import { DashboardSummary } from '../types';

interface SummaryCardsProps {
  summary?: DashboardSummary;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  const cards = [
    {
      title: 'Active Ambulances',
      value: summary?.active_ambulances ?? 0,
      subtext: summary?.active_ambulances ? 'EN-ROUTE • Priority Code 3' : 'Standby at Metro General',
      icon: Ambulance,
      accent: 'border-l-4 border-l-brand-600',
      badge: summary?.active_ambulances ? 'Dispatched' : 'Ready',
      badgeColor: summary?.active_ambulances ? 'bg-brand-100 text-brand-800' : 'bg-gray-100 text-gray-700',
    },
    {
      title: 'City Buses Reporting',
      value: summary?.reporting_buses ?? 3,
      subtext: 'GPS Telemetry streaming (1 Hz)',
      icon: Bus,
      accent: 'border-l-4 border-l-blue-500',
      badge: 'Active Fleet',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      title: 'Active Road Hazards',
      value: summary?.active_hazards ?? 0,
      subtext: summary?.active_hazards ? 'Incident verified on 5th Ave' : 'All arterial corridors clear',
      icon: AlertTriangle,
      accent: summary?.active_hazards ? 'border-l-4 border-l-hazard-red' : 'border-l-4 border-l-brand-600',
      badge: summary?.active_hazards ? 'Action Required' : 'Nominal',
      badgeColor: summary?.active_hazards ? 'bg-red-100 text-red-800 animate-pulse' : 'bg-brand-100 text-brand-800',
    },
    {
      title: 'Smart Traffic Signals',
      value: summary?.signals_monitored ?? 11,
      subtext: 'Connected adaptive intersections',
      icon: Cpu,
      accent: 'border-l-4 border-l-emerald-600',
      badge: 'Green Wave Ready',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      title: 'Ambulance Arrival (ETA)',
      value: summary?.estimated_ambulance_arrival ?? 'Standby',
      subtext: summary?.time_saved_str ?? '11.0 mins saved vs baseline',
      icon: Timer,
      accent: 'border-l-4 border-l-brand-700 bg-brand-50/40',
      badge: 'AI Optimized',
      badgeColor: 'bg-brand-600 text-white font-bold',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`bg-white rounded-xl p-4 border border-gray-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition duration-200 ${card.accent}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {card.title}
                </p>
                <h3 className="text-2xl font-black text-gray-900 mt-1">
                  {card.value}
                </h3>
              </div>
              <div className="p-2 rounded-lg bg-gray-50 text-gray-700">
                <Icon className="w-5 h-5 text-gray-700" />
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-500 font-medium truncate max-w-[150px]">
                {card.subtext}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${card.badgeColor}`}>
                {card.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
