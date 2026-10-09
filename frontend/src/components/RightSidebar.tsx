import React from 'react';
import { Ambulance, CheckCircle2, Clock, MapPin, Eye, AlertTriangle } from 'lucide-react';
import { AmbulanceRoute, Hazard } from '../types';

interface RightSidebarProps {
  ambulance?: AmbulanceRoute;
  hazards: Hazard[];
  onDispatch: () => void;
  onVerifyHazard: (hazardId: string, status: string) => void;
  onFocusMap: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  ambulance,
  hazards,
  onDispatch,
  onVerifyHazard,
  onFocusMap,
}) => {
  const activeHazard = hazards.length > 0 ? hazards[0] : null;

  return (
    <aside className="w-80 space-y-4 shrink-0 flex flex-col">
      {/* 1. Selected Ambulance Card */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 text-sm">Selected Ambulance</h3>
          <span className="flex items-center gap-1 text-[11px] font-bold text-[#16A34A] bg-[#EBF8EE] px-2 py-0.5 rounded-full border border-[#BBF7D0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse"></span>
            Live
          </span>
        </div>

        {/* Vehicle Header Info */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/70 border border-gray-150 mb-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
            <Ambulance className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">
              {ambulance?.ambulance_id || 'Ambulance A-17'}
            </h4>
            <p className="text-[11px] text-gray-500 font-medium">
              {ambulance?.hospital_name || 'City General Hospital'}
            </p>
          </div>
        </div>

        {/* Metrics Row: ETA, Distance, Speed */}
        <div className="grid grid-cols-3 gap-2 py-2 border-y border-gray-100 text-left mb-3">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase">ETA</span>
            <p className="text-base font-extrabold text-[#16A34A] leading-tight">
              {ambulance ? `${Math.round(ambulance.updated_eta_s / 60)} min` : '8 min'}
            </p>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase">Distance</span>
            <p className="text-base font-extrabold text-gray-900 leading-tight">
              {ambulance ? `${(ambulance.route_distance_m / 1000).toFixed(1)} km` : '4.2 km'}
            </p>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase">Speed</span>
            <p className="text-base font-extrabold text-gray-900 leading-tight">
              {ambulance ? `${Math.round(ambulance.speed_kmh)} km/h` : '52 km/h'}
            </p>
          </div>
        </div>

        {/* Route Status Timeline */}
        <div className="mb-4">
          <h4 className="text-xs font-bold text-gray-900 mb-2">Route Status</h4>
          <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#16A34A]/40 text-xs">
            {/* Step 1 */}
            <div className="flex items-start justify-between relative pl-6">
              <span className="absolute left-1 top-1 w-2.5 h-2.5 rounded-full bg-[#16A34A] border-2 border-white -translate-x-1/2"></span>
              <div>
                <p className="font-bold text-gray-900 leading-tight">On Route</p>
              </div>
              <span className="text-[11px] text-gray-400 font-mono">10:18 AM</span>
            </div>

            {/* Step 2 */}
            <div className="flex items-start justify-between relative pl-6">
              <span className="absolute left-1 top-1 w-2.5 h-2.5 rounded-full bg-[#16A34A] border-2 border-white -translate-x-1/2"></span>
              <div>
                <p className="font-bold text-gray-900 leading-tight">Signals Synced</p>
                <p className="text-[10px] text-[#16A34A] font-bold">6/6 Green</p>
              </div>
              <span className="text-[11px] text-gray-400 font-mono">10:19 AM</span>
            </div>

            {/* Step 3 */}
            <div className="flex items-start justify-between relative pl-6">
              <span className="absolute left-1 top-1 w-2.5 h-2.5 rounded-full bg-[#16A34A] border-2 border-white -translate-x-1/2"></span>
              <div>
                <p className="font-bold text-gray-900 leading-tight">Avoiding Hazard</p>
                <p className="text-[10px] text-gray-500">Pothole on 5th Avenue</p>
              </div>
              <span className="text-[11px] text-gray-400 font-mono">10:21 AM</span>
            </div>

            {/* Step 4 */}
            <div className="flex items-start justify-between relative pl-6">
              <span className="absolute left-1 top-1 w-2.5 h-2.5 rounded-full bg-gray-300 border-2 border-white -translate-x-1/2"></span>
              <div>
                <p className="font-medium text-gray-500 leading-tight">Arriving at Hospital</p>
              </div>
              <span className="text-[11px] text-gray-400 font-mono">10:26 AM</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onDispatch}
          className="w-full py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition shadow-sm shadow-[#16A34A]/30 cursor-pointer text-center"
        >
          View Details
        </button>
      </div>

      {/* 2. Hazard Information Card */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 text-sm">Hazard Information</h3>
          <span className="flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
            Live
          </span>
        </div>

        {/* Thumbnail + Details */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-20 h-16 rounded-xl overflow-hidden border border-gray-200 shrink-0 bg-gray-100 relative">
            <img
              src="/pothole.jpg"
              alt="Detected Road Hazard"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback SVG if image not found
                (e.target as any).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 border-2 border-red-500 rounded-lg pointer-events-none opacity-80"></div>
          </div>

          <div className="flex-1 text-xs">
            <h4 className="font-black text-red-600 text-sm leading-tight">
              {activeHazard ? 'Pothole' : 'Pothole'}
            </h4>
            <p className="text-[11px] text-gray-700 font-medium mt-0.5">
              {activeHazard?.location_name || '5th Avenue, Banjara Hills'}
            </p>
            <p className="text-[10px] text-gray-500 mt-1">
              Detected by: <span className="font-semibold text-gray-800">Bus 42</span>
            </p>
            <p className="text-[10px] text-gray-500">
              Time: <span className="font-mono text-gray-800">10:21 AM</span>
            </p>
          </div>
        </div>

        {/* Severity Badge & View On Map Button */}
        <div className="flex items-center gap-2 pt-1">
          <div className="px-2.5 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 font-bold text-xs flex items-center gap-1 shrink-0">
            <span className="text-red-600 font-black">+</span>
            <span>High</span>
          </div>

          <button
            onClick={onFocusMap}
            className="flex-1 py-1.5 px-3 rounded-lg border border-[#16A34A] text-[#16A34A] hover:bg-[#EBF8EE] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>View on Map</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
