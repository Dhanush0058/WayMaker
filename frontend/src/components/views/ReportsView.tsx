import React from 'react';
import { FileText, Download, CheckCircle, Clock, ShieldAlert } from 'lucide-react';
import { SimEvent } from '../../types';

interface ReportsViewProps {
  events: SimEvent[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ events }) => {
  const defaultEvents = [
    { id: 'rpt-1', time: '10:24 AM', category: 'DISPATCH', title: 'Ambulance A-17 En Route', description: 'Patient trauma call at Mehdipatnam Hub; 6 traffic signals preempted in green wave sequence.', severity: 'info' },
    { id: 'rpt-2', time: '10:21 AM', category: 'HAZARD', title: '5th Avenue Pothole Confirmed', description: 'Multi-sensor validation score reached 0.92 confidence; road segment closed to normal traffic.', severity: 'danger' },
    { id: 'rpt-3', time: '10:20 AM', category: 'TELEMETRY', title: 'Bus 42 Speed Anomaly Detected', description: 'Vehicle telemetry recorded abrupt deceleration from 35 km/h to 0 km/h; flagged for analysis.', severity: 'warning' },
    { id: 'rpt-4', time: '10:17 AM', category: 'SYSTEM', title: 'Bus 18 Transit Stop Geofence Cleared', description: 'Vehicle dwell time within scheduled transit stop boundary; false-positive incident suppressed.', severity: 'success' },
    { id: 'rpt-5', time: '10:15 AM', category: 'SIGNALS', title: 'NTCIP Signal Sync Established', description: 'Corridor controllers at Somajiguda West, Main, and North switched to priority readiness.', severity: 'info' },
  ];

  const logList = events.length > 0 ? events : defaultEvents;

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `WayMaker_Incident_Report_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-gray-900">Incident & Dispatch Audit Reports</h2>
            <span className="bg-[#EBF8EE] text-[#16A34A] border border-[#BBF7D0] px-2.5 py-0.5 rounded-full font-bold text-xs">
              Audit Trail Active
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Complete sequence-of-events log with sensor readings, path decisions, and traffic signal transition records.
          </p>
        </div>

        <button
          onClick={handleExportJSON}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs transition cursor-pointer shadow-xs shadow-[#16A34A]/20"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Log (JSON)</span>
        </button>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="divide-y divide-gray-150">
          {logList.map((evt) => (
            <div key={evt.id} className="p-4 hover:bg-gray-50/60 transition flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-gray-100 text-gray-700 mt-0.5 shrink-0">
                  <FileText className="w-4 h-4 text-[#16A34A]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-gray-900 text-xs">{evt.title}</span>
                    <span className="font-mono text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {evt.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{evt.description}</p>
                </div>
              </div>

              <span className="font-mono text-xs text-gray-400 font-bold shrink-0">{evt.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
