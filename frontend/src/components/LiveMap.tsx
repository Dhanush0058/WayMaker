import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Plus, Minus, Layers, AlertTriangle, Eye, ShieldAlert, Bus, ChevronRight, X } from 'lucide-react';
import { useSimulationStore, BusRouteInfo, MapAlertNotification } from '../context/SimulationStore';

interface LiveMapProps {
  onSelectHazard?: (hazardId?: string) => void;
}

export const LiveMap: React.FC<LiveMapProps> = ({ onSelectHazard }) => {
  const { buses, activeMapAlert } = useSimulationStore();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mapType, setMapType] = useState<'map' | 'satellite'>('map');

  // Layer groups
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const busLayerGroup = useRef<L.LayerGroup>(new L.LayerGroup());
  const alertLayerGroup = useRef<L.LayerGroup>(new L.LayerGroup());
  const busMarkersRef = useRef<Record<string, L.Marker>>({});

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered over Western Hyderabad Tech Corridor (Hitec City, Madhapur, Gachibowli, Kondapur, Jubilee Hills)
    const map = L.map(mapContainerRef.current, {
      center: [17.4380, 78.3820],
      zoom: 13.5,
      zoomControl: false,
    });

    const tile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    });
    tile.addTo(map);
    tileLayerRef.current = tile;

    busLayerGroup.current.addTo(map);
    alertLayerGroup.current.addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Handle Map Type Toggle
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    const url =
      mapType === 'satellite'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const newTile = L.tileLayer(url, { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' });
    newTile.addTo(mapInstanceRef.current);
    tileLayerRef.current = newTile;
  }, [mapType]);

  // 3. Update 6 Moving Indian Transit Buses on the Map
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    buses.forEach((bus) => {
      const isStopped = bus.status === 'TRANSIT_STOP';
      const isAlert = bus.status === 'HAZARD_ALERT';
      const bgColor = isAlert ? '#DC2626' : isStopped ? '#D97706' : '#16A34A';

      // Bottom-anchored pin with zero CSS transform conflicts
      const customIcon = L.divIcon({
        className: 'bus-pin-wrapper',
        html: `
          <div style="
            width: 80px;
            height: 32px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-end;
            user-select: none;
            pointer-events: auto;
          ">
            <div style="
              background: ${bgColor};
              color: white;
              padding: 2px 6px;
              border-radius: 5px;
              font-family: ui-monospace, monospace;
              font-size: 11px;
              font-weight: 800;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              border: 1.5px solid white;
              display: flex;
              align-items: center;
              gap: 3px;
              white-space: nowrap;
              line-height: 1;
            ">
              <span style="font-size: 10px;">🚌</span>
              <span>${bus.id}</span>
              <span style="font-size: 9px; opacity: 0.9; background: rgba(0,0,0,0.25); padding: 1px 3px; border-radius: 2px;">
                ${bus.speedKmh}k
              </span>
            </div>
            <div style="
              width: 6px;
              height: 6px;
              background: ${bgColor};
              border: 1.5px solid white;
              border-radius: 50%;
              margin-top: -1px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.4);
            "></div>
          </div>
        `,
        iconSize: [80, 32],
        iconAnchor: [40, 32],
      });

      if (busMarkersRef.current[bus.id]) {
        busMarkersRef.current[bus.id].setLatLng([bus.lat, bus.lng]);
        busMarkersRef.current[bus.id].setIcon(customIcon);
      } else {
        const marker = L.marker([bus.lat, bus.lng], { icon: customIcon });
        marker.addTo(busLayerGroup.current);
        busMarkersRef.current[bus.id] = marker;
      }
    });
  }, [buses]);

  // 4. Render On-Map Callout Popup & Pulsing Ring for Active Alert
  useEffect(() => {
    alertLayerGroup.current.clearLayers();
    if (!activeMapAlert || !mapInstanceRef.current) return;

    const isHelmet = activeMapAlert.type === 'NO_HELMET';
    const alertBg = isHelmet ? '#2563EB' : '#DC2626';
    const alertIcon = isHelmet ? '🛵' : '⚠️';
    const alertLabel =
      activeMapAlert.type === 'POTHOLE'
        ? 'Pothole Detected'
        : activeMapAlert.type === 'GARBAGE'
        ? 'Garbage Overflow Detected'
        : activeMapAlert.type === 'ROAD_DAMAGE'
        ? 'Road Damage Detected'
        : 'No Helmet Violation';

    // 1. Pulsing ring
    const ringIcon = L.divIcon({
      className: 'map-alert-pulse-ring',
      html: `
        <div style="
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: 3px solid ${alertBg};
          background: ${isHelmet ? 'rgba(37,99,235,0.3)' : 'rgba(220,38,38,0.3)'};
          animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
          box-shadow: 0 0 16px ${alertBg};
        "></div>
      `,
      iconSize: [52, 52],
      iconAnchor: [26, 26],
    });

    const ringMarker = L.marker([activeMapAlert.lat, activeMapAlert.lng], {
      icon: ringIcon,
      zIndexOffset: 9998,
    });
    ringMarker.addTo(alertLayerGroup.current);

    // 2. Floating callout bubble directly above the detecting bus
    const calloutIcon = L.divIcon({
      className: 'map-alert-callout-wrapper',
      html: `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          transform: translateY(-50px);
          pointer-events: auto;
          cursor: pointer;
          filter: drop-shadow(0 4px 14px rgba(0,0,0,0.5));
        ">
          <div style="
            background: ${alertBg};
            color: #ffffff;
            padding: 4px 10px;
            border-radius: 8px;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 11px;
            font-weight: 800;
            border: 2px solid #ffffff;
            display: flex;
            align-items: center;
            gap: 5px;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">
            <span style="font-size: 12px;">${alertIcon}</span>
            <span>Bus ${activeMapAlert.busNumber}: ${alertLabel}</span>
          </div>
          <div style="
            width: 8px;
            height: 8px;
            background: ${alertBg};
            transform: rotate(45deg);
            margin-top: -5px;
            border-right: 2px solid #ffffff;
            border-bottom: 2px solid #ffffff;
          "></div>
        </div>
      `,
      iconSize: [220, 50],
      iconAnchor: [110, 25],
    });

    const calloutMarker = L.marker([activeMapAlert.lat, activeMapAlert.lng], {
      icon: calloutIcon,
      zIndexOffset: 9999,
    });
    calloutMarker.on('click', () => onSelectHazard?.());
    calloutMarker.addTo(alertLayerGroup.current);
  }, [activeMapAlert, onSelectHazard]);

  return (
    <div className="relative w-full h-full select-none">
      {/* Leaflet Map Div */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* TOP-CENTER DYNAMIC 4s POPUP ALERT TOAST (Auto-Dismissing Banner) */}
      {activeMapAlert && (
        <div
          onClick={() => onSelectHazard?.()}
          style={{ zIndex: 9999 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 max-w-md w-[90%] bg-gray-950/95 text-white p-3.5 rounded-2xl shadow-2xl border border-gray-700 flex items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-300 backdrop-blur-md cursor-pointer hover:border-gray-500 transition"
          title="Click to view ticket dossier"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold ${
              activeMapAlert.type === 'NO_HELMET'
                ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
                : 'bg-red-600/30 text-red-400 border border-red-500/40'
            }`}>
              {activeMapAlert.type === 'NO_HELMET' ? '🛵' : '⚠️'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded border ${
                  activeMapAlert.type === 'NO_HELMET'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                    : 'bg-red-500/20 text-red-300 border-red-400/30'
                }`}>
                  Bus {activeMapAlert.busNumber} AI Detection
                </span>
                <span className="text-[10px] text-gray-400">{activeMapAlert.timestamp}</span>
              </div>
              <h4 className="font-bold text-xs text-gray-100 truncate mt-0.5">{activeMapAlert.title}</h4>
              <p className="text-[11px] text-gray-400 truncate">{activeMapAlert.location}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-400 shrink-0 font-semibold bg-gray-800/80 px-2 py-1 rounded-lg border border-gray-700">
            <span>Ticket Created</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

      {/* Floating Map Controls (Top-Right) */}
      <div className="absolute top-4 right-4 z-400 flex flex-col gap-2">
        {/* Layer Switcher */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-1 flex gap-1 text-xs font-semibold">
          <button
            onClick={() => setMapType('map')}
            className={`px-2.5 py-1 rounded transition cursor-pointer ${
              mapType === 'map' ? 'bg-[#16A34A] text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Street Map
          </button>
          <button
            onClick={() => setMapType('satellite')}
            className={`px-2.5 py-1 rounded transition cursor-pointer ${
              mapType === 'satellite' ? 'bg-[#16A34A] text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Satellite
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 flex flex-col overflow-hidden self-end">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="p-2 text-gray-700 hover:bg-gray-100 transition border-b border-gray-100 cursor-pointer"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="p-2 text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Bottom Legend Bar */}
      <div className="absolute bottom-4 left-4 z-400 bg-white/95 backdrop-blur-xs rounded-xl shadow-md border border-gray-200 px-4 py-2 flex items-center gap-4 text-xs font-medium text-gray-700">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#16A34A] flex items-center justify-center text-white text-[8px]">
            ●
          </span>
          <span>6 Active Transit Buses (Live GPS)</span>
        </div>
        <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
          <span>AI Incident Detection Active</span>
        </div>
      </div>
    </div>
  );
};
