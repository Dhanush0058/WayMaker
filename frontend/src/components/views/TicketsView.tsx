import React, { useState } from 'react';
import {
  Search,
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Camera,
  User,
  ShieldAlert,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Check,
  RefreshCw,
  X,
  FileText,
  Phone,
  Building,
  AlertCircle,
} from 'lucide-react';
import { useSimulationStore, TicketItem } from '../../context/SimulationStore';

export const TicketsView: React.FC = () => {
  const { tickets, updateTicketStatus, triggerManualIncident } = useSimulationStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);

  const filteredTickets = tickets.filter((t) => {
    const matchCategory = selectedCategory === 'ALL' || t.category === selectedCategory;
    const matchSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.vehiclePlate && t.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const categories = [
    { id: 'ALL', label: 'All Tickets', count: tickets.length },
    { id: 'POTHOLE', label: 'Potholes & Fractures', count: tickets.filter((t) => t.category === 'POTHOLE').length },
    { id: 'NO_HELMET_VIOLATION', label: 'No-Helmet Violations', count: tickets.filter((t) => t.category === 'NO_HELMET_VIOLATION').length },
    { id: 'GARBAGE', label: 'Garbage Overflows', count: tickets.filter((t) => t.category === 'GARBAGE').length },
    { id: 'ROAD_DAMAGE', label: 'Water Ruptures & Damage', count: tickets.filter((t) => t.category === 'ROAD_DAMAGE').length },
  ];

  return (
    <div className="space-y-5">
      {/* Top Header & Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Municipal & Traffic Incident Tickets</h2>
          <p className="text-xs text-gray-500 font-normal mt-0.5">
            Automated detection from bus AI cameras, telematics sensors, and municipal dispatch workflows.
          </p>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ticket ID, road, plate..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#16A34A] transition"
            />
          </div>

          <button
            onClick={() => triggerManualIncident('POTHOLE')}
            className="px-3.5 py-2 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold transition cursor-pointer"
            title="Simulate a new incoming bus detection"
          >
            + Test Incident
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-2 border ${
              selectedCategory === cat.id
                ? 'bg-emerald-50 border-emerald-300 text-[#16A34A]'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>{cat.label}</span>
            <span className={`px-1.5 py-0.2 rounded text-[11px] font-bold ${
              selectedCategory === cat.id ? 'bg-[#16A34A] text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tickets List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredTickets.map((t) => {
          const isEscalated = t.status === 'ESCALATED';
          const isResolved = t.status === 'RESOLVED';
          const hours = Math.floor(t.slaHoursRemaining);
          const mins = Math.floor((t.slaHoursRemaining - hours) * 60);

          return (
            <div
              key={t.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition flex flex-col justify-between space-y-4 shadow-xs"
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-gray-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                      {t.id}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                      t.severity === 'CRITICAL'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : t.severity === 'HIGH'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      {t.severity}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                      isResolved
                        ? 'bg-emerald-50 text-[#16A34A] border-emerald-200'
                        : isEscalated
                        ? 'bg-red-600 text-white border-red-600'
                        : t.status === 'IN_PROGRESS'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-gray-900 mt-2">{t.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{t.location}</span>
                  </div>
                </div>

                {/* Thumbnail Image */}
                <div
                  onClick={() => setSelectedTicket(t)}
                  className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shrink-0 cursor-pointer group relative bg-gray-100"
                  title="Click to inspect visual evidence & escalation"
                >
                  <img
                    src={t.imageUrl}
                    alt={t.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                    <Camera className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Information readout */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-xs space-y-1.5">
                {t.vehiclePlate && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Vehicle License Plate:</span>
                    <span className="font-mono font-bold text-gray-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                      {t.vehiclePlate}
                    </span>
                  </div>
                )}
                {t.fineAmount && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Violation Fine Notice:</span>
                    <span className="font-bold text-red-600">{t.fineAmount}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Reported By:</span>
                  <span className="text-gray-800 font-medium">{t.detectedBy}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Assigned Officer:</span>
                  <span className="text-gray-800 font-medium">{t.assignedOfficer} ({t.department})</span>
                </div>
              </div>

              {/* 48-Hour SLA Timer Bar & Escalation Status */}
              <div className="border-t border-gray-100 pt-3 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${isEscalated ? 'text-red-600' : isResolved ? 'text-[#16A34A]' : 'text-amber-600'}`} />
                  <div>
                    <span className="text-gray-500 text-[11px] block">48-Hour Resolution SLA:</span>
                    {isResolved ? (
                      <span className="font-bold text-[#16A34A]">Completed within SLA</span>
                    ) : isEscalated ? (
                      <span className="font-bold text-red-600">SLA Expired • Auto-Escalated to Chief Commissioner</span>
                    ) : (
                      <span className="font-mono font-bold text-gray-900">
                        {hours}h {mins}m remaining
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {t.status === 'PENDING' && (
                    <button
                      onClick={() => updateTicketStatus(t.id, 'IN_PROGRESS')}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition cursor-pointer"
                    >
                      Dispatch Crew
                    </button>
                  )}
                  {t.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => updateTicketStatus(t.id, 'RESOLVED')}
                      className="px-3 py-1.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  )}
                  {t.status === 'ESCALATED' && (
                    <button
                      onClick={() => updateTicketStatus(t.id, 'RESOLVED')}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition cursor-pointer"
                    >
                      Emergency Close
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedTicket(t)}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 transition cursor-pointer"
                    title="View Comprehensive Ticket Dossier"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* COMPREHENSIVE TICKET DOSSIER & ESCALATION MODAL */}
      {selectedTicket && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-gray-200 relative animate-in fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-gray-100 px-2.5 py-0.5 rounded border border-gray-200">
                    {selectedTicket.id}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-[#16A34A] border border-emerald-200">
                    {selectedTicket.category.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mt-1">{selectedTicket.title}</h3>
                <p className="text-xs text-gray-500">{selectedTicket.location} • {selectedTicket.coordinates}</p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Evidence Image */}
            <div className="rounded-xl overflow-hidden border border-gray-200 h-60 bg-gray-900 relative">
              <img
                src={selectedTicket.imageUrl}
                alt="Ticket Evidence"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-black/85 px-3 py-1 rounded-md text-xs font-mono text-white flex items-center gap-2">
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                <span>Camera Telematics: {selectedTicket.timestamp} ({selectedTicket.detectedBy})</span>
              </div>
            </div>

            {/* 3-Tier Escalation Timeline & 48-Hour SLA */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                  48-Hour Resolution SLA & Escalation Hierarchy
                </h4>
                <span className="font-mono text-xs font-bold text-gray-800">
                  {selectedTicket.status === 'RESOLVED'
                    ? 'RESOLVED'
                    : selectedTicket.status === 'ESCALATED'
                    ? 'ESCALATED (>48h)'
                    : `${Math.floor(selectedTicket.slaHoursRemaining)}h remaining`}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    selectedTicket.status === 'RESOLVED'
                      ? 'bg-[#16A34A]'
                      : selectedTicket.status === 'ESCALATED'
                      ? 'bg-red-600'
                      : 'bg-amber-500'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(5, ((48 - selectedTicket.slaHoursRemaining) / 48) * 100))}%`,
                  }}
                />
              </div>

              {/* 3-Tier Hierarchy Steps */}
              <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                <div className={`p-2 rounded-lg border ${
                  selectedTicket.slaHoursRemaining > 24
                    ? 'bg-white border-[#16A34A] text-gray-900 font-semibold'
                    : 'bg-gray-100 text-gray-500 border-gray-200'
                }`}>
                  <span className="block font-bold text-[10px] text-gray-400 uppercase">Tier 1 (0–24h)</span>
                  <span>{selectedTicket.assignedOfficer}</span>
                  <span className="block text-[10px] text-gray-500">Ward Engineer</span>
                </div>

                <div className={`p-2 rounded-lg border ${
                  selectedTicket.slaHoursRemaining <= 24 && selectedTicket.slaHoursRemaining > 0
                    ? 'bg-amber-50 border-amber-400 text-amber-900 font-semibold'
                    : 'bg-gray-100 text-gray-500 border-gray-200'
                }`}>
                  <span className="block font-bold text-[10px] text-gray-400 uppercase">Tier 2 (24–48h)</span>
                  <span>Zonal Superintendent</span>
                  <span className="block text-[10px] text-gray-500">Traffic Ops Division</span>
                </div>

                <div className={`p-2 rounded-lg border ${
                  selectedTicket.slaHoursRemaining <= 0
                    ? 'bg-red-50 border-red-500 text-red-900 font-bold'
                    : 'bg-gray-100 text-gray-500 border-gray-200'
                }`}>
                  <span className="block font-bold text-[10px] text-gray-400 uppercase">Tier 3 (&gt;48h)</span>
                  <span>Chief Commissioner</span>
                  <span className="block text-[10px] text-gray-500">Emergency Escalation</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
              >
                Close Dossier
              </button>
              {selectedTicket.status !== 'RESOLVED' && (
                <button
                  onClick={() => {
                    updateTicketStatus(selectedTicket.id, 'RESOLVED');
                    setSelectedTicket(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition cursor-pointer"
                >
                  Mark as Resolved & Close Ticket
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
