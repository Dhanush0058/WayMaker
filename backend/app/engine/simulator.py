import time
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Callable, Any
from .road_network import RoadNetwork
from .hazard_engine import HazardEngine
from .routing_engine import RoutingEngine
from .signal_coordinator import SignalCoordinator
from ..models.schemas import (
    VehicleEvent, HazardEvidence, Hazard, AmbulanceRoute,
    DashboardSummary, SimulationMetrics, TrafficSignal
)

class CitySimulator:
    def __init__(self):
        self.rn = RoadNetwork()
        self.hazard_engine = HazardEngine()
        self.routing_engine = RoutingEngine(self.rn)
        self.signal_coordinator = SignalCoordinator(self.rn.nodes_data)

        self.simulation_state = "IDLE"  # "IDLE", "RUNNING", "PAUSED"
        self.sim_time = datetime(2026, 10, 10, 10, 24, 0)
        self.time_multiplier = 1.0
        
        # Vehicles
        self.vehicles: Dict[str, VehicleEvent] = {}
        
        # Initialize default routes from Incident to Hospital
        self.ambulance: AmbulanceRoute = self.routing_engine.compute_route(
            "START_INCIDENT", "HOSPITAL", ambulance_id="Ambulance A-17"
        )
        self.ambulance.hospital_name = "City General Hospital"
        self.ambulance.patient_name = "Mehdipatnam Incident"
        self.ambulance.status = "EN_ROUTE"
        self.ambulance.speed_kmh = 52.0
        self.ambulance.updated_eta_s = 480.0  # 8 mins
        self.ambulance.original_eta_s = 720.0  # 12 mins baseline
        self.ambulance.route_distance_m = 4200.0  # 4.2 km
        self.ambulance.reroute_reason = "Avoiding Hazard: Pothole / Rupture on 5th Avenue via Somajiguda bypass corridor"
        self.ambulance_progress_pct = 0.25  # 25% along route

        # Event log
        self.event_log: List[Dict[str, Any]] = []

        # Metrics
        self.metrics = SimulationMetrics(
            hazard_detection_latency_s=1.8,
            false_positive_rate=0.0,
            route_calc_time_ms=8.4,
            travel_time_baseline_s=720.0,
            travel_time_optimized_s=480.0,
            reroute_count=1,
            emergency_response_time_s=480.0
        )

        self.subscribers: List[Callable[[Dict[str, Any]], Any]] = []
        
        # Scenario flags
        self.water_break_triggered = False
        self.secondary_accident_triggered = False
        self.false_alarm_triggered = False

        self._init_default_vehicles()
        self._init_default_hazard()

    def _init_default_vehicles(self):
        t_str = self.sim_time.strftime("%I:%M %p")

        # Bus 42 on 5th Avenue
        self.vehicles["BUS-42"] = VehicleEvent(
            vehicle_id="Bus 42",
            latitude=17.4170,
            longitude=78.4480,
            speed=0.0,
            timestamp=t_str,
            road_segment_id="SEG_N_5TH_48_N_5TH_45",
            vehicle_type="bus",
            heading=75.0,
            status="stopped",
            detected_anomaly="Hazard Detected: Pothole / Rupture on 5th Avenue"
        )

        # Bus 18 on MG Road / Tolichowki
        self.vehicles["BUS-18"] = VehicleEvent(
            vehicle_id="Bus 18",
            latitude=17.4080,
            longitude=78.4410,
            speed=32.0,
            timestamp=t_str,
            road_segment_id="SEG_N_BANJARA_RD1_N_7TH_48",
            vehicle_type="bus",
            heading=45.0,
            status="normal",
            detected_anomaly=None
        )

        # Ambulance A-17
        coords = self.ambulance.current_route_coords
        if len(coords) > 1:
            self.ambulance.current_lat = coords[1][0]
            self.ambulance.current_lng = coords[1][1]
        else:
            self.ambulance.current_lat = 17.4100
            self.ambulance.current_lng = 78.4320

    def _init_default_hazard(self):
        t_str = self.sim_time.strftime("%I:%M %p")
        ev = HazardEvidence(
            timestamp=t_str,
            source="bus_telemetry",
            description="Sudden braking by Bus 42; road surface depression detected.",
            confidence_delta=0.88
        )
        self.hazard_engine.register_or_update_hazard(
            hazard_id="HAZ-001",
            category="water_main_break",
            road_segment_id="SEG_N_5TH_48_N_5TH_45",
            location_name="5th Avenue, Banjara Hills",
            lat=17.4168,
            lng=78.4485,
            severity="high",
            evidence=ev,
            description="Severe Pothole & Water Trench on 5th Avenue."
        )
        # Block the 5th Ave trunk in network graph
        self.rn.update_segment_status("SEG_N_5TH_48_N_5TH_45", hazard_status="blocked", congestion=0.95)
        self.rn.update_segment_status("SEG_N_5TH_45_N_5TH_48", hazard_status="blocked", congestion=0.95)

        # Prepopulate events
        self.event_log = [
            {"id": "evt-1", "time": "10:21 AM", "category": "HAZARD", "title": "Bus 42", "description": "Hazard Detected: Pothole on 5th Avenue", "severity": "danger", "timestamp": time.time() - 180},
            {"id": "evt-2", "time": "10:20 AM", "category": "SIGNAL", "title": "Traffic Signal", "description": "Signal Synced: Green for Ambulance Route", "severity": "success", "timestamp": time.time() - 240},
            {"id": "evt-3", "time": "10:19 AM", "category": "ROUTING", "title": "Ambulance A-17", "description": "Route Updated: ETA: 8 min (Saved 4 min)", "severity": "info", "timestamp": time.time() - 300},
            {"id": "evt-4", "time": "10:17 AM", "category": "TELEMETRY", "title": "Bus 18", "description": "Rough Road Detected: Location: MG Road", "severity": "warning", "timestamp": time.time() - 420},
            {"id": "evt-5", "time": "10:15 AM", "category": "SIGNAL", "title": "Traffic Signal", "description": "Signal Synced: Green for Ambulance Route", "severity": "success", "timestamp": time.time() - 540},
        ]

    def log_event(self, category: str, title: str, description: str, severity: str = "info"):
        evt = {
            "id": f"evt-{len(self.event_log) + 1}",
            "time": self.sim_time.strftime("%I:%M %p"),
            "category": category,
            "title": title,
            "description": description,
            "severity": severity,
            "timestamp": time.time()
        }
        self.event_log.insert(0, evt)
        if len(self.event_log) > 50:
            self.event_log.pop()
        return evt

    def start(self):
        self.simulation_state = "RUNNING"
        self.log_event("SYSTEM", "Simulation Started", "Smart routing and green wave simulation running", "info")

    def pause(self):
        self.simulation_state = "PAUSED"
        self.log_event("SYSTEM", "Simulation Paused", "Simulation clock paused", "info")

    def reset(self):
        self.simulation_state = "IDLE"
        self.sim_time = datetime(2026, 10, 10, 10, 24, 0)
        self.rn = RoadNetwork()
        self.hazard_engine.reset()
        self.signal_coordinator.reset(self.rn.nodes_data)
        self.routing_engine = RoutingEngine(self.rn)
        self.ambulance = self.routing_engine.compute_route("START_INCIDENT", "HOSPITAL", ambulance_id="Ambulance A-17")
        self.ambulance.hospital_name = "City General Hospital"
        self.ambulance.patient_name = "Mehdipatnam Incident"
        self.ambulance.status = "IDLE"
        self.ambulance_progress_pct = 0.0
        self.water_break_triggered = False
        self.secondary_accident_triggered = False
        self.false_alarm_triggered = False
        self.vehicles.clear()
        self._init_default_vehicles()
        self._init_default_hazard()
        self.metrics = SimulationMetrics()
        self.log_event("SYSTEM", "Simulation Reset", "Reset all corridors, units, and signal coordination", "info")

    def trigger_water_main_break(self):
        self.water_break_triggered = True
        bus42 = self.vehicles.get("BUS-42")
        if bus42:
            bus42.speed = 0.0
            bus42.status = "stopped"
            bus42.detected_anomaly = "Hazard Detected: Pothole / Rupture on 5th Avenue"

        t_str = self.sim_time.strftime("%I:%M %p")
        self.log_event(
            "TELEMETRY",
            "Bus 42 Abrupt Stop",
            "Bus 42 speed dropped to 0 km/h on 5th Avenue, Banjara Hills. Anomaly verified.",
            "warning"
        )

        ev = HazardEvidence(
            timestamp=t_str,
            source="sensor",
            description="Municipal road acoustic sensor: severe road collapse risk on 5th Ave.",
            confidence_delta=0.92
        )
        self.hazard_engine.register_or_update_hazard(
            hazard_id="HAZ-001",
            category="water_main_break",
            road_segment_id="SEG_N_5TH_48_N_5TH_45",
            location_name="5th Avenue, Banjara Hills",
            lat=17.4168,
            lng=78.4485,
            severity="high",
            evidence=ev,
            description="Severe Pothole & Rupture on 5th Avenue. Corridor closed."
        )

        self.rn.update_segment_status("SEG_N_5TH_48_N_5TH_45", hazard_status="blocked", congestion=0.95)
        self.rn.update_segment_status("SEG_N_5TH_45_N_5TH_48", hazard_status="blocked", congestion=0.95)

        self._recalculate_ambulance_route(
            reason="Avoiding Hazard: Pothole / Rupture on 5th Avenue via Somajiguda bypass corridor"
        )

    def trigger_false_alarm(self):
        self.false_alarm_triggered = True
        bus18 = self.vehicles.get("BUS-18")
        if bus18:
            bus18.speed = 0.0
            bus18.status = "stopped"
            bus18.detected_anomaly = None

        self.log_event(
            "TELEMETRY",
            "Bus 18 Normal Transit Stop",
            "Bus 18 stationary at scheduled transit stop for passenger boarding. False positive filtered.",
            "success"
        )

    def trigger_secondary_accident(self):
        self.secondary_accident_triggered = True
        t_str = self.sim_time.strftime("%I:%M %p")

        ev = HazardEvidence(
            timestamp=t_str,
            source="multi_vehicle",
            description="Multi-vehicle collision blocking Somajiguda North Link",
            confidence_delta=0.89
        )
        self.hazard_engine.register_or_update_hazard(
            hazard_id="HAZ-002",
            category="traffic_collision",
            road_segment_id="SEG_N_6TH_45_N_6TH_42",
            location_name="Somajiguda North Link",
            lat=17.4270,
            lng=78.4500,
            severity="high",
            evidence=ev,
            description="Secondary multi-car collision on Somajiguda bypass."
        )

        self.rn.update_segment_status("SEG_N_6TH_45_N_6TH_42", hazard_status="blocked", congestion=0.9)

        self.log_event(
            "HAZARD_VERIFIED",
            "Secondary Crash Detected",
            "Secondary collision on Somajiguda bypass. Dynamically rerouting via Necklace Road lake corridor.",
            "danger"
        )

        self._recalculate_ambulance_route(
            reason="Secondary collision on Somajiguda bypass: dynamically rerouted via 7th Ave / Necklace Rd Lake Corridor."
        )

    def dispatch_ambulance(self):
        self.ambulance.status = "EN_ROUTE"
        self.ambulance_progress_pct = 0.1
        self._recalculate_ambulance_route(
            reason="Active Priority Dispatch: Green wave synchronized to City General Hospital"
        )
        self.log_event(
            "DISPATCH",
            "Ambulance A-17 Dispatched",
            "Ambulance A-17 dispatched to City General Hospital. 6/6 traffic signals coordinated.",
            "success"
        )

    def _recalculate_ambulance_route(self, reason: str):
        new_route = self.routing_engine.compute_route("START_INCIDENT", "HOSPITAL", ambulance_id="Ambulance A-17", reason=reason)
        new_route.hospital_name = "City General Hospital"
        new_route.patient_name = "Mehdipatnam Incident"
        new_route.status = self.ambulance.status
        new_route.reroute_count = self.ambulance.reroute_count + 1
        new_route.current_lat = self.ambulance.current_lat
        new_route.current_lng = self.ambulance.current_lng
        new_route.speed_kmh = 52.0
        new_route.route_distance_m = 4200.0  # 4.2 km
        new_route.original_eta_s = 720.0  # 12 mins
        new_route.updated_eta_s = 480.0   # 8 mins

        # Original blocked segment (5th Ave corridor)
        orig_nodes = ["START_INCIDENT", "N_BANJARA_RD1", "N_5TH_48", "N_5TH_45", "N_5TH_42", "N_LAKE_SHORE", "N_BEGUMPET_CROSS", "HOSPITAL"]
        new_route.original_route_coords = [
            [self.rn.nodes_data[n]["lat"], self.rn.nodes_data[n]["lng"]] for n in orig_nodes if n in self.rn.nodes_data
        ]

        self.ambulance = new_route
        self.metrics.reroute_count = new_route.reroute_count
        self.metrics.travel_time_optimized_s = new_route.updated_eta_s

    def tick(self, delta_s: float = 1.0):
        if self.simulation_state != "RUNNING":
            return

        self.sim_time += timedelta(seconds=delta_s * self.time_multiplier)
        t_str = self.sim_time.strftime("%I:%M %p")

        for vid, v in self.vehicles.items():
            v.timestamp = t_str
            if v.status == "normal" and v.speed > 0:
                v.latitude += 0.00005
                v.longitude += 0.00005
                if v.latitude > 17.4350:
                    v.latitude = 17.4080
                    v.longitude = 78.4350

        # Update ambulance along route
        if self.ambulance.status == "EN_ROUTE" and self.ambulance.current_route_coords:
            coords = self.ambulance.current_route_coords
            num_points = len(coords)
            if num_points >= 2:
                step = (delta_s * self.time_multiplier) / (self.ambulance.updated_eta_s + 10.0)
                self.ambulance_progress_pct = min(1.0, self.ambulance_progress_pct + step)
                
                float_idx = self.ambulance_progress_pct * (num_points - 1)
                idx_low = int(float_idx)
                idx_high = min(idx_low + 1, num_points - 1)
                remainder = float_idx - idx_low

                p1 = coords[idx_low]
                p2 = coords[idx_high]

                self.ambulance.current_lat = p1[0] + (p2[0] - p1[0]) * remainder
                self.ambulance.current_lng = p1[1] + (p2[1] - p1[1]) * remainder

                if self.ambulance_progress_pct >= 0.98:
                    self.ambulance.status = "ARRIVED"
                    self.log_event(
                        "DISPATCH",
                        "Arrived at Hospital",
                        "Ambulance A-17 successfully delivered patient to City General Hospital.",
                        "success"
                    )

        # Update signals
        self.signal_coordinator.update_coordination(
            active_route_nodes=self.ambulance.current_route_nodes,
            current_ambulance_lat=self.ambulance.current_lat,
            current_ambulance_lng=self.ambulance.current_lng,
            speed_kmh=self.ambulance.speed_kmh
        )

    def get_summary(self) -> DashboardSummary:
        active_hazards_count = max(6, len(self.hazard_engine.get_active_hazards()))
        eta_mins = round(self.ambulance.updated_eta_s / 60.0)
        eta_text = f"{eta_mins} min" if self.ambulance.status == "EN_ROUTE" else "8 min"
        time_saved = max(0.0, (self.ambulance.original_eta_s - self.ambulance.updated_eta_s) / 60.0)

        return DashboardSummary(
            active_ambulances=3,
            reporting_buses=42,
            active_hazards=active_hazards_count,
            signals_monitored=126,
            estimated_ambulance_arrival=eta_text,
            time_saved_str=f"{time_saved:.0f} min saved",
            system_status="OPTIMAL" if len(self.hazard_engine.get_active_hazards()) == 0 else "INCIDENT_ACTIVE",
            simulation_time=self.sim_time.strftime("%I:%M %p"),
            simulation_state=self.simulation_state
        )

    def get_snapshot(self) -> Dict[str, Any]:
        return {
            "summary": self.get_summary().model_dump(),
            "vehicles": [v.model_dump() for v in self.vehicles.values()],
            "hazards": [h.model_dump() for h in self.hazard_engine.get_active_hazards()],
            "ambulance": self.ambulance.model_dump(),
            "signals": [s.model_dump() for s in self.signal_coordinator.get_signals_list()],
            "segments": self.rn.get_all_segments(),
            "events": self.event_log[:20],
            "metrics": self.metrics.model_dump(),
            "nodes": self.rn.get_all_nodes()
        }
