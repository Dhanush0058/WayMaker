from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class VehicleEvent(BaseModel):
    vehicle_id: str
    latitude: float
    longitude: float
    speed: float  # km/h
    timestamp: str
    road_segment_id: str
    vehicle_type: str = "bus"  # "bus", "ambulance", "car"
    heading: float = 0.0
    status: str = "normal"  # "normal", "slow", "stopped", "emergency"
    detected_anomaly: Optional[str] = None

class HazardEvidence(BaseModel):
    timestamp: str
    source: str  # "bus_telemetry", "speed_anomaly", "multi_vehicle", "camera", "sensor"
    description: str
    confidence_delta: float

class Hazard(BaseModel):
    id: str
    category: str  # "water_main_break", "traffic_collision", "debris", "congestion"
    road_segment_id: str
    location_name: str
    latitude: float
    longitude: float
    severity: str  # "low", "medium", "high", "critical"
    confidence: float = 0.0  # 0.0 to 1.0
    status: str = "unverified"  # "unverified", "probable", "confirmed"
    detection_time: str
    verified_time: Optional[str] = None
    description: str
    evidence_list: List[HazardEvidence] = []
    is_active: bool = True

class RoadSegment(BaseModel):
    id: str
    name: str
    from_node: str
    to_node: str
    length_m: float
    speed_limit_kmh: float = 50.0
    current_speed_kmh: float = 50.0
    congestion_level: float = 0.1  # 0.0 to 1.0
    hazard_status: str = "clear"  # "clear", "probable_hazard", "blocked"
    traversal_cost: float = 0.0
    coordinates: List[List[float]] = []  # [[lat, lng], ...]

class TrafficSignal(BaseModel):
    id: str
    intersection_name: str
    latitude: float
    longitude: float
    current_state: str = "GREEN_NS"  # "GREEN_NS", "GREEN_EW", "YELLOW", "RED_ALL", "EMERGENCY_PREEMPT"
    ambulance_approaching: bool = False
    time_to_arrival_s: Optional[float] = None
    planned_state: str = "GREEN_NS"
    coordination_status: str = "NORMAL"  # "NORMAL", "PREEMPTION_REQUESTED", "GREEN_WAVE_ACTIVE"
    min_green_time_s: int = 5
    last_transition_time: str = ""

class RouteStep(BaseModel):
    node_id: str
    road_segment_id: Optional[str] = None
    latitude: float
    longitude: float
    name: str
    expected_travel_time_s: float = 0.0

class AmbulanceRoute(BaseModel):
    ambulance_id: str = "AMB-01"
    hospital_name: str = "Metro General Hospital"
    patient_name: str = "Downtown Plaza (Trauma Incident)"
    status: str = "IDLE"  # "IDLE", "EN_ROUTE", "ARRIVED"
    current_node: str
    target_node: str
    current_route_nodes: List[str] = []
    current_route_coords: List[List[float]] = []
    alternative_route_coords: List[List[float]] = []
    original_route_coords: List[List[float]] = []
    original_eta_s: float = 900.0  # 15 minutes = 900s
    updated_eta_s: float = 240.0   # 4 minutes = 240s
    route_distance_m: float = 0.0
    reroute_reason: str = "Initial optimal dispatch path"
    reroute_count: int = 0
    current_step_index: int = 0
    current_lat: float = 0.0
    current_lng: float = 0.0
    speed_kmh: float = 55.0
    turn_steps: List[str] = []
    is_real_osrm: bool = True

class DashboardSummary(BaseModel):
    active_ambulances: int
    reporting_buses: int
    active_hazards: int
    signals_monitored: int
    estimated_ambulance_arrival: str
    time_saved_str: str
    system_status: str
    simulation_time: str
    simulation_state: str  # "IDLE", "RUNNING", "PAUSED"

class SimulationMetrics(BaseModel):
    hazard_detection_latency_s: float = 1.8
    false_positive_rate: float = 0.0
    route_calc_time_ms: float = 8.4
    travel_time_baseline_s: float = 900.0  # 15 minutes
    travel_time_optimized_s: float = 240.0  # 4 minutes
    reroute_count: int = 0
    emergency_response_time_s: float = 240.0

class SimulationControlRequest(BaseModel):
    action: str  # "start", "pause", "reset", "water_main_break", "false_alarm", "secondary_accident", "dispatch"
    params: Optional[Dict[str, Any]] = None

class HazardVerifyRequest(BaseModel):
    status: str  # "unverified", "probable", "confirmed"
    confidence_override: Optional[float] = None
