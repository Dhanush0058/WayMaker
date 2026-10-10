import React from 'react';
import { Play, Pause, RotateCcw, Droplets, Ambulance, ShieldAlert, CheckCircle } from 'lucide-react';

interface ScenarioBarProps {
  simulationState: 'IDLE' | 'RUNNING' | 'PAUSED';
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onTriggerWaterBreak: () => void;
  onDispatchAmbulance: () => void;
  onTriggerFalseAlarm: () => void;
  onTriggerSecondaryAccident: () => void;
  onOpenMetrics?: () => void;
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
}) => {
  return (
    <div className="bg-white rounded-2xl p-2.5 border border-gray-200/80 shadow-xs flex items-center justify-between flex-wrap gap-2 text-xs">
      {/* Simulation Engine Controls */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider mr-1">
          Controls:
        </span>

        {simulationState === 'RUNNING' ? (
          <button
            onClick={onPause}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition cursor-pointer shadow-xs"
          >
            <Pause className="w-3.5 h-3.5 fill-white" />
            <span>Pause</span>
          </button>
        ) : (
          <button
            onClick={onStart}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold transition shadow-xs shadow-[#16A34A]/25 cursor-pointer"
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

      {/* Demonstration Scenario Triggers */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider mr-1 hidden sm:inline">
          Live Scenarios:
        </span>

        {/* 1. Mandatory Hazard Scenario */}
        <button
          onClick={onTriggerWaterBreak}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition shadow-xs shadow-red-600/20 cursor-pointer"
          title="Simulate sudden water-main fracture on 5th Avenue"
        >
          <Droplets className="w-3.5 h-3.5" />
          <span>1. Water-Main Break</span>
        </button>

        {/* 2. Emergency Dispatch */}
        <button
          onClick={onDispatchAmbulance}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold transition shadow-xs shadow-[#16A34A]/20 cursor-pointer"
          title="Dispatch Ambulance A-17 with Dynamic Green Wave Rerouting"
        >
          <Ambulance className="w-3.5 h-3.5" />
          <span>2. Dispatch A-17</span>
        </button>

        {/* 3. False Alarm Bus Stop */}
        <button
          onClick={onTriggerFalseAlarm}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold transition border border-gray-200 cursor-pointer"
          title="Test False Positive Prevention (Bus Stop anomaly vs real road hazard)"
        >
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>3. False Alarm Test</span>
        </button>

        {/* 4. Secondary Crash Detour */}
        <button
          onClick={onTriggerSecondaryAccident}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold transition border border-amber-300 cursor-pointer"
          title="Simulate sudden secondary corridor blockage and live dynamic recalculation"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
          <span>4. Dynamic Detour</span>
        </button>
      </div>
    </div>
  );
};
