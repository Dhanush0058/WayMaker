import React from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert, Sparkles, Clock } from 'lucide-react';
import { Hazard } from '../types';

interface HazardPanelProps {
  hazards: Hazard[];
  onVerifyHazard: (hazardId: string, status: string) => void;
}

export const HazardPanel: React.FC<HazardPanelProps> = ({ hazards, onVerifyHazard }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200/90 shadow-xs flex flex-col h-[320px]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-hazard-red" />
          <h3 className="font-bold text-gray-900 text-sm">Active Incident Verification Engine</h3>
        </div>
        <span className="text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
          {hazards.length} Detected
        </span>
      </div>

      {/* Content */}
      <div className="p-3 overflow-y-auto flex-1 space-y-3">
        {hazards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
            <p className="text-sm font-bold text-gray-800">All Corridors Clear</p>
            <p className="text-xs text-gray-500 mt-0.5">
              No road hazards, sinkholes, or obstructions detected.
            </p>
          </div>
        ) : (
          hazards.map((h) => {
            const isConfirmed = h.status === 'confirmed';
            const isProbable = h.status === 'probable';
            const confidencePct = Math.round(h.confidence * 100);

            return (
              <div
                key={h.id}
                className="p-3 rounded-lg border border-red-200/90 bg-red-50/40 text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 font-bold text-gray-900">
                      <ShieldAlert className="w-4 h-4 text-hazard-red" />
                      <span>{h.location_name}</span>
                    </div>
                    <span className="font-mono text-[10px] text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {h.detection_time}
                    </span>
                  </div>

                  <p className="text-gray-700 font-medium my-1">{h.description}</p>

                  {/* Confidence Bar */}
                  <div className="mt-2 mb-2">
                    <div className="flex justify-between items-center text-[10px] font-semibold text-gray-600 mb-1">
                      <span>AI Verification Confidence</span>
                      <span className="font-bold text-gray-900">{confidencePct}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          confidencePct >= 75
                            ? 'bg-red-600'
                            : confidencePct >= 45
                            ? 'bg-amber-500'
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${confidencePct}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-red-100">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-semibold">Status:</span>
                      <span
                        className={`px-2 py-0.5 rounded font-black uppercase text-[10px] ${
                          isConfirmed
                            ? 'bg-red-600 text-white'
                            : isProbable
                            ? 'bg-amber-500 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {h.status}
                      </span>
                    </div>

                    {/* Operator Override Controls */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onVerifyHazard(h.id, 'confirmed')}
                        className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold cursor-pointer transition shadow-xs"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => onVerifyHazard(h.id, 'probable')}
                        className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold cursor-pointer transition"
                      >
                        Probable
                      </button>
                      <button
                        onClick={() => onVerifyHazard(h.id, 'unverified')}
                        className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-[10px] font-bold cursor-pointer transition"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
