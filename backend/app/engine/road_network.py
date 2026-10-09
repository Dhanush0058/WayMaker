import networkx as nx
from typing import Dict, List, Tuple, Optional
import math

class RoadNetwork:
    def __init__(self):
        self.graph = nx.DiGraph()
        self.nodes_data: Dict[str, Dict] = {}
        self.segments_data: Dict[str, Dict] = {}
        self._build_city_grid()

    def _build_city_grid(self):
        # Coordinates aligned with City Operations Map (Banjara Hills, Somajiguda, Hussain Sagar, Begumpet)
        nodes = {
            "START_INCIDENT": {"name": "Mehdipatnam Dispatch Hub", "lat": 17.4020, "lng": 78.4200, "type": "dispatch"},
            "N_BANJARA_RD1": {"name": "Banjara Hills Rd No. 1", "lat": 17.4100, "lng": 78.4320, "type": "intersection"},
            "N_5TH_48": {"name": "5th Ave & Banjara (West)", "lat": 17.4150, "lng": 78.4420, "type": "intersection"},
            "N_5TH_45": {"name": "5th Ave Hazard Junction", "lat": 17.4180, "lng": 78.4490, "type": "intersection"},
            "N_5TH_42": {"name": "5th Ave & Somajiguda Junction", "lat": 17.4210, "lng": 78.4550, "type": "intersection"},
            
            # Alternative bypass via Somajiguda North / Raj Bhavan corridor
            "N_6TH_48": {"name": "Somajiguda Bypass South", "lat": 17.4220, "lng": 78.4380, "type": "intersection"},
            "N_6TH_45": {"name": "Somajiguda Main Corridor", "lat": 17.4260, "lng": 78.4460, "type": "intersection"},
            "N_6TH_42": {"name": "Somajiguda North Link", "lat": 17.4280, "lng": 78.4540, "type": "intersection"},

            # Secondary Corridor (7th Ave / Khairatabad flyover)
            "N_7TH_48": {"name": "Khairatabad Outer 1", "lat": 17.4080, "lng": 78.4550, "type": "intersection"},
            "N_7TH_45": {"name": "Khairatabad Junction", "lat": 17.4140, "lng": 78.4620, "type": "intersection"},
            "N_7TH_42": {"name": "Necklace Rd Lake Shore", "lat": 17.4220, "lng": 78.4680, "type": "intersection"},

            # Lake & Hospital approach
            "N_LAKE_SHORE": {"name": "Hussain Sagar Lake Shore", "lat": 17.4270, "lng": 78.4660, "type": "intersection"},
            "N_BEGUMPET_CROSS": {"name": "Begumpet Flyover Junction", "lat": 17.4330, "lng": 78.4690, "type": "intersection"},
            "HOSPITAL": {"name": "City General Hospital", "lat": 17.4370, "lng": 78.4720, "type": "hospital"},
            "PATIENT": {"name": "Mehdipatnam Incident Call", "lat": 17.4020, "lng": 78.4200, "type": "patient"},
        }

        self.nodes_data = nodes
        for node_id, data in nodes.items():
            self.graph.add_node(node_id, **data)

        def haversine_m(lat1, lon1, lat2, lon2):
            R = 6371000
            phi1, phi2 = math.radians(lat1), math.radians(lat2)
            dphi = math.radians(lat2 - lat1)
            dlambda = math.radians(lon2 - lon1)
            a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
            return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        segments = [
            # Incident to Banjara Rd
            ("START_INCIDENT", "N_BANJARA_RD1", "Mehdipatnam Express Link", 55.0, True),
            
            # Default direct corridor via 5th Ave
            ("N_BANJARA_RD1", "N_5TH_48", "Banjara Hills Rd 1", 50.0, True),
            ("N_5TH_48", "N_5TH_45", "5th Avenue (Banjara Hills Trunk)", 45.0, True),
            ("N_5TH_45", "N_5TH_42", "5th Avenue (Somajiguda Access)", 45.0, True),
            ("N_5TH_42", "N_LAKE_SHORE", "Somajiguda Lake Approach", 48.0, True),

            # Alternative Bypass corridor via 6th Ave (Somajiguda North)
            ("N_BANJARA_RD1", "N_6TH_48", "Somajiguda West Bypass", 50.0, True),
            ("N_6TH_48", "N_6TH_45", "6th Ave Somajiguda Corridor", 52.0, True),
            ("N_6TH_45", "N_6TH_42", "6th Ave North Connection", 52.0, True),
            ("N_6TH_42", "N_LAKE_SHORE", "Lake Overpass Link", 50.0, True),

            # Secondary Khairatabad / 7th Ave Corridor
            ("N_BANJARA_RD1", "N_7TH_48", "Khairatabad Connector", 48.0, True),
            ("N_7TH_48", "N_7TH_45", "7th Ave Khairatabad Trunk", 50.0, True),
            ("N_7TH_45", "N_7TH_42", "Necklace Rd Promenade", 52.0, True),
            ("N_7TH_42", "N_LAKE_SHORE", "Lake Boulevard North", 50.0, True),

            # Cross Connectors
            ("N_6TH_45", "N_7TH_45", "Raj Bhavan Cross Link", 45.0, True),
            ("N_5TH_42", "N_6TH_42", "Somajiguda Cross Connector", 45.0, True),

            # Hospital Approach Corridor
            ("N_LAKE_SHORE", "N_BEGUMPET_CROSS", "Hussain Sagar North Shore", 55.0, True),
            ("N_BEGUMPET_CROSS", "HOSPITAL", "City General Hospital Ramp", 50.0, True),
            
            # Bidirectional connection for PATIENT node
            ("PATIENT", "START_INCIDENT", "Incident Site Access", 50.0, True),
            ("HOSPITAL", "N_BEGUMPET_CROSS", "Hospital South Departure", 50.0, True),
        ]

        for u, v, name, speed_limit, is_bidir in segments:
            dist = haversine_m(nodes[u]["lat"], nodes[u]["lng"], nodes[v]["lat"], nodes[v]["lng"])
            seg_id = f"SEG_{u}_{v}"
            base_time = dist / ((speed_limit * 1000.0) / 3600.0)
            
            data = {
                "id": seg_id,
                "name": name,
                "from_node": u,
                "to_node": v,
                "length_m": round(dist, 1),
                "speed_limit_kmh": speed_limit,
                "current_speed_kmh": speed_limit,
                "congestion_level": 0.05,
                "hazard_status": "clear",
                "risk_penalty": 0.0,
                "base_time_s": base_time,
                "traversal_cost": base_time,
                "coords": [
                    [nodes[u]["lat"], nodes[u]["lng"]],
                    [nodes[v]["lat"], nodes[v]["lng"]]
                ]
            }
            self.segments_data[seg_id] = data
            self.graph.add_edge(u, v, **data)

            if is_bidir:
                rev_seg_id = f"SEG_{v}_{u}"
                rev_data = dict(data)
                rev_data["id"] = rev_seg_id
                rev_data["from_node"] = v
                rev_data["to_node"] = u
                rev_data["coords"] = [
                    [nodes[v]["lat"], nodes[v]["lng"]],
                    [nodes[u]["lat"], nodes[u]["lng"]]
                ]
                self.segments_data[rev_seg_id] = rev_data
                self.graph.add_edge(v, u, **rev_data)

    def calculate_edge_weight(self, u: str, v: str, edge_data: Dict) -> float:
        hazard_status = edge_data.get("hazard_status", "clear")
        base_time = edge_data.get("base_time_s", 60.0)
        congestion = edge_data.get("congestion_level", 0.0)
        risk_penalty = edge_data.get("risk_penalty", 0.0)

        if hazard_status == "blocked":
            return 1_000_000.0
        
        current_time = base_time * (1.0 + congestion * 2.5)

        if hazard_status == "probable_hazard":
            current_time *= (1.0 + risk_penalty * 4.0)

        return current_time

    def update_segment_status(self, seg_id: str, hazard_status: str, congestion: Optional[float] = None, risk_penalty: float = 0.0):
        if seg_id in self.segments_data:
            self.segments_data[seg_id]["hazard_status"] = hazard_status
            self.segments_data[seg_id]["risk_penalty"] = risk_penalty
            if congestion is not None:
                self.segments_data[seg_id]["congestion_level"] = congestion
            
            u = self.segments_data[seg_id]["from_node"]
            v = self.segments_data[seg_id]["to_node"]
            if self.graph.has_edge(u, v):
                self.graph[u][v].update(self.segments_data[seg_id])

    def get_all_segments(self) -> List[Dict]:
        return list(self.segments_data.values())

    def get_all_nodes(self) -> Dict[str, Dict]:
        return self.nodes_data

    def find_shortest_path(self, start_node: str, end_node: str) -> Tuple[List[str], float, List[Dict]]:
        def weight_func(u, v, d):
            return self.calculate_edge_weight(u, v, d)

        try:
            path = nx.dijkstra_path(self.graph, start_node, end_node, weight=weight_func)
            total_time = 0.0
            segments = []
            for i in range(len(path) - 1):
                u, v = path[i], path[i+1]
                edge = self.graph[u][v]
                w = self.calculate_edge_weight(u, v, edge)
                total_time += w
                segments.append(edge)
            return path, total_time, segments
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return [], float('inf'), []
