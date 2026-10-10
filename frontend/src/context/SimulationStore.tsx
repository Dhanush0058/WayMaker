import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export interface BusRouteInfo {
  id: string; // e.g. '47L'
  busCode: string; // e.g. 'TS 09 Z 4712'
  routeName: string; // e.g. 'Secunderabad ⇄ Manikonda via Somajiguda'
  driverName: string;
  driverContact: string;
  speedKmh: number;
  status: 'IN_TRANSIT' | 'TRANSIT_STOP' | 'HAZARD_ALERT';
  currentLocationName: string;
  lat: number;
  lng: number;
  heading: number;
  occupancy: string;
  // Waypoints along real road corridors
  waypoints: [number, number][];
  currentWaypointIdx: number;
  progress: number;
}

export interface MapAlertNotification {
  id: string;
  busNumber: string;
  title: string;
  location: string;
  type: 'POTHOLE' | 'NO_HELMET' | 'GARBAGE' | 'ROAD_DAMAGE';
  lat: number;
  lng: number;
  timestamp: string;
}

export interface TicketItem {
  id: string;
  category: 'POTHOLE' | 'GARBAGE' | 'ROAD_DAMAGE' | 'NO_HELMET_VIOLATION';
  title: string;
  location: string;
  coordinates: string;
  detectedBy: string;
  timestamp: string;
  assignedOfficer: string;
  officerRole: string;
  department: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED';
  slaHoursRemaining: number;
  imageUrl: string;
  vehiclePlate?: string;
  fineAmount?: string;
}

export interface AuditLogEvent {
  id: string;
  title: string;
  desc: string;
  time: string;
  tag: string;
  tagColor: string;
}

interface SimulationStoreType {
  buses: BusRouteInfo[];
  activeMapAlert: MapAlertNotification | null;
  tickets: TicketItem[];
  logs: AuditLogEvent[];
  updateTicketStatus: (ticketId: string, status: TicketItem['status']) => void;
  triggerManualIncident: (type: 'POTHOLE' | 'NO_HELMET' | 'GARBAGE' | 'ROAD_DAMAGE') => void;
}

const SimulationStoreContext = createContext<SimulationStoreType | undefined>(undefined);

