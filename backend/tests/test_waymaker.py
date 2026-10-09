import pytest
from fastapi.testclient import TestClient
from backend.app.main import app, simulator
from backend.app.engine.hazard_engine import HazardEngine
from backend.app.engine.road_network import RoadNetwork
from backend.app.engine.routing_engine import RoutingEngine
from backend.app.engine.signal_coordinator import SignalCoordinator
from backend.app.models.schemas import VehicleEvent, HazardEvidence

client = TestClient(app)

def test_speed_anomaly_detection():
    he = HazardEngine()
    # Normal moving bus
    event_normal = VehicleEvent(
        vehicle_id="BUS-TEST-1",
        latitude=40.7550,
        longitude=-73.9800,
        speed=35.0,
        timestamp="08:15:00",
        road_segment_id="SEG_N_5TH_48_N_5TH_45"
    )
    res = he.process_telemetry(event_normal)
    assert res is None

    # Stopped bus mid-block
    event_stopped = VehicleEvent(
        vehicle_id="BUS-TEST-1",
        latitude=40.7550,
        longitude=-73.9800,
        speed=0.0,
        timestamp="08:15:05",
        road_segment_id="SEG_N_5TH_48_N_5TH_45"
    )
    he.process_telemetry(event_stopped)
    # Second reading after delay
    res2 = he.process_telemetry(event_stopped)
    assert res2 is not None
    assert res2["type"] == "ANOMALY_STATIONARY"

def test_false_positive_handling():
    he = HazardEngine()
    # Bus stopped at designated bus stop
    event_bus_stop = VehicleEvent(
        vehicle_id="BUS-TEST-2",
        latitude=40.7595,
        longitude=-73.9760,  # 5th Ave & 52nd St Bus Stop
        speed=0.0,
        timestamp="08:15:10",
        road_segment_id="SEG_N_5TH_54_N_5TH_50"
    )
    he.process_telemetry(event_bus_stop)
    res = he.process_telemetry(event_bus_stop)
    assert res is not None
    assert res["type"] == "NORMAL_BUS_STOP"
    assert res["is_hazard"] is False

def test_hazard_confidence_and_verification():
    he = HazardEngine()
    ev1 = HazardEvidence(
        timestamp="08:15:00",
        source="bus_telemetry",
        description="Speed dropped to 0 km/h",
        confidence_delta=0.45
    )
    h = he.register_or_update_hazard(
        hazard_id="HAZ-TEST",
        category="water_main_break",
        road_segment_id="SEG_N_5TH_48_N_5TH_45",
        location_name="5th Ave & 46th St",
        lat=40.755,
        lng=-73.980,
        severity="critical",
        evidence=ev1,
        description="Water main leak"
    )
    assert h.status == "probable"  # 0.45 meets PROBABLE threshold
    assert h.confidence == 0.45

    # Multi-sensor confirmation
    ev2 = HazardEvidence(
        timestamp="08:15:20",
        source="sensor",
        description="Pressure drop sensor",
        confidence_delta=0.40
    )
    h2 = he.register_or_update_hazard(
        hazard_id="HAZ-TEST",
        category="water_main_break",
        road_segment_id="SEG_N_5TH_48_N_5TH_45",
        location_name="5th Ave & 46th St",
        lat=40.755,
        lng=-73.980,
        severity="critical",
        evidence=ev2,
        description="Water main rupture"
    )
    assert h2.status == "confirmed"
    assert h2.confidence == 0.85

def test_closed_road_avoidance_and_routing():
    rn = RoadNetwork()
    re = RoutingEngine(rn)

    # Initial route from Hospital to Patient
    route_initial = re.compute_route("HOSPITAL", "PATIENT")
    assert len(route_initial.current_route_nodes) > 0
    # Initially 5th Ave might be part of default path
    # Now block 5th Avenue
    rn.update_segment_status("SEG_N_5TH_48_N_5TH_45", hazard_status="blocked")
    route_rerouted = re.compute_route("HOSPITAL", "PATIENT")

    # Verify that the blocked segment is NOT in the new path
    path = route_rerouted.current_route_nodes
    for i in range(len(path) - 1):
        assert not (path[i] == "N_5TH_48" and path[i+1] == "N_5TH_45")

def test_traffic_signal_state_transitions():
    rn = RoadNetwork()
    sc = SignalCoordinator(rn.nodes_data)
    
    # Ambulance approaching 6th Ave & Somajiguda
    target_node = "N_6TH_45"
    lat_45 = rn.nodes_data[target_node]["lat"]
    lng_45 = rn.nodes_data[target_node]["lng"]

    # When ambulance is within 300m heading toward it
    sc.update_coordination(
        active_route_nodes=["START_INCIDENT", "N_BANJARA_RD1", "N_6TH_48", "N_6TH_45", "N_6TH_42"],
        current_ambulance_lat=lat_45 - 0.002,
        current_ambulance_lng=lng_45,
        speed_kmh=50.0
    )
    sig = sc.signals["SIG_6TH_45"]
    assert sig.ambulance_approaching is True
    assert sig.coordination_status in ["GREEN_WAVE_ACTIVE", "PREEMPTION_REQUESTED"]

def test_simulation_api_endpoints():
    simulator.reset()
    # Test dashboard summary
    res = client.get("/api/dashboard")
    assert res.status_code == 200
    data = res.json()
    assert "active_ambulances" in data
    assert "signals_monitored" in data

    # Test trigger water main break
    res = client.post("/api/simulation/water-main-break")
    assert res.status_code == 200
    assert simulator.water_break_triggered is True

    # Test hazards endpoint
    res = client.get("/api/hazards")
    assert res.status_code == 200
    hazards = res.json()
    assert len(hazards) > 0
    assert hazards[0]["status"] == "confirmed"

    # Test ambulance dispatch
    res = client.post("/api/ambulances/dispatch")
    assert res.status_code == 200
    assert simulator.ambulance.status == "EN_ROUTE"

    # Test simulation reset
    res = client.post("/api/simulation/reset")
    assert res.status_code == 200
    assert simulator.water_break_triggered is False
    assert simulator.ambulance.status == "IDLE"
