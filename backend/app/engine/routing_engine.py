from typing import List, Dict, Optional, Tuple
import time
from .road_network import RoadNetwork
from .osrm_client import OSRMClient
from ..models.schemas import AmbulanceRoute

class RoutingEngine:
    def __init__(self, road_network: RoadNetwork):
        self.rn = road_network

    def compute_route(
        self,
        start_node: str,
        target_node: str,
        ambulance_id: str = "Ambulance A-17",
        reason: str = "Initial optimal dispatch path"
    ) -> AmbulanceRoute:
        t_start = time.perf_counter()
        
        # 1. Primary path finding on NetworkX graph
        path_nodes, travel_time_s, segments = self.rn.find_shortest_path(start_node, target_node)
        calc_ms = (time.perf_counter() - t_start) * 1000.0

        # Extract coordinates from graph nodes
        graph_coords: List[List[float]] = []
        total_dist_m = 0.0
        for node in path_nodes:
            ndata = self.rn.nodes_data.get(node)
            if ndata:
                graph_coords.append([ndata["lat"], ndata["lng"]])
        
        for seg in segments:
            total_dist_m += seg.get("length_m", 0.0)

        start_lat = self.rn.nodes_data[start_node]["lat"] if start_node in self.rn.nodes_data else 17.4080
        start_lng = self.rn.nodes_data[start_node]["lng"] if start_node in self.rn.nodes_data else 78.4230
        target_lat = self.rn.nodes_data[target_node]["lat"] if target_node in self.rn.nodes_data else 17.4370
        target_lng = self.rn.nodes_data[target_node]["lng"] if target_node in self.rn.nodes_data else 78.4720

        # 2. Query real-world OpenStreetMap via OSRM Client
        # Extract intermediate waypoints from the chosen path
        intermediate_waypoints = []
        if len(path_nodes) > 2:
            for mid in path_nodes[1:-1]:
                mdata = self.rn.nodes_data.get(mid)
                if mdata:
                    intermediate_waypoints.append((mdata["lat"], mdata["lng"]))

        real_osrm = OSRMClient.get_route(start_lat, start_lng, target_lat, target_lng, waypoints=intermediate_waypoints)
        
        final_coords = graph_coords
        final_distance = total_dist_m
        turn_maneuvers = [
            "Depart Mehdipatnam Dispatch Hub toward Banjara Hills Rd 1 (450m)",
            "Continue onto Somajiguda West Bypass (1200m)",
            "Maintain green-wave clearance across Raj Bhavan corridor (800m)",
            "Proceed along Hussain Sagar North Shoreline (1100m)",
            "Arrive at City General Hospital Emergency Bay (650m)"
        ]
        is_real = False

        if real_osrm and len(real_osrm["coords"]) > 5:
            final_coords = real_osrm["coords"]
            final_distance = real_osrm["distance_m"]
            if real_osrm.get("steps") and len(real_osrm["steps"]) > 0:
                turn_maneuvers = real_osrm["steps"]
            is_real = True

        # Compute alternative route
        alt_coords: List[List[float]] = []
        if len(path_nodes) > 2:
            alt_path, _, _ = self._find_alternate_path(start_node, target_node, path_nodes)
            for node in alt_path:
                ndata = self.rn.nodes_data.get(node)
                if ndata:
                    alt_coords.append([ndata["lat"], ndata["lng"]])

        route = AmbulanceRoute(
            ambulance_id=ambulance_id,
            hospital_name=self.rn.nodes_data.get(target_node, {}).get("name", "City General Hospital"),
            patient_name=self.rn.nodes_data.get(start_node, {}).get("name", "Mehdipatnam Incident"),
            status="EN_ROUTE",
            current_node=start_node,
            target_node=target_node,
            current_route_nodes=path_nodes,
            current_route_coords=final_coords,
            alternative_route_coords=alt_coords,
            original_eta_s=720.0,
            updated_eta_s=480.0,
            route_distance_m=round(final_distance, 1),
            reroute_reason=reason,
            current_lat=start_lat,
            current_lng=start_lng,
            speed_kmh=52.0,
            turn_steps=turn_maneuvers,
            is_real_osrm=is_real
        )
        return route

    def _find_alternate_path(self, start: str, end: str, exclude_nodes: List[str]) -> Tuple[List[str], float, List[Dict]]:
        orig_weights = {}
        for i in range(len(exclude_nodes) - 1):
            u, v = exclude_nodes[i], exclude_nodes[i+1]
            if self.rn.graph.has_edge(u, v):
                orig_weights[(u, v)] = self.rn.graph[u][v].get("traversal_cost", 10.0)
                self.rn.graph[u][v]["traversal_cost"] = orig_weights[(u, v)] * 10.0

        alt_path, alt_time, alt_segs = self.rn.find_shortest_path(start, end)

        for (u, v), w in orig_weights.items():
            if self.rn.graph.has_edge(u, v):
                self.rn.graph[u][v]["traversal_cost"] = w

        return alt_path, alt_time, alt_segs