// Real Hyderabad inland road corridors away from Hussain Sagar (Jubilee Hills, Banjara Hills, Ameerpet, SR Nagar, Erragadda, Punjagutta, Masab Tank)
const INITIAL_BUSES: BusRouteInfo[] = [
  {
    id: '47L',
    busCode: 'TS 09 Z 4712',
    routeName: 'Jubilee Hills ⇄ Madhapur via Road No. 36',
    driverName: 'K. Raghavan',
    driverContact: '+91 98490 12841',
    speedKmh: 42,
    status: 'IN_TRANSIT',
    currentLocationName: 'Jubilee Hills Checkpost Junction',
    lat: 17.4280,
    lng: 78.4120,
    heading: 45,
    occupancy: '38 / 52 Seats',
    waypoints: [
      [17.4310, 78.4050], // Road 36 / Madhapur
      [17.4280, 78.4120], // Jubilee Hills Checkpost
      [17.4240, 78.4210], // Road No. 45 Junction
      [17.4200, 78.4290], // Banjara Hills Rd 10
      [17.4240, 78.4210],
      [17.4280, 78.4120],
    ],
    currentWaypointIdx: 1,
    progress: 0.4,
  },
  {
    id: '10H',
    busCode: 'TS 08 UB 1084',
    routeName: 'Ameerpet ⇄ Erragadda via SR Nagar Corridor',
    driverName: 'M. Suresh Kumar',
    driverContact: '+91 97012 34910',
    speedKmh: 36,
    status: 'IN_TRANSIT',
    currentLocationName: 'SR Nagar Metro Station',
    lat: 17.4420,
    lng: 78.4430,
    heading: 120,
    occupancy: '44 / 52 Seats',
    waypoints: [
      [17.4370, 78.4480], // Ameerpet Metro Junction
      [17.4420, 78.4430], // SR Nagar Main Road
      [17.4480, 78.4380], // Vengal Rao Nagar / ESI
      [17.4550, 78.4310], // Erragadda X Roads
      [17.4480, 78.4380],
      [17.4420, 78.4430],
    ],
    currentWaypointIdx: 1,
    progress: 0.3,
  },
  {
    id: '218',
    busCode: 'TS 11 Z 2180',
    routeName: 'Punjagutta ⇄ Sanath Nagar via Balkampet',
    driverName: 'P. Venkat Reddy',
    driverContact: '+91 99882 11094',
    speedKmh: 48,
    status: 'IN_TRANSIT',
    currentLocationName: 'Ameerpet X Roads Corridor',
    lat: 17.4340,
    lng: 78.4450,
    heading: 90,
    occupancy: '49 / 52 Seats',
    waypoints: [
      [17.4260, 78.4480], // Punjagutta Flyover
      [17.4340, 78.4450], // Ameerpet X Roads
      [17.4420, 78.4460], // Balkampet Yellamma Temple Rd
      [17.4520, 78.4480], // Sanath Nagar Industrial Corridor
      [17.4420, 78.4460],
      [17.4340, 78.4450],
    ],
    currentWaypointIdx: 1,
    progress: 0.5,
  },
  {
    id: '127K',
    busCode: 'TS 09 EA 1279',
    routeName: 'Banjara Hills Rd 1 ⇄ Film Nagar via Rd 12',
    driverName: 'T. Narsimha',
    driverContact: '+91 94401 88320',
    speedKmh: 28,
    status: 'TRANSIT_STOP',
    currentLocationName: 'Banjara Hills Road No. 12 Junction',
    lat: 17.4180,
    lng: 78.4320,
    heading: 180,
    occupancy: '31 / 52 Seats',
    waypoints: [
      [17.4140, 78.4420], // Banjara Hills Rd 1 / Taj Krishna
      [17.4180, 78.4320], // Banjara Hills Rd 12
      [17.4190, 78.4210], // Cancer Hospital / KBR Outer
      [17.4150, 78.4110], // Film Nagar Main Rd
      [17.4190, 78.4210],
      [17.4180, 78.4320],
    ],
    currentWaypointIdx: 1,
    progress: 0.3,
  },
  {
    id: '222A',
    busCode: 'TS 07 UA 2221',
    routeName: 'Masab Tank ⇄ KBR Park via Banjara Hills Rd 10',
    driverName: 'G. Srinivas Rao',
    driverContact: '+91 91210 99402',
    speedKmh: 34,
    status: 'IN_TRANSIT',
    currentLocationName: 'Banjara Hills Road No. 10 Avenue',
    lat: 17.4200,
    lng: 78.4300,
    heading: 270,
    occupancy: '26 / 52 Seats',
    waypoints: [
      [17.4040, 78.4440], // Masab Tank Flyover
      [17.4120, 78.4390], // Banjara Hills Care Hospital
      [17.4200, 78.4300], // Banjara Hills Rd 10
      [17.4260, 78.4220], // KBR Park Gate
      [17.4200, 78.4300],
      [17.4120, 78.4390],
    ],
    currentWaypointIdx: 2,
    progress: 0.4,
  },
  {
    id: '5K',
    busCode: 'TS 09 Z 0505',
    routeName: 'Yousufguda ⇄ Srinagar Colony ⇄ Jubilee Hills',
    driverName: 'D. Naidu',
    driverContact: '+91 98850 77123',
    speedKmh: 39,
    status: 'IN_TRANSIT',
    currentLocationName: 'Yousufguda Main Corridor',
    lat: 17.4390,
    lng: 78.4260,
    heading: 330,
    occupancy: '42 / 52 Seats',
    waypoints: [
      [17.4450, 78.4330], // Vengal Rao Nagar
      [17.4390, 78.4260], // Yousufguda Checkpost
      [17.4340, 78.4200], // Sri Krishna Nagar
      [17.4280, 78.4180], // Jubilee Hills / Srinagar Colony Rd
      [17.4340, 78.4200],
      [17.4390, 78.4260],
    ],
    currentWaypointIdx: 1,
    progress: 0.3,
  },
];

