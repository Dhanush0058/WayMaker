import React from 'react';
import { Cpu, CheckCircle2, Clock, ShieldCheck, Radio } from 'lucide-react';
import { TrafficSignal } from '../types';

interface SignalCoordinationPanelProps {
  signals: TrafficSignal[];
}

export const SignalCoordinationPanel: React.FC<SignalCoordinationPanelProps> = ({ signals }) => {
  // Sort signals so approaching or active green wave ones appear at the top
  const sortedSignals = [...signals].sort((a, b) => {
    if (a.coordination_status === 'GREEN_WAVE_ACTIVE') return -1;
    if (b.coordination_status === 'GREEN_WAVE_ACTIVE') return 1;
    if (a.ambulance_approaching) return -1;
    if (b.ambulance_approaching) return 1;
    return 0;
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200/90 shadow-xs flex flex-col h-[320px]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-gray-900 text-sm">Traffic Signal Coordination (Green Wave)</h3>
        </div>
        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
          <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
          Coordinated Corridor
        </span>
      </div>

      {/* Signal Grid */}
      <div className="p-3 overflow-y-auto flex-1 space-y-2 text-xs">
        {sortedSignals.map((sig) => {
          const isWave = sig.coordination_status === 'GREEN_WAVE_ACTIVE';
          const isPreemptReq = sig.coordination_status === 'PREEMPTION_REQUESTED';

          return (
            <div
              key={sig.id}
              className={`p-2.5 rounded-lg border transition ${
                isWave
                  ? 'bg-emerald-50/90 border-emerald-300 shadow-xs'
                  : isPreemptReq
                  ? 'bg-amber-50/80 border-amber-200'
                  : 'bg-gray-50/60 border-gray-150'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 truncate max-w-[190px]">
                  {sig.intersection_name}
                </span>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wide ${
                      isWave
                        ? 'bg-emerald-600 text-white animate-pulse'
                        : isPreemptReq
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {sig.coordination_status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-gray-200/50 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 font-medium">Current Phase:</span>
                  <span
                    className={`font-mono font-bold ${
                      sig.current_state.includes('GREEN') || sig.current_state === 'EMERGENCY_PREEMPT'
                        ? 'text-emerald-700'
                        : sig.current_state === 'YELLOW'
                        ? 'text-amber-600'
                        : 'text-red-600'
                    }`}
                  >
                    {sig.current_state}
                  </span>
                </div>

                {sig.ambulance_approaching && sig.time_to_arrival_s !== null ? (
                  <span className="font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]">
                    Ambulance ETA: {sig.time_to_arrival_s}s
                  </span>
                ) : (
                  <span className="text-gray-400 text-[10px] font-medium">Standby Mode</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety Constraint Note */}
      <div className="p-2.5 bg-gray-50 border-t border-gray-150 text-[10px] text-gray-500 flex items-center justify-between">
        <span className="flex items-center gap-1 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Min. green clearance & pedestrian buffer active
        </span>
        <span className="font-mono text-gray-400">NTCIP 1202 Protocol Sim</span>
      </div>
    </div>
  );
};
