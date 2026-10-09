from typing import Dict, List, Optional
from ..models.schemas import TrafficSignal

class SignalCoordinator:
    def __init__(self, nodes_data: Dict[str, Dict]):
        self.signals: Dict[str, TrafficSignal] = {}
        self._init_signals(nodes_data)

    def _init_signals(self, nodes_data: Dict[str, Dict]):
        # Intersections that have monitored smart controllers along the corridors
        signal_nodes = [
            ("SIG_BANJARA", "N_BANJARA_RD1", "Banjara Hills Rd 1"),
            ("SIG_5TH_48", "N_5TH_48", "5th Ave & Banjara West"),
            ("SIG_5TH_45", "N_5TH_45", "5th Ave & Hazard Junction"),
            ("SIG_5TH_42", "N_5TH_42", "5th Ave & Somajiguda"),
            ("SIG_6TH_48", "N_6TH_48", "Somajiguda Bypass South"),
            ("SIG_6TH_45", "N_6TH_45", "Somajiguda Main Corridor"),
            ("SIG_6TH_42", "N_6TH_42", "Somajiguda North Link"),
            ("SIG_7TH_48", "N_7TH_48", "Khairatabad Outer"),
            ("SIG_7TH_45", "N_7TH_45", "Khairatabad Junction"),
            ("SIG_7TH_42", "N_7TH_42", "Necklace Rd Promenade"),
            ("SIG_LAKE", "N_LAKE_SHORE", "Hussain Sagar Lake Shore"),
            ("SIG_BEGUMPET", "N_BEGUMPET_CROSS", "Begumpet Junction"),
        ]

        for sig_id, node_key, name in signal_nodes:
            ndata = nodes_data.get(node_key, {})
            self.signals[sig_id] = TrafficSignal(
                id=sig_id,
                intersection_name=name,
                latitude=ndata.get("lat", 17.42),
                longitude=ndata.get("lng", 78.45),
                current_state="GREEN_NS",
                ambulance_approaching=False,
                time_to_arrival_s=None,
                planned_state="GREEN_NS",
                coordination_status="NORMAL",
                min_green_time_s=5,
                last_transition_time="10:15:00"
            )

    def update_coordination(self, active_route_nodes: List[str], current_ambulance_lat: float, current_ambulance_lng: float, speed_kmh: float):
        speed_ms = max(speed_kmh * 1000.0 / 3600.0, 5.0)

        for sig in self.signals.values():
            matching_node = None
            for node_id in active_route_nodes:
                if node_id in sig.id or sig.id.replace("SIG_", "N_") in node_id or node_id.replace("N_", "") in sig.id:
                    matching_node = node_id
                    break

            if not matching_node:
                sig.ambulance_approaching = False
                sig.time_to_arrival_s = None
                sig.coordination_status = "NORMAL"
                continue

            dlat = (sig.latitude - current_ambulance_lat) * 111000
            dlng = (sig.longitude - current_ambulance_lng) * 85000
            dist_m = (dlat**2 + dlng**2)**0.5
            eta_s = dist_m / speed_ms

            if dist_m < 1200 and eta_s < 90:
                sig.ambulance_approaching = True
                sig.time_to_arrival_s = round(eta_s, 1)

                if eta_s < 45:
                    sig.coordination_status = "GREEN_WAVE_ACTIVE"
                    sig.current_state = "EMERGENCY_PREEMPT"
                    sig.planned_state = "EMERGENCY_PREEMPT"
                else:
                    sig.coordination_status = "PREEMPTION_REQUESTED"
                    sig.planned_state = "EMERGENCY_PREEMPT"
                    sig.current_state = "YELLOW"
            elif dist_m < 50:
                sig.coordination_status = "NORMAL"
                sig.ambulance_approaching = False
                sig.time_to_arrival_s = None
                sig.current_state = "GREEN_NS"
            else:
                sig.ambulance_approaching = False
                sig.time_to_arrival_s = None
                sig.coordination_status = "NORMAL"

    def get_signals_list(self) -> List[TrafficSignal]:
        return list(self.signals.values())

    def reset(self, nodes_data: Dict[str, Dict]):
        self.signals.clear()
        self._init_signals(nodes_data)
