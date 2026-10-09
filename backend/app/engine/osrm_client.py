import urllib.request
import json
import logging
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

class OSRMClient:
    """
    Client for Open Source Routing Machine (OSRM) public API.
    Computes real turn-by-turn driving paths and exact road geometry
    on actual OpenStreetMap street networks with zero API keys.
    """
    BASE_URL = "http://router.project-osrm.org/route/v1/driving"

    @classmethod
    def get_route(
        cls,
        start_lat: float,
        start_lng: float,
        end_lat: float,
        end_lng: float,
        waypoints: Optional[List[Tuple[float, float]]] = None
    ) -> Optional[Dict]:
        """
        Coordinates format for OSRM URL: {lng},{lat};{lng},{lat}
        Returns dictionary with:
        - coords: list of [lat, lng] for Leaflet polyline
        - distance_m: driving distance in meters
        - duration_s: driving duration in seconds
        - steps: list of real turn maneuvers
        """
        try:
            # Build coordinate string: lon,lat;lon,lat
            pts = [f"{start_lng:.6f},{start_lat:.6f}"]
            if waypoints:
                for wlat, wlng in waypoints:
                    pts.append(f"{wlng:.6f},{wlat:.6f}")
            pts.append(f"{end_lng:.6f},{end_lat:.6f}")

            coords_str = ";".join(pts)
            url = f"{cls.BASE_URL}/{coords_str}?overview=full&geometries=geojson&steps=true"

            req = urllib.request.Request(
                url,
                headers={"User-Agent": "WayMaker-SmartRouting/1.0"}
            )
            with urllib.request.urlopen(req, timeout=5) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode())
                    if data.get("routes") and len(data["routes"]) > 0:
                        route = data["routes"][0]
                        # Convert [lon, lat] geojson coords to Leaflet [lat, lon]
                        geojson_coords = route["geometry"]["coordinates"]
                        leaflet_coords = [[pt[1], pt[0]] for pt in geojson_coords]

                        # Extract step maneuvers
                        maneuvers = []
                        legs = route.get("legs", [])
                        for leg in legs:
                            for step in leg.get("steps", []):
                                name = step.get("name", "")
                                modifier = step.get("maneuver", {}).get("modifier", "")
                                mtype = step.get("maneuver", {}).get("type", "")
                                dist = step.get("distance", 0)
                                if name or mtype != "depart":
                                    instruction = f"{mtype.capitalize()} {modifier} onto {name if name else 'connecting street'} ({int(dist)}m)"
                                    maneuvers.append(instruction)

                        return {
                            "coords": leaflet_coords,
                            "distance_m": round(route.get("distance", 0.0), 1),
                            "duration_s": round(route.get("duration", 0.0), 1),
                            "steps": maneuvers[:6]
                        }
        except Exception as e:
            logger.warning(f"OSRM real routing fallback to local graph: {e}")
            return None
        return None
