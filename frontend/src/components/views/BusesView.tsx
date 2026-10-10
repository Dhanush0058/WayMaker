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
  Phone,
} from 'lucide-react';
import { useSimulationStore, BusRouteInfo } from '../../context/SimulationStore';
import { LiveCameraCV } from '../LiveCameraCV';

export const BusesView: React.FC = () => {
  const { buses } = useSimulationStore();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeStreamBus, setActiveStreamBus] = useState<BusRouteInfo | null>(null);

  const filteredFleet = buses.filter(
    (b) =>
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.busCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
            Real-time GPS telematics, speed tracking, and onboard AI camera feeds across urban transit corridors.
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

      {/* Fleet Cards Grid (Indian Transit Routes in 100% Sync with Live Map) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFleet.map((bus) => {
          const isStopped = bus.status === 'TRANSIT_STOP';
          const isAlert = bus.status === 'HAZARD_ALERT';

          return (
            <div
              key={bus.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition flex flex-col justify-between space-y-4 shadow-xs"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center font-bold">
                      <Bus className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-base text-gray-900 leading-tight">Bus {bus.id}</h3>
                        <span className="font-mono text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded border border-gray-200">
                          {bus.busCode}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-500 font-medium truncate block max-w-[170px]">
                        {bus.routeName}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    isAlert
                      ? 'bg-red-50 text-red-600 border-red-200'
                      : isStopped
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-[#16A34A] border-emerald-200'
                  }`}>
                    {isAlert ? 'HAZARD ALERT' : isStopped ? 'TRANSIT STOP' : 'IN TRANSIT'}
                  </span>
                </div>
              </div>

              {/* Dynamic Telematics Readout (Synced with Live Map) */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5 font-medium">
                    <Gauge className="w-3.5 h-3.5 text-gray-400" />
                    Live Speed:
                  </span>
                  <strong className="font-mono font-bold text-gray-900 text-sm">{bus.speedKmh} km/h</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    Current Corridor:
                  </span>
                  <span className="text-gray-800 font-medium truncate max-w-[150px]">{bus.currentLocationName}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5 font-medium">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    Driver:
                  </span>
                  <span className="text-gray-800 font-medium">{bus.driverName}</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-gray-200/60">
                  <span className="text-gray-400 text-[11px]">Passenger Capacity:</span>
                  <span className="text-gray-600 text-[11px] font-semibold">{bus.occupancy}</span>
                </div>
              </div>

              {/* Click to open Live AI Camera Stream */}
              <button
                onClick={() => setActiveStreamBus(bus)}
                className="w-full py-2.5 rounded-lg bg-gray-900 hover:bg-black text-white text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Video className="w-4 h-4 text-emerald-400" />
                <span>Watch Live Onboard AI Camera</span>
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
                    Bus {activeStreamBus.id} ({activeStreamBus.busCode}) — Live AI Vision Stream
                  </h3>
                  <p className="text-[11px] text-gray-400 font-mono">
                    Driver: {activeStreamBus.driverName} • Speed: {activeStreamBus.speedKmh} km/h • {activeStreamBus.currentLocationName}
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
