import React from 'react';
import { TrafficCone, Cpu, Radio, ShieldCheck, Zap } from 'lucide-react';
import { TrafficSignal } from '../../types';

interface SignalsViewProps {
  signals: TrafficSignal[];
}

export const SignalsView: React.FC<SignalsViewProps> = ({ signals }) => {
  const defaultSignals = [
    { id: 'SIG-1', intersection_name: 'Banjara Hills Rd 1 Junction', current_state: 'EMERGENCY_PREEMPT', coordination_status: 'GREEN_WAVE_ACTIVE', time_to_arrival_s: 18, planned_state: 'EMERGENCY_PREEMPT' },
    { id: 'SIG-2', intersection_name: 'Somajiguda West Bypass', current_state: 'EMERGENCY_PREEMPT', coordination_status: 'GREEN_WAVE_ACTIVE', time_to_arrival_s: 34, planned_state: 'EMERGENCY_PREEMPT' },
    { id: 'SIG-3', intersection_name: 'Somajiguda Main Corridor', current_state: 'YELLOW', coordination_status: 'PREEMPTION_REQUESTED', time_to_arrival_s: 52, planned_state: 'EMERGENCY_PREEMPT' },
    { id: 'SIG-4', intersection_name: 'Somajiguda North Link', current_state: 'GREEN_NS', coordination_status: 'NORMAL', time_to_arrival_s: null, planned_state: 'GREEN_NS' },
    { id: 'SIG-5', intersection_name: 'Hussain Sagar Lake Shore Link', current_state: 'GREEN_NS', coordination_status: 'NORMAL', time_to_arrival_s: null, planned_state: 'GREEN_NS' },
    { id: 'SIG-6', intersection_name: 'Begumpet Flyover Junction', current_state: 'GREEN_NS', coordination_status: 'NORMAL', time_to_arrival_s: null, planned_state: 'GREEN_NS' },
    { id: 'SIG-7', intersection_name: '5th Ave & Banjara West (Blocked)', current_state: 'RED_ALL', coordination_status: 'NORMAL', time_to_arrival_s: null, planned_state: 'RED_ALL' },
    { id: 'SIG-8', intersection_name: '5th Ave & Hazard Junction', current_state: 'RED_ALL', coordination_status: 'NORMAL', time_to_arrival_s: null, planned_state: 'RED_ALL' },
    { id: 'SIG-9', intersection_name: 'Khairatabad Outer 1', current_state: 'GREEN_EW', coordination_status: 'NORMAL', time_to_arrival_s: null, planned_state: 'GREEN_EW' },
    { id: 'SIG-10', intersection_name: 'Khairatabad Main Junction', current_state: 'GREEN_EW', coordination_status: 'NORMAL', time_to_arrival_s: null, planned_state: 'GREEN_EW' },
    { id: 'SIG-11', intersection_name: 'Necklace Road Lake Shore', current_state: 'GREEN_NS', coordination_status: 'NORMAL', time_to_arrival_s: null, planned_state: 'GREEN_NS' },
    { id: 'SIG-12', intersection_name: 'City General Hospital South Gate', current_state: 'EMERGENCY_PREEMPT', coordination_status: 'GREEN_WAVE_ACTIVE', time_to_arrival_s: 90, planned_state: 'EMERGENCY_PREEMPT' },
  ];

  const displayList = signals.length > 0 ? signals : defaultSignals;

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-gray-900">Traffic Signal Coordination Grid</h2>
            <span className="bg-[#EBF8EE] text-[#16A34A] border border-[#BBF7D0] px-2.5 py-0.5 rounded-full font-bold text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse"></span>
              98 Synced Controllers
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Adaptive green-wave corridor preemption with NTCIP 1202 safety clearances and pedestrian buffers.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-gray-50 p-2 rounded-xl border border-gray-200">
          <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
          <span>Safety Interlocks: Min. Green 5s • Clearance 4s</span>
        </div>
      </div>

      {/* Grid of Signals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayList.map((sig) => {
          const isWave = sig.coordination_status === 'GREEN_WAVE_ACTIVE';
          const isPreemptReq = sig.coordination_status === 'PREEMPTION_REQUESTED';
          const isRed = sig.current_state.includes('RED');
          const isYellow = sig.current_state === 'YELLOW';
          const isGreen = sig.current_state.includes('GREEN') || sig.current_state === 'EMERGENCY_PREEMPT';

          return (
            <div
              key={sig.id}
              className={`bg-white rounded-2xl p-4 border transition shadow-xs hover:shadow-md flex flex-col justify-between ${
                isWave ? 'border-[#16A34A] bg-[#F0FDF4]/30' : 'border-gray-200/80'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  {/* Traffic Light Head */}
                  <div className="w-8 h-18 bg-gray-900 rounded-xl p-1.5 flex flex-col items-center justify-between shadow-md shrink-0">
                    <span className={`w-3.5 h-3.5 rounded-full transition ${isRed ? 'bg-red-500 shadow-sm shadow-red-500' : 'bg-gray-800'}`}></span>
                    <span className={`w-3.5 h-3.5 rounded-full transition ${isYellow ? 'bg-amber-400 shadow-sm shadow-amber-400' : 'bg-gray-800'}`}></span>
                    <span className={`w-3.5 h-3.5 rounded-full transition ${isGreen ? 'bg-[#22C55E] shadow-sm shadow-[#22C55E]' : 'bg-gray-800'}`}></span>
                  </div>

                  <div className="flex-1 ml-3">
                    <h3 className="font-extrabold text-gray-900 text-xs leading-tight">
                      {sig.intersection_name}
                    </h3>
                    <p className="font-mono text-[10px] text-gray-400 mt-0.5">ID: {sig.id}</p>

                    <span
                      className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        isWave
                          ? 'bg-[#16A34A] text-white animate-pulse'
                          : isPreemptReq
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {sig.coordination_status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-150 mb-3 text-xs">
                  <div className="flex items-center justify-between text-gray-600 mb-1">
                    <span>Phase State:</span>
                    <span className="font-mono font-bold text-gray-900">{sig.current_state}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Planned Phase:</span>
                    <span className="font-mono font-bold text-[#16A34A]">{sig.planned_state}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                {sig.time_to_arrival_s !== null ? (
                  <span className="font-bold text-[#16A34A] bg-[#EBF8EE] px-2 py-0.5 rounded-md text-[11px]">
                    Ambulance ETA: {sig.time_to_arrival_s}s
                  </span>
                ) : (
                  <span className="text-gray-400 text-[11px]">Standard Cyclic Rotation</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
