import React from 'react';
import { Activity, AlertCircle, CheckCircle2, Navigation } from 'lucide-react';
import { VehicleEvent, SimEvent } from '../types';

interface LiveDataFeedProps {
  vehicles: VehicleEvent[];
  events: SimEvent[];
}

export const LiveDataFeed: React.FC<LiveDataFeedProps> = ({ vehicles, events }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200/90 shadow-xs flex flex-col h-[320px]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-600" />
          <h3 className="font-bold text-gray-900 text-sm">Live Vehicle Telematics Feed</h3>
        </div>
        <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          {vehicles.length} Streamers
        </span>
      </div>

      {/* Feed List */}
      <div className="p-3 overflow-y-auto flex-1 space-y-2 text-xs">
        {/* Real-time anomaly alerts if present */}
        {vehicles.map((v) => {
          const hasAnomaly = !!v.detected_anomaly;
          return (
            <div
              key={v.vehicle_id}
              className={`p-2.5 rounded-lg border transition ${
                hasAnomaly
                  ? 'bg-red-50/80 border-red-200 text-red-900'
                  : 'bg-gray-50/70 border-gray-150 text-gray-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 font-bold">
                  {hasAnomaly ? (
                    <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                  ) : (
                    <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  )}
                  <span>{v.vehicle_id}</span>
                  <span className="text-gray-400 font-normal">|</span>
                  <span className="font-mono text-gray-700">
                    {Math.round(v.speed)} km/h
                  </span>
                </div>
                <span className="text-[10px] font-mono text-gray-500">{v.timestamp}</span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-600">
                <span className="truncate max-w-[200px]">{v.road_segment_id.replace('SEG_', '')}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    hasAnomaly
                      ? 'bg-red-600 text-white'
                      : v.speed === 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {hasAnomaly ? 'ANOMALY' : v.speed === 0 ? 'STOPPED' : 'TRANSIT'}
                </span>
              </div>

              {hasAnomaly && (
                <div className="mt-1.5 text-[11px] font-semibold text-red-700 bg-red-100/60 p-1.5 rounded">
                  ⚠️ {v.detected_anomaly}
                </div>
              )}
            </div>
          );
        })}

        {/* System event history timeline */}
        <div className="pt-2">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Recent Telemetry Events
          </p>
          {events.slice(0, 5).map((evt) => (
            <div key={evt.id} className="py-1.5 border-b border-gray-100 flex items-start gap-2">
              <span className="font-mono text-[10px] text-gray-400 mt-0.5">{evt.time}</span>
              <div className="flex-1 text-[11px]">
                <span className="font-bold text-gray-900">{evt.title}: </span>
                <span className="text-gray-600">{evt.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
