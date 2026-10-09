import React, { useState } from 'react';
import { Settings, Save, RotateCcw, Sliders, ShieldCheck } from 'lucide-react';

interface SettingsViewProps {
  onReset: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onReset }) => {
  const [sensitivity, setSensitivity] = useState<number>(75);
  const [preemptionDist, setPreemptionDist] = useState<number>(800);
  const [dwellTime, setDwellTime] = useState<number>(30);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-gray-900">Platform Thresholds & Configuration</h2>
            <span className="bg-[#EBF8EE] text-[#16A34A] border border-[#BBF7D0] px-2.5 py-0.5 rounded-full font-bold text-xs">
              System Admin
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Tune sensor anomaly thresholds, green wave preemption lead times, and transit stop geofence parameters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedNotice && (
            <span className="text-xs font-bold text-[#16A34A] animate-pulse">
              ✓ Settings Applied Live!
            </span>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs transition cursor-pointer shadow-xs shadow-[#16A34A]/20"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>

      {/* Settings Form */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs space-y-6">
        {/* Slider 1: Hazard Verification Sensitivity */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-extrabold text-sm text-gray-900">Hazard Anomaly Sensitivity Threshold</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Confidence score threshold before classifying a road segment as an impassable hazard.
              </p>
            </div>
            <span className="text-sm font-black text-[#16A34A] bg-[#EBF8EE] px-3 py-1 rounded-lg">
              {sensitivity}%
            </span>
          </div>
          <input
            type="range"
            min="50"
            max="95"
            value={sensitivity}
            onChange={(e) => setSensitivity(Number(e.target.value))}
            className="w-full accent-[#16A34A] cursor-pointer"
          />
        </div>

        {/* Slider 2: Preemption Distance */}
        <div className="pt-4 border-t border-gray-150">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-extrabold text-sm text-gray-900">Green Wave Corridor Preemption Radius</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Distance at which upcoming traffic controllers begin transitioning into emergency green wave mode.
              </p>
            </div>
            <span className="text-sm font-black text-[#16A34A] bg-[#EBF8EE] px-3 py-1 rounded-lg">
              {preemptionDist} meters
            </span>
          </div>
          <input
            type="range"
            min="400"
            max="1600"
            step="100"
            value={preemptionDist}
            onChange={(e) => setPreemptionDist(Number(e.target.value))}
            className="w-full accent-[#16A34A] cursor-pointer"
          />
        </div>

        {/* Slider 3: Transit Stop Dwell Filter */}
        <div className="pt-4 border-t border-gray-150">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-extrabold text-sm text-gray-900">Transit Stop Passenger Boarding Dwell Filter</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Maximum duration a transit bus can remain stationary at a designated stop before triggering an alert.
              </p>
            </div>
            <span className="text-sm font-black text-[#16A34A] bg-[#EBF8EE] px-3 py-1 rounded-lg">
              {dwellTime} seconds
            </span>
          </div>
          <input
            type="range"
            min="15"
            max="60"
            value={dwellTime}
            onChange={(e) => setDwellTime(Number(e.target.value))}
            className="w-full accent-[#16A34A] cursor-pointer"
          />
        </div>

        {/* System Reset Section */}
        <div className="pt-6 border-t border-gray-150 flex items-center justify-between">
          <div>
            <h4 className="font-extrabold text-xs text-gray-900">Reset City State</h4>
            <p className="text-xs text-gray-500">Restore all corridors, vehicles, and signal phases to baseline 8:15 AM state.</p>
          </div>
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Scenario State</span>
          </button>
        </div>
      </div>
    </div>
  );
};