const INITIAL_TICKETS: TicketItem[] = [
  {
    id: 'TK-101',
    category: 'POTHOLE',
    title: 'Severe Pothole & Road Rupture',
    location: 'Road No. 36 • Near Jubilee Hills Checkpost',
    coordinates: '17.4280° N, 78.4120° E',
    detectedBy: 'Bus 47L Onboard AI Camera',
    timestamp: 'Today at 08:14 AM',
    assignedOfficer: 'Eng. R. K. Varma',
    officerRole: 'Ward Field Engineer',
    department: 'GHMC Road Maintenance Ward 14',
    severity: 'CRITICAL',
    status: 'IN_PROGRESS',
    slaHoursRemaining: 34.2,
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'TK-102',
    category: 'NO_HELMET_VIOLATION',
    title: 'Rider Without Helmet Violation',
    location: 'Banjara Hills Road No. 12',
    coordinates: '17.4180° N, 78.4320° E',
    detectedBy: 'Bus 127K AI Telematics Camera',
    timestamp: 'Today at 09:22 AM',
    assignedOfficer: 'Officer S. Rao',
    officerRole: 'Sub-Inspector Traffic',
    department: 'Hyderabad City Traffic Enforcement',
    severity: 'HIGH',
    status: 'PENDING',
    slaHoursRemaining: 42.5,
    vehiclePlate: 'TS 09 EA 4281',
    fineAmount: '₹1,000 E-Challan Generated',
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'TK-103',
    category: 'GARBAGE',
    title: 'Municipal Solid Waste Overflow',
    location: 'SR Nagar Main Road Corridor',
    coordinates: '17.4420° N, 78.4430° E',
    detectedBy: 'Bus 10H AI Telematics',
    timestamp: 'Yesterday at 04:30 PM',
    assignedOfficer: 'Insp. Anand Kumar',
    officerRole: 'Sanitation Inspector',
    department: 'Solid Waste Management Division',
    severity: 'MEDIUM',
    status: 'IN_PROGRESS',
    slaHoursRemaining: 18.0,
    imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'TK-104',
    category: 'ROAD_DAMAGE',
    title: 'Water-Main Pipe Fracture & Road Flooding',
    location: 'Punjagutta Main Flyover Approach',
    coordinates: '17.4278° N, 78.4485° E',
    detectedBy: 'Bus 218 Onboard Camera',
    timestamp: '2 Days Ago at 11:00 AM',
    assignedOfficer: 'Chief Eng. A. Patil',
    officerRole: 'Zonal Superintendent',
    department: 'HMWSSB Water Supply Board',
    severity: 'CRITICAL',
    status: 'ESCALATED',
    slaHoursRemaining: 0.0,
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'TK-105',
    category: 'POTHOLE',
    title: 'Asphalt Depression Near Bus Bay',
    location: 'Banjara Hills Road No. 10 Avenue',
    coordinates: '17.4200° N, 78.4300° E',
    detectedBy: 'Bus 222A Telematics',
    timestamp: '3 Days Ago at 02:15 PM',
    assignedOfficer: 'Eng. R. K. Varma',
    officerRole: 'Ward Field Engineer',
    department: 'GHMC Road Maintenance Ward 14',
    severity: 'LOW',
    status: 'RESOLVED',
    slaHoursRemaining: 0.0,
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
  },
];

