import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert, Filter, Clock, MapPin, Eye, Plus } from 'lucide-react';
import { Hazard } from '../../types';

interface IncidentsViewProps {
  hazards: Hazard[];
  onVerifyHazard: (hazardId: string, status: string) => void;
  onTriggerWaterBreak: () => void;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({
  hazards,
  onVerifyHazard,
  onTriggerWaterBreak,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const defaultMockHazards = [
    {
      id: 'HAZ-001',
      category: 'water_main_break',
      road_segment_id: 'SEG_N_5TH_48_N_5TH_45',
      location_name: '5th Avenue, Banjara Hills',
      latitude: 17.4168,
      longitude: 78.4485,
      severity: 'high',
      confidence: 0.92,
      status: 'confirmed',
      detection_time: '10:21 AM',
      description: 'Severe Pothole & Road Rupture. Road surface depression detected by Bus 42.',
      is_active: true,
      evidence_list: [
        { timestamp: '10:21 AM', source: 'bus_telemetry', description: 'Bus 42 speed dropped from 35 km/h to 0 km/h unexpectedly', confidence_delta: 0.45 },
        { timestamp: '10:22 AM', source: 'sensor', description: 'Municipal acoustic sensor: high road fracture vibration', confidence_delta: 0.47 },
      ],
    },
    {
      id: 'HAZ-002',
      category: 'traffic_collision',
      road_segment_id: 'SEG_N_6TH_45_N_6TH_42',
      location_name: 'Somajiguda North Link',
      latitude: 17.4270,
      longitude: 78.4500,
      severity: 'high',
      confidence: 0.88,
      status: 'probable',
      detection_time: '10:14 AM',
      description: 'Multi-vehicle collision blocking two lanes. Automated vehicle eCall triggered.',
      is_active: true,
      evidence_list: [
        { timestamp: '10:14 AM', source: 'multi_vehicle', description: 'Sudden braking by 3 vehicles in corridor', confidence_delta: 0.88 },
      ],
    },
    {
      id: 'HAZ-003',
      category: 'debris',
      road_segment_id: 'SEG_N_7TH_45_N_7TH_42',
      location_name: 'Necklace Road Lake Promenade',
      latitude: 17.4220,
      longitude: 78.4680,
      severity: 'medium',
      confidence: 0.65,
      status: 'probable',
      detection_time: '09:58 AM',
      description: 'Fallen tree branch obstructing right curb lane.',
      is_active: true,
      evidence_list: [],
    },
    {
      id: 'HAZ-004',
      category: 'congestion',
      road_segment_id: 'SEG_N_BANJARA_RD1_N_7TH_48',
      location_name: 'Khairatabad Flyover Approach',
      latitude: 17.4140,
      longitude: 78.4620,
      severity: 'low',
      confidence: 0.85,
      status: 'confirmed',
      detection_time: '09:45 AM',
      description: 'Morning commuter traffic accumulation. Average traversal speed reduced to 18 km/h.',
      is_active: true,
      evidence_list: [],
    },
  ];

  const allHazards = hazards.length > 0 ? hazards : defaultMockHazards;
  const filtered = filterStatus === 'all' ? allHazards : allHazards.filter(h => h.status === filterStatus);

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-gray-900">Incident & Road Hazard Operations</h2>
            <span className="bg-red-50 text-red-600 border border-red-200 px-2.5 py-0.5 rounded-full font-bold text-xs">
              {allHazards.length} Total Incidents
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time hazard verification, multi-sensor evidence validation, and road closure orchestration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1 text-xs font-bold text-gray-600">
            {['all', 'confirmed', 'probable', 'unverified'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg capitalize transition cursor-pointer ${
                  filterStatus === st ? 'bg-white text-gray-900 shadow-xs font-extrabold' : 'hover:text-gray-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={onTriggerWaterBreak}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Simulate New Incident</span>
          </button>
        </div>
      </div>

      {/* Incidents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((hazard) => {
          const isConfirmed = hazard.status === 'confirmed';
          const isProbable = hazard.status === 'probable';
          const confidencePct = Math.round(hazard.confidence * 100);

          return (
            <div
              key={hazard.id}
              className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center font-bold">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-sm">{hazard.location_name}</h3>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {hazard.detection_time}
                        </span>
                        <span>•</span>
                        <span className="capitalize text-red-600 font-bold">{hazard.category.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isConfirmed
                        ? 'bg-red-600 text-white'
                        : isProbable
                        ? 'bg-amber-500 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {hazard.status}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-700 font-medium leading-relaxed mb-4">
                  {hazard.description}
                </p>

                {/* Confidence Bar */}
                <div className="mb-4 bg-gray-50 p-3 rounded-xl border border-gray-150">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-gray-500">Sensor Verification Confidence</span>
                    <span className={confidencePct >= 75 ? 'text-red-600' : 'text-amber-600'}>
                      {confidencePct}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        confidencePct >= 75 ? 'bg-red-600' : confidencePct >= 45 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${confidencePct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Evidence timeline */}
                {hazard.evidence_list && hazard.evidence_list.length > 0 && (
                  <div className="space-y-1.5 mb-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Validated Telematics Evidence
                    </span>
                    {hazard.evidence_list.map((ev, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] bg-red-50/50 p-2 rounded-lg border border-red-100">
                        <span className="text-gray-700 font-medium truncate max-w-[280px]">
                          • {ev.description}
                        </span>
                        <span className="font-mono text-gray-500 text-[10px] shrink-0">{ev.timestamp}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-150 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-gray-500">Operator Override:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onVerifyHazard(hazard.id, 'confirmed')}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Confirm Block
                  </button>
                  <button
                    onClick={() => onVerifyHazard(hazard.id, 'probable')}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Mark Warning
                  </button>
                  <button
                    onClick={() => onVerifyHazard(hazard.id, 'unverified')}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
