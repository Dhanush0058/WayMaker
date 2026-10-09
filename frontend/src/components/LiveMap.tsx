import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Plus, Minus, Crosshair } from 'lucide-react';
import { VehicleEvent, Hazard, TrafficSignal, AmbulanceRoute, RoadSegment } from '../types';

interface LiveMapProps {
  vehicles: VehicleEvent[];
  hazards: Hazard[];
  signals: TrafficSignal[];
  ambulance?: AmbulanceRoute;
  segments: RoadSegment[];
  onSelectHazard?: (hazard: Hazard) => void;
}

export const LiveMap: React.FC<LiveMapProps> = ({
  vehicles,
  hazards,
  signals,
  ambulance,
  segments,
  onSelectHazard,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mapType, setMapType] = useState<'map' | 'satellite' | 'terrain'>('map');

  // Layer groups
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const roadLayerGroup = useRef<L.LayerGroup>(new L.LayerGroup());
  const routeLayerGroup = useRef<L.LayerGroup>(new L.LayerGroup());
  const signalLayerGroup = useRef<L.LayerGroup>(new L.LayerGroup());
  const hazardLayerGroup = useRef<L.LayerGroup>(new L.LayerGroup());
  const vehicleLayerGroup = useRef<L.LayerGroup>(new L.LayerGroup());
  const poiLayerGroup = useRef<L.LayerGroup>(new L.LayerGroup());

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered over Banjara Hills / Somajiguda / Hussain Sagar
    const map = L.map(mapContainerRef.current, {
      center: [17.4210, 78.4480],
      zoom: 14,
      zoomControl: false,
    });

    const tile = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    });
    tile.addTo(map);
    tileLayerRef.current = tile;

    // Attach layers
    roadLayerGroup.current.addTo(map);
    routeLayerGroup.current.addTo(map);
    poiLayerGroup.current.addTo(map);
    signalLayerGroup.current.addTo(map);
    hazardLayerGroup.current.addTo(map);
    vehicleLayerGroup.current.addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle tile switch
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    let url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    if (mapType === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    } else if (mapType === 'terrain') {
      url = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
    }

    const newTile = L.tileLayer(url, { maxZoom: 19 });
    newTile.addTo(mapInstanceRef.current);
    tileLayerRef.current = newTile;
  }, [mapType]);

  // Update Hospital Pin & Destination Marker
  useEffect(() => {
    poiLayerGroup.current.clearLayers();

    // City General Hospital
    const hospIcon = L.divIcon({
      className: 'custom-hosp-icon',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="background: white; border-radius: 8px; padding: 4px 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; items-center; gap: 6px; border: 1px solid #E5E7EB; white-space: nowrap;">
            <div style="background: #16A34A; color: white; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 11px;">+</div>
            <div>
              <div style="font-weight: 800; font-size: 11px; color: #111827;">City General Hospital</div>
              <div style="font-size: 9px; font-weight: 700; color: #16A34A;">ETA: 8 min</div>
            </div>
          </div>
          <div style="width: 12px; height: 12px; background: #16A34A; border: 2px solid white; border-radius: 50%; margin-top: -3px; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>
        </div>
      `,
      iconSize: [150, 48],
      iconAnchor: [75, 42],
    });

    const hospMarker = L.marker([17.4370, 78.4720], { icon: hospIcon, zIndexOffset: 900 });
    poiLayerGroup.current.addLayer(hospMarker);
  }, []);

  // Update Routes (Active Green with directional flow & Yellow/Orange bypassed section)
  useEffect(() => {
    routeLayerGroup.current.clearLayers();
    if (!ambulance) return;

    // 1. Bypassed / Avoided segment in Orange/Yellow (5th Ave trunk)
    const bypassedSegment = [
      [17.4100, 78.4320], // Banjara Rd 1
      [17.4150, 78.4420], // 5th Ave West
      [17.4180, 78.4490], // 5th Ave Hazard
      [17.4210, 78.4550], // 5th Ave East
    ];

    const bypassLine = L.polyline(bypassedSegment as [number, number][], {
      color: '#F59E0B',
      weight: 6,
      opacity: 0.85,
      dashArray: '6, 6',
      lineCap: 'round',
    });
    routeLayerGroup.current.addLayer(bypassLine);

    // 2. Active Ambulance Route in vivid green
    if (ambulance.current_route_coords && ambulance.current_route_coords.length > 0) {
      // High-visibility emerald green polyline
      const activeLine = L.polyline(ambulance.current_route_coords, {
        color: '#16A34A',
        weight: 7,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      });
      routeLayerGroup.current.addLayer(activeLine);

      // Inner glowing core
      const innerLine = L.polyline(ambulance.current_route_coords, {
        color: '#4ADE80',
        weight: 3,
        opacity: 0.9,
      });
      routeLayerGroup.current.addLayer(innerLine);
    }
  }, [ambulance]);

  // Update Hazard Marker with pulsating circular ripple (Pothole / Rupture)
  useEffect(() => {
    hazardLayerGroup.current.clearLayers();

    const hazardLat = 17.4168;
    const hazardLng = 78.4485;

    // Pulsing circle around hazard
    const pulseCircle = L.circle([hazardLat, hazardLng], {
      radius: 120,
      color: '#DC2626',
      fillColor: '#EF4444',
      fillOpacity: 0.25,
      weight: 1.5,
    });
    hazardLayerGroup.current.addLayer(pulseCircle);

    // Inner pulsing ring
    const innerCircle = L.circle([hazardLat, hazardLng], {
      radius: 60,
      color: '#DC2626',
      fillColor: '#DC2626',
      fillOpacity: 0.45,
      weight: 2,
    });
    hazardLayerGroup.current.addLayer(innerCircle);

    // Pin with floating label "Pothole"
    const hazardIcon = L.divIcon({
      className: 'custom-hazard-label',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%);">
          <div style="background: white; border-radius: 6px; padding: 2px 6px; border: 1.5px solid #DC2626; box-shadow: 0 2px 6px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 4px; white-space: nowrap;">
            <span style="font-size: 11px;">⚠️</span>
            <span style="color: #DC2626; font-weight: 800; font-size: 10px;">Pothole</span>
          </div>
          <div style="width: 22px; height: 22px; border-radius: 50%; background: #DC2626; border: 2.5px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(220,38,38,0.5); margin-top: -2px;">
            <span style="color: white; font-weight: 900; font-size: 11px;">!</span>
          </div>
        </div>
      `,
      iconSize: [60, 40],
      iconAnchor: [0, 0],
    });

    const hazardMarker = L.marker([hazardLat, hazardLng], { icon: hazardIcon, zIndexOffset: 950 });
    hazardMarker.on('click', () => {
      if (hazards.length > 0 && onSelectHazard) onSelectHazard(hazards[0]);
    });
    hazardLayerGroup.current.addLayer(hazardMarker);
  }, [hazards, onSelectHazard]);

  // Update Synced Traffic Lights along the route
  useEffect(() => {
    signalLayerGroup.current.clearLayers();

    // Coordinates along Somajiguda to Begumpet corridor
    const syncedLightPoints: [number, number][] = [
      [17.4120, 78.4350],
      [17.4200, 78.4390],
      [17.4240, 78.4440],
      [17.4260, 78.4520],
      [17.4280, 78.4610],
      [17.4320, 78.4660],
    ];

    syncedLightPoints.forEach((pt) => {
      const lightIcon = L.divIcon({
        className: 'custom-traffic-light-point',
        html: `
          <div style="width: 14px; height: 14px; border-radius: 50%; background: #16A34A; border: 2.5px solid white; box-shadow: 0 0 10px #22C55E; display: flex; align-items: center; justify-content: center;">
            <div style="width: 4px; height: 4px; border-radius: 50%; background: white;"></div>
          </div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const marker = L.marker(pt, { icon: lightIcon, zIndexOffset: 850 });
      signalLayerGroup.current.addLayer(marker);
    });
  }, [signals]);

  // Update Vehicles: Ambulance A-17 with floating badge & Bus 42, Bus 18
  useEffect(() => {
    vehicleLayerGroup.current.clearLayers();

    // 1. Ambulance A-17
    const ambLat = ambulance?.current_lat || 17.4080;
    const ambLng = ambulance?.current_lng || 78.4230;

    const ambIcon = L.divIcon({
      className: 'custom-amb-floating-badge',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="background: white; border-radius: 8px; padding: 4px 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.18); border: 1px solid #E5E7EB; white-space: nowrap; margin-bottom: 2px;">
            <div style="font-weight: 800; font-size: 11px; color: #111827;">Ambulance A-17</div>
            <div style="display: flex; gap: 6px; font-size: 9px; font-weight: 700;">
              <span style="color: #16A34A;">ETA: 8 min</span>
              <span style="color: #6B7280;">•</span>
              <span style="color: #4B5563;">Speed: 52 km/h</span>
            </div>
          </div>
          <div style="display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 50%; background: white; border: 2.5px solid #DC2626; box-shadow: 0 3px 8px rgba(0,0,0,0.25);">
            <span style="font-size: 18px;">🚑</span>
          </div>
        </div>
      `,
      iconSize: [140, 68],
      iconAnchor: [70, 58],
    });

    const ambMarker = L.marker([ambLat, ambLng], { icon: ambIcon, zIndexOffset: 1000 });
    vehicleLayerGroup.current.addLayer(ambMarker);

    // 2. Bus 42 (near 5th Ave)
    const bus42Icon = L.divIcon({
      className: 'custom-bus42-badge',
      html: `
        <div style="background: white; border-radius: 6px; padding: 3px 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 4px; border: 1px solid #D1D5DB; white-space: nowrap;">
          <div style="background: #374151; color: white; border-radius: 4px; padding: 1px 3px; font-size: 9px;">🚌</div>
          <span style="font-weight: 800; font-size: 10px; color: #111827;">Bus 42</span>
        </div>
      `,
      iconSize: [80, 26],
      iconAnchor: [40, 13],
    });
    const bus42Marker = L.marker([17.4190, 78.4470], { icon: bus42Icon, zIndexOffset: 800 });
    vehicleLayerGroup.current.addLayer(bus42Marker);

    // 3. Bus 18 (near Tolichowki)
    const bus18Icon = L.divIcon({
      className: 'custom-bus18-badge',
      html: `
        <div style="background: white; border-radius: 6px; padding: 3px 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 4px; border: 1px solid #D1D5DB; white-space: nowrap;">
          <div style="background: #374151; color: white; border-radius: 4px; padding: 1px 3px; font-size: 9px;">🚌</div>
          <span style="font-weight: 800; font-size: 10px; color: #111827;">Bus 18</span>
        </div>
      `,
      iconSize: [80, 26],
      iconAnchor: [40, 13],
    });
    const bus18Marker = L.marker([17.4070, 78.4410], { icon: bus18Icon, zIndexOffset: 800 });
    vehicleLayerGroup.current.addLayer(bus18Marker);
  }, [ambulance, vehicles]);

  // Zoom handlers
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleRecenter = () => mapInstanceRef.current?.setView([17.4210, 78.4480], 14);

  return (
    <div className="relative w-full h-[580px] rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs bg-[#F4F6F8]">
      {/* Map Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Left: Map / Satellite / Terrain Buttons */}
      <div className="absolute top-4 left-4 z-[500] flex items-center bg-white rounded-xl p-1 shadow-md border border-gray-200/80 text-xs font-bold">
        <button
          onClick={() => setMapType('map')}
          className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
            mapType === 'map'
              ? 'bg-[#1E293B] text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Map
        </button>
        <button
          onClick={() => setMapType('satellite')}
          className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
            mapType === 'satellite'
              ? 'bg-[#1E293B] text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Satellite
        </button>
        <button
          onClick={() => setMapType('terrain')}
          className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
            mapType === 'terrain'
              ? 'bg-[#1E293B] text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Terrain
        </button>
      </div>

      {/* Top Right: Zoom In, Out, Recenter Buttons */}
      <div className="absolute top-4 right-4 z-[500] flex flex-col gap-1.5">
        <div className="bg-white rounded-xl shadow-md border border-gray-200/80 overflow-hidden flex flex-col">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-gray-50 text-gray-700 transition cursor-pointer border-b border-gray-100 flex items-center justify-center"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-gray-50 text-gray-700 transition cursor-pointer flex items-center justify-center"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleRecenter}
          className="p-2 bg-white rounded-xl shadow-md border border-gray-200/80 hover:bg-gray-50 text-gray-700 transition cursor-pointer flex items-center justify-center"
          title="Recenter Map"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Map Legend Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[500] bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-lg border border-gray-200/90 flex items-center gap-6 text-xs font-bold text-gray-700">
        <div className="flex items-center gap-2">
          <span className="w-4 h-1 bg-[#16A34A] rounded"></span>
          <span>Ambulance Route</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-[10px]">
            ⚠️
          </div>
          <span>Hazard (Pothole)</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#16A34A] border-2 border-white shadow-xs"></span>
          <span>Synced Traffic Light</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-700 text-white flex items-center justify-center text-[10px]">
            🚌
          </div>
          <span>Bus (Live)</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#16A34A] text-white flex items-center justify-center text-[10px] font-black">
            +
          </div>
          <span>Hospital</span>
        </div>
      </div>
    </div>
  );
};
