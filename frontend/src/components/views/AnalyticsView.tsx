import React from 'react';
import {
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Zap,
  BarChart2,
  PieChart,
  Calendar,
  Radio,
  ChevronRight,
} from 'lucide-react';
import { useSimulationStore } from '../../context/SimulationStore';

export const AnalyticsView: React.FC = () => {
  const { tickets, logs } = useSimulationStore();

  const totalIncidents = tickets.length;
  const completedTickets = tickets.filter((t) => t.status === 'RESOLVED').length;
  const inProgressTickets = tickets.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'ESCALATED').length;
  const pendingTickets = tickets.filter((t) => t.status === 'PENDING').length;
  const resolutionRate = totalIncidents > 0 ? ((completedTickets / totalIncidents) * 100).toFixed(1) : '85.0';

  const potholeCount = tickets.filter((t) => t.category === 'POTHOLE').length;
  const violationCount = tickets.filter((t) => t.category === 'NO_HELMET_VIOLATION').length;
  const garbageCount = tickets.filter((t) => t.category === 'GARBAGE').length;
  const waterDamageCount = tickets.filter((t) => t.category === 'ROAD_DAMAGE').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Municipal Analytics & System Benchmarks</h2>
          <p className="text-xs text-gray-500 font-normal mt-0.5">
            Key performance indicators for road hazards, emergency response routing, and municipal SLA resolution.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 font-medium">
          <Calendar className="w-3.5 h-3.5 text-gray-500" />
          <span>Live Operations Period: Active 30 Days</span>
        </div>
      </div>

      {/* 4 Core KPI Summary Cards (Live Synced) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Detected */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Total Incidents</span>
            <AlertTriangle className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{totalIncidents}</div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>AI telematics active</span>
          </div>
        </div>

        {/* 2. Completed / Resolved */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Completed & Resolved</span>
            <CheckCircle className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div className="text-3xl font-extrabold text-[#16A34A]">{completedTickets}</div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <span>{resolutionRate}% Resolution rate</span>
          </div>
        </div>

        {/* 3. Ongoing / Dispatched */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Active Dispatches</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-extrabold text-blue-600">{inProgressTickets}</div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <span>Crews on-site</span>
          </div>
        </div>

        {/* 4. Pending Review */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Pending Review</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600">{pendingTickets}</div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <span>Within 48h SLA</span>
          </div>
        </div>
      </div>

      {/* Detailed Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. Incident Categories Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900">Incident Category Distribution</h3>
            <span className="text-xs text-gray-400 font-medium">Real-Time Sync</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Potholes */}
            <div>
              <div className="flex justify-between font-semibold mb-1 text-gray-700">
                <span>Potholes & Road Cracks</span>
                <span className="text-gray-900">{potholeCount} Tickets</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#16A34A] h-full rounded-full"
                  style={{ width: `${totalIncidents > 0 ? (potholeCount / totalIncidents) * 100 : 40}%` }}
                />
              </div>
            </div>

            {/* No Helmet Violations */}
            <div>
              <div className="flex justify-between font-semibold mb-1 text-gray-700">
                <span>No-Helmet Violations (AI Vision)</span>
                <span className="text-gray-900">{violationCount} Citations</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{ width: `${totalIncidents > 0 ? (violationCount / totalIncidents) * 100 : 30}%` }}
                />
              </div>
            </div>

            {/* Garbage Overflows */}
            <div>
              <div className="flex justify-between font-semibold mb-1 text-gray-700">
                <span>Garbage Overflows & Debris</span>
                <span className="text-gray-900">{garbageCount} Tickets</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${totalIncidents > 0 ? (garbageCount / totalIncidents) * 100 : 20}%` }}
                />
              </div>
            </div>

            {/* Water Ruptures */}
            <div>
              <div className="flex justify-between font-semibold mb-1 text-gray-700">
                <span>Water-Main Ruptures & Flooding</span>
                <span className="text-gray-900">{waterDamageCount} Tickets</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-red-500 h-full rounded-full"
                  style={{ width: `${totalIncidents > 0 ? (waterDamageCount / totalIncidents) * 100 : 10}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. SLA Compliance & Emergency Routing Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900">48-Hour SLA & Dispatch Performance</h3>
            <span className="text-xs font-semibold text-[#16A34A]">96.4% On-Time</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100 space-y-1">
              <span className="text-gray-500 block">Avg Hazard Resolution Time</span>
              <strong className="text-base font-bold text-gray-900">18.4 Hours</strong>
              <p className="text-[11px] text-emerald-600 font-medium">Well within 48h limit</p>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100 space-y-1">
              <span className="text-gray-500 block">Ambulance Time Saved</span>
              <strong className="text-base font-bold text-[#16A34A]">4.8 Minutes / Run</strong>
              <p className="text-[11px] text-gray-500">Via Green Wave preemption</p>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100 space-y-1">
              <span className="text-gray-500 block">AI False Positive Rate</span>
              <strong className="text-base font-bold text-gray-900">3.2%</strong>
              <p className="text-[11px] text-emerald-600 font-medium">Multi-sensor validated</p>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100 space-y-1">
              <span className="text-gray-500 block">Auto-Escalated Tickets</span>
              <strong className="text-base font-bold text-red-600">
                {tickets.filter((t) => t.status === 'ESCALATED').length} Tickets
              </strong>
              <p className="text-[11px] text-gray-500">Escalated to Zonal Chief</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. UNIFIED REAL-TIME LIVE EVENT & TELEMETRY FEED (Placed at Bottom of Analytics) */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse"></span>
            <h3 className="font-bold text-sm text-gray-900">Live Telematics & System Audit Feed</h3>
          </div>
          <span className="text-xs text-gray-400 font-medium">Auto-Refreshing Stream</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-lg border border-gray-100 bg-gray-50/70 hover:bg-white hover:border-gray-200 transition space-y-1 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded border ${log.tagColor}`}>
                  {log.tag}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">{log.time}</span>
              </div>
              <h4 className="font-bold text-gray-900 text-xs truncate">{log.title}</h4>
              <p className="text-[11px] text-gray-500 truncate">{log.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
