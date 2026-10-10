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

    // Centered over Somajiguda / Punjagutta / Banjara Hills Hyderabad
    const map = L.map(mapContainerRef.current, {
      center: [17.4260, 78.4530],
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

  // 3. Update 6 Moving Indian Transit Buses on the Map
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    buses.forEach((bus) => {
      const isStopped = bus.status === 'TRANSIT_STOP';
      const isAlert = bus.status === 'HAZARD_ALERT';

      const customIcon = L.divIcon({
        className: 'bus-marker-container',
        html: `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            transform: translate(-50%, -50%);
            cursor: pointer;
            transition: all 0.3s ease-out;
          ">
            <div style="
              background: ${isAlert ? '#DC2626' : isStopped ? '#D97706' : '#16A34A'};
              color: white;
              padding: 3px 8px;
              border-radius: 6px;
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
              font-size: 11px;
              font-weight: 800;
              box-shadow: 0 4px 10px rgba(0,0,0,0.25);
              border: 2px solid white;
              display: flex;
              align-items: center;
              gap: 4px;
              white-space: nowrap;
            ">
              <span style="font-size: 10px;">🚌</span>
              <span>${bus.id}</span>
              <span style="font-size: 9px; opacity: 0.9; background: rgba(0,0,0,0.2); padding: 1px 4px; border-radius: 3px;">
                ${bus.speedKmh} km/h
              </span>
            </div>
            <div style="
              width: 8px;
              height: 8px;
              background: ${isAlert ? '#DC2626' : '#16A34A'};
              border: 2px solid white;
              border-radius: 50%;
              margin-top: -2px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            "></div>
          </div>
        `,
        iconSize: [80, 40],
        iconAnchor: [40, 20],
      });

      if (busMarkersRef.current[bus.id]) {
        // Smoothly update position
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
      className: 'map-alert-popup-container',
      html: `
        <div style="
          transform: translate(-50%, -100%);
          animation: bounce 0.4s ease-out;
        ">
          <div style="
            background: #111827;
            color: white;
            padding: 8px 12px;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.4);
            border: 2px solid ${activeMapAlert.type === 'NO_HELMET' ? '#3B82F6' : '#DC2626'};
            display: flex;
            align-items: center;
            gap: 8px;
            white-space: nowrap;
          ">
            <div style="
              width: 22px;
              height: 22px;
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
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 6px solid #111827;
            margin: 0 auto;
          "></div>
        </div>
      `,
      iconSize: [240, 60],
      iconAnchor: [120, 50],
    });

    const alertMarker = L.marker([activeMapAlert.lat, activeMapAlert.lng], {
      icon: alertIcon,
      zIndexOffset: 1000,
    });

    alertMarker.addTo(alertLayerGroup.current);
  }, [activeMapAlert]);

  return (
    <div className="relative w-full h-full min-h-[500px] select-none">
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
