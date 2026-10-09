import React from 'react';
import { Ambulance, Navigation, CheckCircle2, Clock, Zap, MapPin } from 'lucide-react';
import { AmbulanceRoute } from '../../types';

interface AmbulancesViewProps {
  ambulance?: AmbulanceRoute;
  onDispatch: () => void;
  onSecondaryAccident: () => void;
}

export const AmbulancesView: React.FC<AmbulancesViewProps> = ({
  ambulance,
  onDispatch,
  onSecondaryAccident,
}) => {
  const units = [
    {
      id: 'Ambulance A-17',
      base: 'Mehdipatnam Dispatch Hub',
      destination: 'City General Hospital',
      status: ambulance?.status || 'EN_ROUTE',
      eta: ambulance ? `${Math.round(ambulance.updated_eta_s / 60)} min` : '8 min',
      baseline_eta: '12 min (via 5th Ave blocked)',
      time_saved: '4 min (33% Faster)',
      speed: `${ambulance ? Math.round(ambulance.speed_kmh) : 52} km/h`,
      distance: `${ambulance ? (ambulance.route_distance_m / 1000).toFixed(1) : 4.2} km`,
      priority: 'Code Red 1 (Trauma)',
      active: true,
      reason: ambulance?.reroute_reason || 'Bypassing 5th Avenue Pothole / Road Rupture via Somajiguda West Corridor',
    },
    {
      id: 'Ambulance B-04',
      base: 'Banjara Hills Medical Outpost',
      destination: 'Care Hospital',
      status: 'STANDBY',
      eta: 'Standby (6 min est)',
      baseline_eta: '6 min',
      time_saved: '0 min',
      speed: '0 km/h',
      distance: '3.1 km',
      priority: 'Priority Code 2',
      active: false,
      reason: 'Stationed on standby at Outpost 4',
    },
    {
      id: 'Ambulance C-12',
      base: 'Secunderabad Trauma Center',
      destination: 'Gandhi Hospital',
      status: 'RETURNING',
      eta: 'Standby',
      baseline_eta: '10 min',
      time_saved: '0 min',
      speed: '38 km/h',
      distance: '5.8 km',
      priority: 'Routine Transfer',
      active: false,
      reason: 'Returning to base after successful patient handover',
    },
  ];

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-gray-900">Emergency Ambulance Coordination</h2>
            <span className="bg-[#EBF8EE] text-[#16A34A] border border-[#BBF7D0] px-2.5 py-0.5 rounded-full font-bold text-xs">
              3 Emergency Units Monitored
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Dynamic Dijkstra graph pathfinding, real-time hazard avoidance, and signal preemption synchronization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onDispatch}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs transition shadow-xs shadow-[#16A34A]/20 cursor-pointer"
          >
            <Navigation className="w-4 h-4" />
            <span>Dispatch Ambulance A-17</span>
          </button>
          <button
            onClick={onSecondaryAccident}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs transition border border-amber-300 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-700" />
            <span>Simulate Mid-Route Reroute</span>
          </button>
        </div>
      </div>

      {/* Units List */}
      <div className="space-y-4">
        {units.map((unit) => {
          const isEnRoute = unit.status === 'EN_ROUTE';

          return (
            <div
              key={unit.id}
              className={`bg-white rounded-2xl p-5 border transition shadow-xs hover:shadow-md ${
                isEnRoute ? 'border-[#16A34A]/40 bg-[#F0FDF4]/20' : 'border-gray-200/80'
              }`}
            >
              <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
                    <Ambulance className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-gray-900">{unit.id}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                        {unit.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                      {unit.base} → <strong className="text-gray-800">{unit.destination}</strong>
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    isEnRoute
                      ? 'bg-[#16A34A] text-white animate-pulse'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {unit.status}
                </span>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-white border border-gray-150 mb-3 text-left">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Dynamic ETA</span>
                  <p className="text-xl font-black text-[#16A34A]">{unit.eta}</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Baseline (Blocked)</span>
                  <p className="text-base font-bold text-gray-400 line-through">{unit.baseline_eta}</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Time Saved</span>
                  <p className="text-base font-extrabold text-emerald-700">+{unit.time_saved}</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Speed / Distance</span>
                  <p className="text-base font-black text-gray-900">{unit.speed} • {unit.distance}</p>
                </div>
              </div>

              {/* Reroute explanation */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold">Active AI Routing Strategy: </span>
                  <span>{unit.reason}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