export const SimulationStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [buses, setBuses] = useState<BusRouteInfo[]>(INITIAL_BUSES);
  const [activeMapAlert, setActiveMapAlert] = useState<MapAlertNotification | null>(null);
  const [tickets, setTickets] = useState<TicketItem[]>(INITIAL_TICKETS);
  const [logs, setLogs] = useState<AuditLogEvent[]>([
    {
      id: 'log-1',
      title: 'Bus 47L Telematics Ping',
      desc: 'Speed: 42 km/h • Somajiguda Corridor normal',
      time: '10:44 AM',
      tag: 'TELEMETRY',
      tagColor: 'bg-emerald-50 text-[#16A34A] border-emerald-200',
    },
    {
      id: 'log-2',
      title: 'Ticket #TK-102 Verified',
      desc: 'No-Helmet violation citation dispatched',
      time: '10:42 AM',
      tag: 'VIOLATION',
      tagColor: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      id: 'log-3',
      title: 'Bus 218 Speed Update',
      desc: 'Speed: 48 km/h • Passing Punjagutta Flyover',
      time: '10:40 AM',
      tag: 'TELEMETRY',
      tagColor: 'bg-emerald-50 text-[#16A34A] border-emerald-200',
    },
  ]);

  const alertTimeoutRef = useRef<any>(null);
  const ticketIdCounter = useRef<number>(106);

  // 1. Continuous road motion loop: moves the 6 buses along their real road corridors
  useEffect(() => {
    const motionInterval = setInterval(() => {
      setBuses((prevBuses) =>
        prevBuses.map((bus) => {
          let nextProgress = bus.progress + 0.06;
          let nextIdx = bus.currentWaypointIdx;

          if (nextProgress >= 1.0) {
            nextProgress = 0.0;
            nextIdx = (nextIdx + 1) % (bus.waypoints.length - 1);
          }

          const currentWP = bus.waypoints[nextIdx];
          const nextWP = bus.waypoints[nextIdx + 1] || bus.waypoints[0];

          // Linear interpolation along road segment
          const curLat = currentWP[0] + (nextWP[0] - currentWP[0]) * nextProgress;
          const curLng = currentWP[1] + (nextWP[1] - currentWP[1]) * nextProgress;

          // Realistic speed variation
          const baseSpeed = bus.id === '127K' ? 28 : bus.id === '218' ? 46 : 38;
          const speedVariance = Math.floor((Math.random() - 0.5) * 8);
          const currentSpeed = Math.max(15, Math.min(55, baseSpeed + speedVariance));

          return {
            ...bus,
            lat: parseFloat(curLat.toFixed(6)),
            lng: parseFloat(curLng.toFixed(6)),
            currentWaypointIdx: nextIdx,
            progress: nextProgress,
            speedKmh: currentSpeed,
          };
        })
      );
    }, 1200);

    return () => clearInterval(motionInterval);
  }, []);

  // 2. Periodic incident detection trigger: spawns 2.5s map alert + creates ticket + logs event
  useEffect(() => {
    const incidentTimer = setInterval(() => {
      const incidentTypes: ('POTHOLE' | 'NO_HELMET' | 'GARBAGE' | 'ROAD_DAMAGE')[] = [
        'POTHOLE',
        'NO_HELMET',
        'GARBAGE',
        'ROAD_DAMAGE',
      ];
      const chosenType = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];
      triggerManualIncident(chosenType);
    }, 7500);

    return () => clearInterval(incidentTimer);
  }, [buses]);

  // 3. SLA Countdown timer for tickets
  useEffect(() => {
    const slaTimer = setInterval(() => {
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
    }, 4000);

    return () => clearInterval(slaTimer);
  }, []);

  // Helper to trigger an incident (from periodic generator or manual trigger)
  const triggerManualIncident = (type: 'POTHOLE' | 'NO_HELMET' | 'GARBAGE' | 'ROAD_DAMAGE') => {
    const reportingBus = buses[Math.floor(Math.random() * buses.length)] || buses[0];
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let title = 'Pothole & Surface Damage Detected';
    let cat: TicketItem['category'] = 'POTHOLE';
    let severity: TicketItem['severity'] = 'HIGH';
    let plate: string | undefined;
    let fine: string | undefined;

    if (type === 'NO_HELMET') {
      title = 'Civilian Without Helmet Detected';
      cat = 'NO_HELMET_VIOLATION';
      severity = 'HIGH';
      plate = `TS 09 ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))} ${1000 + Math.floor(Math.random() * 8999)}`;
      fine = '₹1,000 E-Challan Dispatched';
    } else if (type === 'GARBAGE') {
      title = 'Roadside Garbage Dump Overflow';
      cat = 'GARBAGE';
      severity = 'MEDIUM';
    } else if (type === 'ROAD_DAMAGE') {
      title = 'Water Pipeline Leak & Road Submergence';
      cat = 'ROAD_DAMAGE';
      severity = 'CRITICAL';
    }

    const newAlert: MapAlertNotification = {
      id: `alert-${Date.now()}`,
      busNumber: reportingBus.id,
      title,
      location: reportingBus.currentLocationName,
      type,
      lat: reportingBus.lat,
      lng: reportingBus.lng,
      timestamp: timeStr,
    };

    // Show map alert for 2.5 seconds, then auto-dismiss
    setActiveMapAlert(newAlert);
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    alertTimeoutRef.current = setTimeout(() => {
      setActiveMapAlert(null);
    }, 2800);

    // Create new Ticket
    const newTicketId = `TK-${ticketIdCounter.current++}`;
    const newTicket: TicketItem = {
      id: newTicketId,
      category: cat,
      title,
      location: reportingBus.currentLocationName,
      coordinates: `${reportingBus.lat.toFixed(4)}° N, ${reportingBus.lng.toFixed(4)}° E`,
      detectedBy: `Bus ${reportingBus.id} AI Camera Stream`,
      timestamp: `Today at ${timeStr}`,
      assignedOfficer: 'Eng. R. K. Varma',
      officerRole: 'Ward Field Engineer',
      department: 'GHMC Municipal Road Division',
      severity,
      status: 'PENDING',
      slaHoursRemaining: 48.0,
      imageUrl:
        type === 'NO_HELMET'
          ? 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80'
          : type === 'GARBAGE'
          ? 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=600&q=80'
          : 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
      vehiclePlate: plate,
      fineAmount: fine,
    };

    setTickets((prev) => [newTicket, ...prev].slice(0, 20));

    // Append to live logs (cap at 20)
    const newLog: AuditLogEvent = {
      id: `log-${Date.now()}`,
      title: `Ticket #${newTicketId} Generated`,
      desc: `${title} • Reported by Bus ${reportingBus.id}`,
      time: timeStr,
      tag: type === 'NO_HELMET' ? 'VIOLATION' : 'HAZARD',
      tagColor: type === 'NO_HELMET' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-red-50 text-red-600 border-red-200',
    };

    setLogs((prev) => [newLog, ...prev].slice(0, 20));
  };

  const updateTicketStatus = (ticketId: string, newStatus: TicketItem['status']) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
    );
  };

  return (
    <SimulationStoreContext.Provider
      value={{
        buses,
        activeMapAlert,
        tickets,
        logs,
        updateTicketStatus,
        triggerManualIncident,
      }}
    >
      {children}
    </SimulationStoreContext.Provider>
  );
};

export const useSimulationStore = () => {
  const context = useContext(SimulationStoreContext);
  if (!context) {
    throw new Error('useSimulationStore must be used within SimulationStoreProvider');
  }
  return context;
};
