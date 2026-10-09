import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Droplets,
  Ambulance,
  AlertOctagon,
  ShieldAlert,
  Sparkles,
  Layers,
} from 'lucide-react';

interface SimulationControlsProps {
  simulationState: 'IDLE' | 'RUNNING' | 'PAUSED';
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onTriggerWaterMainBreak: () => void;
  onTriggerFalseAlarm: () => void;
  onTriggerSecondaryAccident: () => void;
  onDispatchAmbulance: () => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  simulationState,
  onStart,
  onPause,
  onReset,
  onTriggerWaterMainBreak,
  onTriggerFalseAlarm,
  onTriggerSecondaryAccident,
  onDispatchAmbulance,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200/90 shadow-xs p-4 mb-4">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-2 hidden sm:inline">
            Simulation State:
          </span>

          {simulationState === 'RUNNING' ? (
            <button
              onClick={onPause}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Pause className="w-4 h-4 fill-white" />
              <span>Pause Sim</span>
            </button>
          ) : (
            <button
              onClick={onStart}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow-xs cursor-pointer shadow-brand-600/20"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{simulationState === 'PAUSED' ? 'Resume Sim' : 'Start Simulation'}</span>
            </button>
          )}

          <button
            onClick={onReset}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition border border-gray-200 cursor-pointer"
            title="Reset Simulation & Clear Incidents"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>

        {/* Deterministic Scenario Triggers */}
        <div className="flex items-center flex-wrap gap-2 w-full lg:w-auto justify-end">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-2 hidden xl:inline">
            Deterministic Scenarios:
          </span>

          {/* Mandatory Demo: Water Main Break */}
          <button
            onClick={onTriggerWaterMainBreak}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-black transition shadow-xs shadow-red-600/30 cursor-pointer border border-red-700"
            title="Trigger Mandatory Demo Scenario: 5th Ave Water Main Break"
          >
            <Droplets className="w-4 h-4" />
            <span>1. Trigger Water-Main Break</span>
          </button>

          {/* Dispatch Ambulance */}
          <button
            onClick={onDispatchAmbulance}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs shadow-emerald-600/20 cursor-pointer"
            title="Dispatch Ambulance via Optimal Reroute"
          >
            <Ambulance className="w-4 h-4" />
            <span>2. Dispatch AMB-01</span>
          </button>

          {/* Scenario A: False Alarm */}
          <button
            onClick={onTriggerFalseAlarm}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition border border-gray-300 cursor-pointer"
            title="Test Scenario A: Bus stop stationary boarding (False Positive prevention)"
          >
            <AlertOctagon className="w-4 h-4 text-amber-600" />
            <span>Scenario A: False Alarm</span>
          </button>

          {/* Scenario B: Secondary Accident */}
          <button
            onClick={onTriggerSecondaryAccident}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition border border-amber-300 cursor-pointer"
            title="Test Scenario B: Collision mid-route causing dynamic reroute to 7th Ave"
          >
            <ShieldAlert className="w-4 h-4 text-amber-700" />
            <span>Scenario B: Secondary Crash</span>
          </button>
        </div>
      </div>
    </div>
  );
};
