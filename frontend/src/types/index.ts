export interface VehicleEvent {
  vehicle_id: string;
  latitude: float;
  longitude: float;
  speed: number;
  timestamp: string;
  road_segment_id: string;
  vehicle_type: 'bus' | 'ambulance' | 'car';
  heading: number;
  status: 'normal' | 'slow' | 'stopped' | 'emergency';
  detected_anomaly?: string | null;
}

export type float = number;

export interface HazardEvidence {
  timestamp: string;
  source: string;
  description: string;
  confidence_delta: number;
}

export interface Hazard {
  id: string;
  category: 'water_main_break' | 'traffic_collision' | 'debris' | 'congestion';
  road_segment_id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  status: 'unverified' | 'probable' | 'confirmed';
  detection_time: string;
  verified_time?: string;
  description: string;
  evidence_list: HazardEvidence[];
  is_active: boolean;
}

export interface RoadSegment {
  id: string;
  name: string;
  from_node: string;
  to_node: string;
  length_m: number;
  speed_limit_kmh: number;
  current_speed_kmh: number;
  congestion_level: number;
  hazard_status: 'clear' | 'probable_hazard' | 'blocked';
  traversal_cost: number;
  coords: [number, number][];
}

export interface TrafficSignal {
  id: string;
  intersection_name: string;
  latitude: number;
  longitude: number;
  current_state: 'GREEN_NS' | 'GREEN_EW' | 'YELLOW' | 'RED_ALL' | 'EMERGENCY_PREEMPT';
  ambulance_approaching: boolean;
  time_to_arrival_s: number | null;
  planned_state: string;
  coordination_status: 'NORMAL' | 'PREEMPTION_REQUESTED' | 'GREEN_WAVE_ACTIVE';
  min_green_time_s: number;
  last_transition_time: string;
}

export interface AmbulanceRoute {
  ambulance_id: string;
  hospital_name: string;
  patient_name: string;
  status: 'IDLE' | 'EN_ROUTE' | 'ARRIVED';
  current_node: string;
  target_node: string;
  current_route_nodes: string[];
  current_route_coords: [number, number][];
  alternative_route_coords: [number, number][];
  original_route_coords: [number, number][];
  original_eta_s: number;
  updated_eta_s: number;
  route_distance_m: number;
  reroute_reason: string;
  reroute_count: number;
  current_step_index: number;
  current_lat: number;
  current_lng: number;
  speed_kmh: number;
  turn_steps?: string[];
  is_real_osrm?: boolean;
}

export interface DashboardSummary {
  active_ambulances: number;
  reporting_buses: number;
  active_hazards: number;
  signals_monitored: number;
  estimated_ambulance_arrival: string;
  time_saved_str: string;
  system_status: string;
  simulation_time: string;
  simulation_state: 'IDLE' | 'RUNNING' | 'PAUSED';
}

export interface SimulationMetrics {
  hazard_detection_latency_s: number;
  false_positive_rate: number;
  route_calc_time_ms: number;
  travel_time_baseline_s: number;
  travel_time_optimized_s: number;
  reroute_count: number;
  emergency_response_time_s: number;
}

export interface SimEvent {
  id: string;
  time: string;
  category: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'danger' | 'success';
  timestamp: number;
}

export interface SnapshotData {
  summary: DashboardSummary;
  vehicles: VehicleEvent[];
  hazards: Hazard[];
  ambulance: AmbulanceRoute;
  signals: TrafficSignal[];
  segments: RoadSegment[];
  events: SimEvent[];
  metrics: SimulationMetrics;
  nodes: Record<string, { name: string; lat: number; lng: number; type: string }>;
}
