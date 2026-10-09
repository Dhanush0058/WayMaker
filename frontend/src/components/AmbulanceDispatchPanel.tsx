import React from 'react';
import { Ambulance, MapPin, Navigation2, CheckCircle, ArrowRight, Zap, AlertCircle } from 'lucide-react';
import { AmbulanceRoute } from '../types';

interface AmbulanceDispatchPanelProps {
  ambulance?: AmbulanceRoute;
  onDispatch: () => void;
}

export const AmbulanceDispatchPanel: React.FC<AmbulanceDispatchPanelProps> = ({
  ambulance,
  onDispatch,
}) => {
  const isEnRoute = ambulance?.status === 'EN_ROUTE';
  const isArrived = ambulance?.status === 'ARRIVED';
  const updatedMins = ambulance ? (ambulance.updated_eta_s / 60).toFixed(1) : '4.0';
  const originalMins = ambulance ? (ambulance.original_eta_s / 60).toFixed(1) : '15.0';
  const timeSavedMins = (parseFloat(originalMins) - parseFloat(updatedMins)).toFixed(1);

  return (
    <div className="bg-white rounded-xl border border-gray-200/90 shadow-xs p-4 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-brand-50 text-brand-700">
              <Ambulance className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-gray-900 text-sm">
                  {ambulance?.ambulance_id ?? 'AMB-01'} • Emergency Dispatch
                </h3>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    isEnRoute
                      ? 'bg-brand-600 text-white animate-pulse'
                      : isArrived
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {ambulance?.status ?? 'IDLE'}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium">Priority Code Red (Trauma)</p>
            </div>
          </div>

          <button
            onClick={onDispatch}
            disabled={isEnRoute}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
              isEnRoute
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/20'
            }`}
          >
            <Navigation2 className="w-3.5 h-3.5" />
            <span>{isEnRoute ? 'En Route' : 'Dispatch Unit'}</span>
          </button>
        </div>

        {/* Origin & Destination */}
        <div className="grid grid-cols-2 gap-3 my-3 p-2.5 bg-gray-50 rounded-lg border border-gray-150 text-xs">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Origin</span>
            <div className="flex items-center gap-1.5 font-bold text-gray-800 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-brand-600"></div>
              <span className="truncate">{ambulance?.hospital_name ?? 'Metro General Hospital'}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Target Incident</span>
            <div className="flex items-center gap-1.5 font-bold text-gray-800 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-red-600"></div>
              <span className="truncate">{ambulance?.patient_name ?? 'Downtown Plaza'}</span>
            </div>
          </div>
        </div>

        {/* ETA Comparison Card */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-brand-50/50 rounded-xl border border-brand-200/80 mb-3 text-center">
          <div className="p-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase">Default ETA (5th Ave)</span>
            <div className="text-base font-black text-gray-400 line-through mt-0.5">
              {originalMins} mins
            </div>
            <span className="text-[10px] text-red-600 font-semibold">Closure Delay</span>
          </div>

          <div className="p-1 bg-white rounded-lg shadow-xs border border-brand-200">
            <span className="text-[10px] font-bold text-brand-700 uppercase">WayMaker ETA</span>
            <div className="text-lg font-black text-brand-700 mt-0.5">
              {updatedMins} mins
            </div>
            <span className="text-[10px] text-brand-600 font-bold">Safe Dynamic Route</span>
          </div>

          <div className="p-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase">Time Saved</span>
            <div className="text-base font-black text-emerald-700 mt-0.5">
              +{timeSavedMins} mins
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold">73% Faster</span>
          </div>
        </div>

        {/* Routing Rationale */}
        <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>AI Reroute Explanation:</span>
          </div>
          <p className="text-amber-800 text-[11px] leading-relaxed">
            {ambulance?.reroute_reason ??
              'Initial optimal dispatch path generated avoiding 5th Avenue blockage via 6th Avenue.'}
          </p>
        </div>
      </div>

      {/* Corridor Breakdown Footer */}
      <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
        <span>Distance: {ambulance ? (ambulance.route_distance_m / 1000).toFixed(2) : '2.40'} km</span>
        <span>Recalculations: {ambulance?.reroute_count ?? 1}</span>
        <span className="text-brand-700 font-bold">Speed: {ambulance?.speed_kmh ?? 52} km/h</span>
      </div>
    </div>
  );
};
