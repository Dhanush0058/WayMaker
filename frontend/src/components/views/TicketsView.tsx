import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Hazard } from '../../types';

interface Ticket {
  id: string;
  category: 'POTHOLE' | 'GARBAGE' | 'ROAD_DAMAGE' | 'NO_HELMET_VIOLATION';
  title: string;
  location: string;
  coordinates: string;
  detectedBy: string;
  timestamp: string;
  assignedOfficer: string;
  department: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED';
  slaHoursRemaining: number; // 48h initial SLA
  imageUrl: string;
  vehiclePlate?: string;
  fineAmount?: string;
}

interface TicketsViewProps {
  hazards?: Hazard[];
  onTriggerWaterBreak?: () => void;
}

export const TicketsView: React.FC<TicketsViewProps> = ({
  hazards = [],
  onTriggerWaterBreak,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Initial tickets list
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: 'TK-101',
      category: 'POTHOLE',
      title: 'Severe Pothole & Road Rupture',
      location: '5th Avenue • Near Somajiguda Junction',
      coordinates: '17.4241° N, 78.4498° E',
      detectedBy: 'Bus #42 Telematics & AI Camera',
      timestamp: 'Today at 08:14 AM',
      assignedOfficer: 'Eng. R. K. Varma',
      department: 'GHMC Road Maintenance Ward 14',
      severity: 'CRITICAL',
      status: 'IN_PROGRESS',
      slaHoursRemaining: 34.5,
      imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'TK-102',
      category: 'NO_HELMET_VIOLATION',
      title: 'Rider Without Helmet Violation',
      location: 'Banjara Hills Road No. 12',
      coordinates: '17.4182° N, 78.4350° E',
      detectedBy: 'Bus #18 AI CCTV Stream',
      timestamp: 'Today at 09:22 AM',
      assignedOfficer: 'Officer S. Rao',
      department: 'City Traffic Enforcement Unit',
      severity: 'HIGH',
      status: 'PENDING',
      slaHoursRemaining: 42.2,
      vehiclePlate: 'TS 09 EA 4281',
      fineAmount: '₹1,000 E-Challan Generated',
      imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'TK-103',
      category: 'GARBAGE',
      title: 'Municipal Garbage Dump Overflow',
      location: 'Greenlands Flyover Underpass',
      coordinates: '17.4320° N, 78.4550° E',
      detectedBy: 'Bus #07 AI Telematics',
      timestamp: 'Yesterday at 04:30 PM',
      assignedOfficer: 'Insp. Anand Kumar',
      department: 'Solid Waste Management Division',
      severity: 'MEDIUM',
      status: 'IN_PROGRESS',
      slaHoursRemaining: 18.0,
      imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'TK-104',
      category: 'ROAD_DAMAGE',
      title: 'Water-Main Fracture & Surface Flooding',
      location: 'Somajiguda Corridor - Pillar 48',
      coordinates: '17.4290° N, 78.4610° E',
      detectedBy: 'Bus #42 Telematics & AI Camera',
      timestamp: '2 Days Ago at 11:00 AM',
      assignedOfficer: 'Zonal Chief A. Patil',
      department: 'Water Supply & Sewerage Board',
      severity: 'CRITICAL',
      status: 'ESCALATED',
      slaHoursRemaining: 0.0,
      imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'TK-105',
      category: 'POTHOLE',
      title: 'Surface Asphalt Depression (Pothole)',
      location: 'MG Road • Near Central Station',
      coordinates: '17.4350° N, 78.4680° E',
      detectedBy: 'Bus #29 Telematics',
      timestamp: '3 Days Ago at 02:15 PM',
      assignedOfficer: 'Eng. R. K. Varma',
      department: 'GHMC Road Maintenance Ward 14',
      severity: 'LOW',
      status: 'RESOLVED',
      slaHoursRemaining: 0.0,
      imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
    },
  ]);

  // SLA countdown timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTickets((prev) =>
        prev.map((t) => {
          if (t.status === 'RESOLVED') return t;
          const nextSla = Math.max(0, t.slaHoursRemaining - 0.01);
          const nextStatus = nextSla <= 0 ? 'ESCALATED' : t.status;
          return {
            ...t,
            slaHoursRemaining: parseFloat(nextSla.toFixed(2)),
            status: nextStatus,
          };
        })
      );
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleUpdateStatus = (ticketId: string, newStatus: Ticket['status']) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
    );
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchCategory =
      selectedCategory === 'ALL' || t.category === selectedCategory;
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

        {/* Search Input */}
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
                  title="Click to inspect visual evidence"
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

              {/* Specific info: Plate or Detection source */}
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
                    <span className="text-gray-500 font-medium">Violation Notice:</span>
                    <span className="font-bold text-red-600">{t.fineAmount}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Reported By:</span>
                  <span className="text-gray-800 font-medium">{t.detectedBy}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Assigned Authority:</span>
                  <span className="text-gray-800 font-medium">{t.assignedOfficer} ({t.department})</span>
                </div>
              </div>

              {/* 48-Hour SLA Timer Bar & Escalation */}
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
                      onClick={() => handleUpdateStatus(t.id, 'IN_PROGRESS')}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition cursor-pointer"
                    >
                      Dispatch Crew
                    </button>
                  )}
                  {t.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleUpdateStatus(t.id, 'RESOLVED')}
                      className="px-3 py-1.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  )}
                  {t.status === 'ESCALATED' && (
                    <button
                      onClick={() => handleUpdateStatus(t.id, 'RESOLVED')}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition cursor-pointer"
                    >
                      Emergency Close
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedTicket(t)}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 transition cursor-pointer"
                    title="View Evidence Details"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ticket Details & Visual Evidence Modal */}
      {selectedTicket && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-gray-200 relative animate-in fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono font-bold text-xs bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                  {selectedTicket.id}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-1">{selectedTicket.title}</h3>
                <p className="text-xs text-gray-500">{selectedTicket.location} • {selectedTicket.coordinates}</p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Evidence Image */}
            <div className="rounded-xl overflow-hidden border border-gray-200 h-64 bg-gray-900 relative">
              <img
                src={selectedTicket.imageUrl}
                alt="Ticket Evidence"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-black/80 px-3 py-1 rounded text-xs font-mono text-white">
                Camera Timestamp: {selectedTicket.timestamp}
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <span className="text-gray-500 block">Assigned Officer:</span>
                <strong className="text-gray-900 font-semibold">{selectedTicket.assignedOfficer}</strong>
              </div>
              <div>
                <span className="text-gray-500 block">Department:</span>
                <strong className="text-gray-900 font-semibold">{selectedTicket.department}</strong>
              </div>
              {selectedTicket.vehiclePlate && (
                <div>
                  <span className="text-gray-500 block">Vehicle License Plate:</span>
                  <strong className="text-gray-900 font-mono font-bold">{selectedTicket.vehiclePlate}</strong>
                </div>
              )}
              {selectedTicket.fineAmount && (
                <div>
                  <span className="text-gray-500 block">Violation Fine Notice:</span>
                  <strong className="text-red-600 font-bold">{selectedTicket.fineAmount}</strong>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Close
              </button>
              {selectedTicket.status !== 'RESOLVED' && (
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedTicket.id, 'RESOLVED');
                    setSelectedTicket(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition"
                >
                  Mark as Resolved
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
