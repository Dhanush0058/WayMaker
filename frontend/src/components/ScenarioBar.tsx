import React from 'react';
import { Play, Pause, RotateCcw, Droplets, Ambulance, ShieldAlert, CheckCircle, BarChart2 } from 'lucide-react';

interface ScenarioBarProps {
  simulationState: 'IDLE' | 'RUNNING' | 'PAUSED';
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onTriggerWaterBreak: () => void;
  onDispatchAmbulance: () => void;
  onTriggerFalseAlarm: () => void;
  onTriggerSecondaryAccident: () => void;
  onOpenMetrics: () => void;
}

export const ScenarioBar: React.FC<ScenarioBarProps> = ({
  simulationState,
  onStart,
  onPause,
  onReset,
  onTriggerWaterBreak,
  onDispatchAmbulance,
  onTriggerFalseAlarm,
  onTriggerSecondaryAccident,
  onOpenMetrics,
}) => {
  return (
    <div className="bg-white rounded-2xl p-2.5 border border-gray-200/80 shadow-xs mb-4 flex items-center justify-between flex-wrap gap-2 text-xs">
      {/* Playback Controls */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider mr-1">
          Sim Controls:
        </span>

        {simulationState === 'RUNNING' ? (
          <button
            onClick={onPause}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition cursor-pointer"
          >
            <Pause className="w-3.5 h-3.5 fill-white" />
            <span>Pause</span>
          </button>
        ) : (
          <button
            onClick={onStart}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold transition shadow-xs shadow-[#16A34A]/20 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{simulationState === 'PAUSED' ? 'Resume' : 'Run Simulation'}</span>
          </button>
        )}

        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition cursor-pointer"
          title="Reset Simulation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Scenario Triggers */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider mr-1 hidden sm:inline">
          Scenarios:
        </span>

        {/* 1. Mandatory Demo */}
        <button
          onClick={onTriggerWaterBreak}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition shadow-xs shadow-red-600/20 cursor-pointer"
        >
          <Droplets className="w-3.5 h-3.5" />
          <span>1. Water-Main / Pothole Break</span>
        </button>

        {/* 2. Dispatch Ambulance */}
        <button
          onClick={onDispatchAmbulance}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition cursor-pointer"
        >
          <Ambulance className="w-3.5 h-3.5" />
          <span>2. Dispatch A-17</span>
        </button>

        {/* 3. False Alarm */}
        <button
          onClick={onTriggerFalseAlarm}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold transition border border-gray-250 cursor-pointer"
        >
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Scenario A: False Alarm</span>
        </button>

        {/* 4. Secondary Crash */}
        <button
          onClick={onTriggerSecondaryAccident}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold transition border border-amber-300 cursor-pointer"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
          <span>Scenario B: Dynamic Reroute</span>
        </button>

        {/* Benchmarks modal */}
        <button
          onClick={onOpenMetrics}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold transition border border-blue-200 cursor-pointer"
        >
          <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
          <span>Evaluation Metrics</span>
        </button>
      </div>
    </div>
  );
};
