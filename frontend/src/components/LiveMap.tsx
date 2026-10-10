import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Plus, Minus, Layers, AlertTriangle, Eye, ShieldAlert, Bus } from 'lucide-react';
import { useSimulationStore, BusRouteInfo, MapAlertNotification } from '../context/SimulationStore';

interface LiveMapProps {
  onSelectHazard?: (hazardId: string) => void;
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

    // Centered over Banjara Hills / Somajiguda / Punjagutta Road Network
    const map = L.map(mapContainerRef.current, {
      center: [17.4250, 78.4480],
      zoom: 14,
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

  // 3. Update 6 Moving Indian Transit Buses on the Map (Pixel-Perfect GPS Anchoring)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    buses.forEach((bus) => {
      const isStopped = bus.status === 'TRANSIT_STOP';
      const isAlert = bus.status === 'HAZARD_ALERT';
      const bgColor = isAlert ? '#DC2626' : isStopped ? '#D97706' : '#16A34A';

      // Pixel-perfect bottom-anchored pin with zero CSS transform conflicts
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
        iconAnchor: [40, 32], // Bottom-center anchored exactly to GPS lat/lng
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

  // 4. Render Active 2.5s Auto-Fading Alert Popup on Map
  useEffect(() => {
    alertLayerGroup.current.clearLayers();
    if (!activeMapAlert || !mapInstanceRef.current) return;

    const alertIcon = L.divIcon({
      className: 'map-alert-popup-wrapper',
      html: `
        <div style="
          width: 240px;
          display: flex;
          flex-direction: column;
          align-items: center;
        ">
          <div style="
            background: #111827;
            color: white;
            padding: 8px 12px;
            border-radius: 10px;
            box-shadow: 0 8px 20px rgba(0,0,0,0.35);
            border: 2px solid ${activeMapAlert.type === 'NO_HELMET' ? '#3B82F6' : '#DC2626'};
            display: flex;
            align-items: center;
            gap: 8px;
            white-space: nowrap;
          ">
            <div style="
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: ${activeMapAlert.type === 'NO_HELMET' ? '#3B82F6' : '#DC2626'};
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 11px;
              font-weight: bold;
            ">
              ${activeMapAlert.type === 'NO_HELMET' ? '🛵' : '⚠️'}
            </div>
            <div>
              <div style="font-size: 11px; font-weight: 800; color: #F9FAFB;">
                ${activeMapAlert.title}
              </div>
              <div style="font-size: 10px; color: #9CA3AF;">
                Reported by Bus ${activeMapAlert.busNumber} • ${activeMapAlert.location}
              </div>
            </div>
          </div>
          <div style="
            width: 0;
            height: 0;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 5px solid #111827;
            margin-top: -1px;
          "></div>
        </div>
      `,
      iconSize: [240, 54],
      iconAnchor: [120, 54],
    });

    const alertMarker = L.marker([activeMapAlert.lat, activeMapAlert.lng], {
      icon: alertIcon,
      zIndexOffset: 1000,
    });

    alertMarker.addTo(alertLayerGroup.current);
  }, [activeMapAlert]);

  return (
    <div className="relative w-full h-full select-none">
      {/* Leaflet Map Div */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

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
