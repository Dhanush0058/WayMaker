import React from 'react';
import { Bus, Navigation, AlertTriangle, CheckCircle, Radio, Gauge } from 'lucide-react';
import { VehicleEvent } from '../../types';

interface BusesViewProps {
  vehicles: VehicleEvent[];
  onTriggerFalseAlarm: () => void;
  onTriggerWaterBreak: () => void;
}

export const BusesView: React.FC<BusesViewProps> = ({
  vehicles,
  onTriggerFalseAlarm,
  onTriggerWaterBreak,
}) => {
  const busFleet = [
    {
      vehicle_id: 'Bus 42',
      route_name: 'Line 5 — Banjara to Begumpet Express',
      speed: 0,
      status: 'stopped',
      location: '5th Avenue & Banjara Hills',
      anomaly: 'Sudden Deceleration 35 → 0 km/h (Pothole Detected)',
      driver: 'R. Sharma',
      battery: '94%',
      telemetry_rate: '1 Hz Live',
    },
    {
      vehicle_id: 'Bus 18',
      route_name: 'Line 2 — Tolichowki to Mehdipatnam',
      speed: 32,
      status: 'normal',
      location: 'MG Road Transit Corridor',
      anomaly: null,
      driver: 'A. Kumar',
      battery: '88%',
      telemetry_rate: '1 Hz Live',
    },
    {
      vehicle_id: 'Bus 27',
      route_name: 'Line 8 — Somajiguda Lake Loop',
      speed: 38,
      status: 'normal',
      location: 'Necklace Road Shoreline',
      anomaly: null,
      driver: 'K. Rao',
      battery: '91%',
      telemetry_rate: '1 Hz Live',
    },
    {
      vehicle_id: 'Patrol 09',
      route_name: 'Municipal Inspection Unit 9',
      speed: 40,
      status: 'normal',
      location: 'Khairatabad Outer Arterial',
      anomaly: null,
      driver: 'Unit 9 Officer',
      battery: '96%',
      telemetry_rate: '1 Hz Live',
    },
  ];

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-gray-900">City Transit Fleet Telematics</h2>
            <span className="bg-[#EBF8EE] text-[#16A34A] border border-[#BBF7D0] px-2.5 py-0.5 rounded-full font-bold text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse"></span>
              42 Connected City Buses
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time GPS tracking, accelerometer telemetry, passenger boarding geofence verification, and hazard alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onTriggerWaterBreak}
            className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition cursor-pointer"
          >
            Simulate Bus 42 Sudden Halt
          </button>
          <button
            onClick={onTriggerFalseAlarm}
            className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition border border-gray-250 cursor-pointer"
          >
            Simulate Scheduled Bus Stop
          </button>
        </div>
      </div>

      {/* Fleet Telematics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {busFleet.map((bus) => {
          const isAnomaly = !!bus.anomaly;

          return (
            <div
              key={bus.vehicle_id}
              className={`bg-white rounded-2xl p-5 border transition shadow-xs hover:shadow-md flex flex-col justify-between ${
                isAnomaly ? 'border-red-200 bg-red-50/20' : 'border-gray-200/80'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold ${
                      isAnomaly ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-[#EBF8EE] text-[#16A34A]'
                    }`}>
                      <Bus className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-sm">{bus.vehicle_id}</h3>
                      <p className="text-xs text-gray-500 font-medium">{bus.route_name}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    isAnomaly ? 'bg-red-600 text-white animate-pulse' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {isAnomaly ? 'ANOMALY DETECTED' : 'IN TRANSIT'}
                  </span>
                </div>

                {/* Speed & Stats */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-gray-50 border border-gray-150 mb-3 text-left">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Speed</span>
                    <p className={`text-base font-black ${isAnomaly ? 'text-red-600' : 'text-gray-900'}`}>
                      {bus.speed} km/h
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Battery</span>
                    <p className="text-base font-black text-gray-900">{bus.battery}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Stream</span>
                    <p className="text-base font-black text-[#16A34A]">{bus.telemetry_rate}</p>
                  </div>
                </div>

                <div className="text-xs text-gray-600 mb-2">
                  <span className="font-bold text-gray-800">Current Corridor: </span>
                  <span>{bus.location}</span>
                </div>

                {isAnomaly && (
                  <div className="p-2.5 rounded-xl bg-red-100/70 border border-red-200 text-xs text-red-800 font-semibold mb-2">
                    ⚠️ {bus.anomaly}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-gray-150 flex items-center justify-between text-xs text-gray-500">
                <span>Driver: <strong className="text-gray-700">{bus.driver}</strong></span>
                <span className="text-[#16A34A] font-bold">GPS Geofence: Active</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
