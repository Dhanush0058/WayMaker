import time
from typing import Dict, List, Optional, Tuple
from ..models.schemas import Hazard, HazardEvidence, VehicleEvent

class HazardEngine:
    def __init__(self):
        self.hazards: Dict[str, Hazard] = {}
        # Known designated transit stops and signal wait zones (lat, lng, radius_m)
        self.bus_stops = [
            {"name": "5th Ave & 52nd St Bus Stop", "lat": 40.7595, "lng": -73.9760, "radius_m": 45},
            {"name": "6th Ave & 46th St Bus Stop", "lat": 40.7565, "lng": -73.9830, "radius_m": 45},
            {"name": "7th Ave & 43rd St Plaza Stop", "lat": 40.7558, "lng": -73.9875, "radius_m": 45},
        ]
        # Track vehicle stationary timers {vehicle_id: (start_timestamp, lat, lng, road_seg)}
        self.stationary_trackers: Dict[str, Dict] = {}
        # Thresholds
        self.PROBABLE_THRESHOLD = 0.45
        self.CONFIRMED_THRESHOLD = 0.75

    def is_near_bus_stop(self, lat: float, lng: float) -> Tuple[bool, Optional[str]]:
        for stop in self.bus_stops:
            # Simple euclidean distance approx in meters
            dlat = (lat - stop["lat"]) * 111000
            dlng = (lng - stop["lng"]) * 85000
            dist = (dlat**2 + dlng**2)**0.5
            if dist <= stop["radius_m"]:
                return True, stop["name"]
        return False, None

    def process_telemetry(self, event: VehicleEvent) -> Optional[Dict]:
        """
        Processes single telemetry reading.
        Returns detection result dict or None.
        """
        vid = event.vehicle_id
        is_bus_stop, stop_name = self.is_near_bus_stop(event.latitude, event.longitude)

        # Normal moving vehicle
        if event.speed > 5.0:
            if vid in self.stationary_trackers:
                del self.stationary_trackers[vid]
            return None

        # Vehicle is stationary or near 0
        now_ts = event.timestamp
        if vid not in self.stationary_trackers:
            self.stationary_trackers[vid] = {
                "start_time": time.time(),
                "timestamp_str": now_ts,
                "lat": event.latitude,
                "lng": event.longitude,
                "road_segment_id": event.road_segment_id,
                "is_bus_stop": is_bus_stop,
                "stop_name": stop_name
            }
            return None

        tracker = self.stationary_trackers[vid]
        duration = time.time() - tracker["start_time"]

        # If it's a designated bus stop and stopped for brief period (< 30s) -> False Alarm filtering
        if is_bus_stop and duration < 25.0:
            return {
                "type": "NORMAL_BUS_STOP",
                "message": f"{vid} stopped at scheduled transit stop ({stop_name}) for boarding ({duration:.1f}s)",
                "is_hazard": False
            }

        # Mid-block stop or extended stop (> 5s in demo simulation)
        return {
            "type": "ANOMALY_STATIONARY",
            "duration": duration,
            "vehicle_id": vid,
            "road_segment_id": event.road_segment_id,
            "lat": event.latitude,
            "lng": event.longitude,
            "is_bus_stop": is_bus_stop
        }

    def register_or_update_hazard(
        self,
        hazard_id: str,
        category: str,
        road_segment_id: str,
        location_name: str,
        lat: float,
        lng: float,
        severity: str,
        evidence: HazardEvidence,
        description: str
    ) -> Hazard:
        if hazard_id not in self.hazards:
            hazard = Hazard(
                id=hazard_id,
                category=category,
                road_segment_id=road_segment_id,
                location_name=location_name,
                latitude=lat,
                longitude=lng,
                severity=severity,
                confidence=round(min(1.0, max(0.0, evidence.confidence_delta)), 2),
                status="unverified",
                detection_time=evidence.timestamp,
                description=description,
                evidence_list=[evidence],
                is_active=True
            )
            self._update_status(hazard)
            self.hazards[hazard_id] = hazard
            return hazard
        else:
            hazard = self.hazards[hazard_id]
            hazard.evidence_list.append(evidence)
            hazard.confidence = round(min(1.0, max(0.0, hazard.confidence + evidence.confidence_delta)), 2)
            self._update_status(hazard)
            return hazard

    def _update_status(self, hazard: Hazard):
        if hazard.confidence >= self.CONFIRMED_THRESHOLD:
            hazard.status = "confirmed"
        elif hazard.confidence >= self.PROBABLE_THRESHOLD:
            hazard.status = "probable"
        else:
            hazard.status = "unverified"

    def manually_verify(self, hazard_id: str, new_status: str, confidence_override: Optional[float] = None) -> Optional[Hazard]:
        if hazard_id in self.hazards:
            hazard = self.hazards[hazard_id]
            hazard.status = new_status
            if confidence_override is not None:
                hazard.confidence = confidence_override
            elif new_status == "confirmed":
                hazard.confidence = max(hazard.confidence, 0.95)
            elif new_status == "probable":
                hazard.confidence = 0.60
            elif new_status == "unverified":
                hazard.confidence = 0.30
            return hazard
        return None

    def clear_hazard(self, hazard_id: str):
        if hazard_id in self.hazards:
            self.hazards[hazard_id].is_active = False

    def get_active_hazards(self) -> List[Hazard]:
        return [h for h in self.hazards.values() if h.is_active]

    def reset(self):
        self.hazards.clear()
        self.stationary_trackers.clear()
