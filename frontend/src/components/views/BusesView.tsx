import React, { useState } from 'react';
import {
  Bus,
  Activity,
  Video,
  MapPin,
  Clock,
  Gauge,
  User,
  Search,
  CheckCircle,
  AlertTriangle,
  X,
  Maximize2,
} from 'lucide-react';
import { VehicleEvent } from '../../types';
import { LiveCameraCV } from '../LiveCameraCV';

interface BusesViewProps {
  vehicles?: VehicleEvent[];
  onTriggerFalseAlarm?: () => void;
  onTriggerWaterBreak?: () => void;
}

interface BusFleetItem {
  id: string;
  routeNumber: string;
  routeName: string;
  driverName: string;
  speedKmh: number;
  status: 'ACTIVE_NORMAL' | 'TRANSIT_STOP' | 'HAZARD_DETECTED' | 'DELAYED';
  location: string;
  lastUpdated: string;
  occupancy: string;
  hasLiveStream: boolean;
}

export const BusesView: React.FC<BusesViewProps> = ({
  vehicles = [],
  onTriggerFalseAlarm,
  onTriggerWaterBreak,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeStreamBus, setActiveStreamBus] = useState<BusFleetItem | null>(null);

  const fleetList: BusFleetItem[] = [
    {
      id: 'BUS-42',
      routeNumber: 'Route 42-EX',
      routeName: 'Somajiguda & 5th Avenue Express',
      driverName: 'K. Raghavan',
      speedKmh: 44,
      status: 'HAZARD_DETECTED',
      location: '5th Avenue • Corridor Sector 3',
      lastUpdated: '10s ago',
      occupancy: '38 / 52 Seats',
      hasLiveStream: true,
    },
    {
      id: 'BUS-18',
      routeNumber: 'Route 18-C',
      routeName: 'Banjara Hills & City Center Loop',
      driverName: 'M. Suresh',
      speedKmh: 28,
      status: 'TRANSIT_STOP',
      location: 'Banjara Hills Rd No. 12',
      lastUpdated: 'Just now',
      occupancy: '44 / 52 Seats',
      hasLiveStream: true,
    },
    {
      id: 'BUS-07',
      routeNumber: 'Route 07-N',
      routeName: 'Greenlands Flyover & Secunderabad',
      driverName: 'P. Venkat',
      speedKmh: 52,
      status: 'ACTIVE_NORMAL',
      location: 'Greenlands Flyover North',
      lastUpdated: '25s ago',
      occupancy: '22 / 52 Seats',
      hasLiveStream: true,
    },
    {
      id: 'BUS-29',
      routeNumber: 'Route 29-A',
      routeName: 'MG Road Trunk Line',
      driverName: 'T. Narsimha',
      speedKmh: 36,
      status: 'ACTIVE_NORMAL',
      location: 'MG Road Central Terminal',
      lastUpdated: '1m ago',
      occupancy: '48 / 52 Seats',
      hasLiveStream: true,
    },
    {
      id: 'BUS-14',
      routeNumber: 'Route 14-S',
      routeName: 'Hussain Sagar Lakefront Line',
      driverName: 'G. Srinivas',
      speedKmh: 30,
      status: 'ACTIVE_NORMAL',
      location: 'Tank Bund Roadway',
      lastUpdated: '40s ago',
      occupancy: '19 / 52 Seats',
      hasLiveStream: true,
    },
    {
      id: 'BUS-33',
      routeNumber: 'Route 33-M',
      routeName: 'Medical District Shuttle',
      driverName: 'D. Naidu',
      speedKmh: 41,
      status: 'ACTIVE_NORMAL',
      location: 'Hospital Corridor Junction',
      lastUpdated: '15s ago',
      occupancy: '30 / 52 Seats',
      hasLiveStream: true,
    },
  ];

  const filteredFleet = fleetList.filter(
    (b) =>
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.routeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.driverName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Top Header & Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Public Transit Fleet & Telematics</h2>
          <p className="text-xs text-gray-500 font-normal mt-0.5">
            Real-time GPS telematics, speed monitoring, and AI onboard camera live streams.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bus number, route, driver..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#16A34A] transition"
          />
        </div>
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFleet.map((bus) => {
          const isHazard = bus.status === 'HAZARD_DETECTED';
          const isTransitStop = bus.status === 'TRANSIT_STOP';

          return (
            <div
              key={bus.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition flex flex-col justify-between space-y-4 shadow-xs"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center font-bold">
                      <Bus className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 leading-tight">{bus.id}</h3>
                      <span className="text-[11px] text-gray-500 font-medium">{bus.routeNumber}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    isHazard
                      ? 'bg-red-50 text-red-600 border-red-200'
                      : isTransitStop
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-[#16A34A] border-emerald-200'
                  }`}>
                    {bus.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs font-semibold text-gray-800">{bus.routeName}</p>
              </div>

              {/* Telematics Metrics */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-gray-400" />
                    Speed:
                  </span>
                  <strong className="font-mono font-bold text-gray-900">{bus.speedKmh} km/h</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    Location:
                  </span>
                  <span className="text-gray-800 font-medium truncate max-w-[150px]">{bus.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    Driver:
                  </span>
                  <span className="text-gray-800 font-medium">{bus.driverName}</span>
                </div>
              </div>

              {/* Click to open Live AI Camera Stream */}
              <button
                onClick={() => setActiveStreamBus(bus)}
                className="w-full py-2.5 rounded-lg bg-gray-900 hover:bg-black text-white text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Video className="w-4 h-4 text-emerald-400" />
                <span>Watch Live AI Camera</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Dedicated Live Stream Modal for Selected Bus */}
      {activeStreamBus && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in"
          onClick={() => setActiveStreamBus(null)}
        >
          <div
            className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-4xl h-[78vh] flex flex-col overflow-hidden relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Header */}
            <div className="px-5 py-3.5 bg-gray-900 border-b border-gray-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    {activeStreamBus.id} — Onboard AI Vision Stream ({activeStreamBus.routeName})
                  </h3>
                  <p className="text-[11px] text-gray-400 font-mono">
                    Driver: {activeStreamBus.driverName} • Speed: {activeStreamBus.speedKmh} km/h • {activeStreamBus.location}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveStreamBus(null)}
                className="p-1.5 rounded-lg bg-gray-800 hover:bg-red-600 text-gray-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Camera CV Feed */}
            <div className="flex-1 relative overflow-hidden">
              <LiveCameraCV compact={false} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
