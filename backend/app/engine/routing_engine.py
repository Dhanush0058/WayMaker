from typing import List, Dict, Optional, Tuple
import time
from .road_network import RoadNetwork
from ..models.schemas import AmbulanceRoute

class RoutingEngine:
    def __init__(self, road_network: RoadNetwork):
        self.rn = road_network

    def compute_route(
        self,
        start_node: str,
        target_node: str,
        ambulance_id: str = "AMB-01",
        reason: str = "Initial optimal dispatch path"
    ) -> AmbulanceRoute:
        t_start = time.perf_counter()
        
        # Primary path finding
        path_nodes, travel_time_s, segments = self.rn.find_shortest_path(start_node, target_node)
        calc_ms = (time.perf_counter() - t_start) * 1000.0

        # Extract coordinates
        route_coords: List[List[float]] = []
        total_dist_m = 0.0
        for node in path_nodes:
            ndata = self.rn.nodes_data.get(node)
            if ndata:
                route_coords.append([ndata["lat"], ndata["lng"]])
        
        for seg in segments:
            total_dist_m += seg.get("length_m", 0.0)

        # Baseline calculation: what would it be along the historical default (5th Ave corridor)?
        # 5th Ave corridor: HOSPITAL -> N_5TH_54 -> N_5TH_50 -> N_5TH_48 -> N_5TH_45 -> N_5TH_42 -> N_5TH_38 -> PATIENT
        baseline_time_s = 900.0  # Default 15 minutes when blocked/heavily congested

        # Compute alternative route (e.g., secondary backup path avoiding primary chosen nodes)
        alt_coords: List[List[float]] = []
        if len(path_nodes) > 2:
            # Temporarily penalize intermediate node or edges to find next best path
            alt_path, alt_time, _ = self._find_alternate_path(start_node, target_node, path_nodes)
            for node in alt_path:
                ndata = self.rn.nodes_data.get(node)
                if ndata:
                    alt_coords.append([ndata["lat"], ndata["lng"]])

        start_lat = self.rn.nodes_data[start_node]["lat"] if start_node in self.rn.nodes_data else 40.7620
        start_lng = self.rn.nodes_data[start_node]["lng"] if start_node in self.rn.nodes_data else -73.9780

        route = AmbulanceRoute(
            ambulance_id=ambulance_id,
            hospital_name=self.rn.nodes_data.get(start_node, {}).get("name", "Metro General Hospital"),
            patient_name=self.rn.nodes_data.get(target_node, {}).get("name", "Downtown Plaza"),
            status="EN_ROUTE",
            current_node=start_node,
            target_node=target_node,
            current_route_nodes=path_nodes,
            current_route_coords=route_coords,
            alternative_route_coords=alt_coords,
            original_eta_s=baseline_time_s,
            updated_eta_s=round(travel_time_s, 1),
            route_distance_m=round(total_dist_m, 1),
            reroute_reason=reason,
            current_lat=start_lat,
            current_lng=start_lng,
            speed_kmh=52.0
        )
        return route

    def _find_alternate_path(self, start: str, end: str, exclude_nodes: List[str]) -> Tuple[List[str], float, List[Dict]]:
        # Temporarily increase edge weights along existing path
        orig_weights = {}
        for i in range(len(exclude_nodes) - 1):
            u, v = exclude_nodes[i], exclude_nodes[i+1]
            if self.rn.graph.has_edge(u, v):
                orig_weights[(u, v)] = self.rn.graph[u][v].get("traversal_cost", 10.0)
                self.rn.graph[u][v]["traversal_cost"] = orig_weights[(u, v)] * 10.0

        alt_path, alt_time, alt_segs = self.rn.find_shortest_path(start, end)

        # Restore weights
        for (u, v), w in orig_weights.items():
            if self.rn.graph.has_edge(u, v):
                self.rn.graph[u][v]["traversal_cost"] = w

        return alt_path, alt_time, alt_segs
