import asyncio
import json
from contextlib import asynccontextmanager
from typing import List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .engine.simulator import CitySimulator
from .models.schemas import (
    DashboardSummary, VehicleEvent, Hazard, TrafficSignal,
    AmbulanceRoute, SimulationMetrics, HazardVerifyRequest
)

simulator = CitySimulator()

# Active WebSocket connections
active_connections: List[WebSocket] = []

async def broadcast_state():
    if not active_connections:
        return
    data = simulator.get_snapshot()
    msg = json.dumps(data)
    disconnected = []
    for ws in active_connections:
        try:
            await ws.send_text(msg)
        except Exception:
            disconnected.append(ws)
    for ws in disconnected:
        if ws in active_connections:
            active_connections.remove(ws)

# Background simulation runner loop
simulation_task = None

async def simulation_loop():
    while True:
        try:
            if simulator.simulation_state == "RUNNING":
                simulator.tick(delta_s=1.0)
            await broadcast_state()
        except Exception as e:
            print(f"Simulation tick error: {e}")
        await asyncio.sleep(1.0)

@asynccontextmanager
async def lifespan(app: FastAPI):
    global simulation_task
    simulation_task = asyncio.create_task(simulation_loop())
    yield
    if simulation_task:
        simulation_task.cancel()

app = FastAPI(
    title="WayMaker API — Smart Emergency Routing & Traffic Coordination",
    description="Intelligent City Emergency Response & Traffic Signal Orchestration Engine",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- REST Endpoints -----------------

@app.get("/api/dashboard", response_model=DashboardSummary)
def get_dashboard_summary():
    return simulator.get_summary()

@app.get("/api/vehicles", response_model=List[VehicleEvent])
def get_vehicles():
    return list(simulator.vehicles.values())

@app.get("/api/hazards", response_model=List[Hazard])
def get_hazards():
    return simulator.hazard_engine.get_active_hazards()

@app.post("/api/simulation/start")
def start_simulation():
    simulator.start()
    return {"status": "success", "message": "Simulation started", "state": simulator.simulation_state}

@app.post("/api/simulation/pause")
def pause_simulation():
    simulator.pause()
    return {"status": "success", "message": "Simulation paused", "state": simulator.simulation_state}

@app.post("/api/simulation/reset")
def reset_simulation():
    simulator.reset()
    return {"status": "success", "message": "Simulation reset", "state": simulator.simulation_state}

@app.post("/api/simulation/water-main-break")
def trigger_water_main_break():
    simulator.trigger_water_main_break()
    return {"status": "success", "message": "Water-main break incident triggered on 5th Avenue"}

@app.post("/api/simulation/false-alarm")
def trigger_false_alarm():
    simulator.trigger_false_alarm()
    return {"status": "success", "message": "Bus stop false-alarm scenario triggered"}

@app.post("/api/simulation/secondary-accident")
def trigger_secondary_accident():
    simulator.trigger_secondary_accident()
    return {"status": "success", "message": "Secondary accident triggered on 6th Avenue"}

@app.post("/api/ambulances/dispatch")
def dispatch_ambulance():
    simulator.dispatch_ambulance()
    return {"status": "success", "message": "Ambulance AMB-01 dispatched", "ambulance": simulator.ambulance}

@app.post("/api/hazards/{hazard_id}/verify")
def verify_hazard(hazard_id: str, req: HazardVerifyRequest):
    h = simulator.hazard_engine.manually_verify(hazard_id, req.status, req.confidence_override)
    if not h:
        raise HTTPException(status_code=404, detail="Hazard not found")
    
    # Recalculate if confirmed or resolved
    if req.status == "confirmed":
        simulator.rn.update_segment_status(h.road_segment_id, hazard_status="blocked", congestion=0.95)
        simulator._recalculate_ambulance_route(reason=f"Hazard {h.id} manually confirmed by operator.")
    elif req.status == "unverified":
        simulator.rn.update_segment_status(h.road_segment_id, hazard_status="clear", congestion=0.1)
        simulator._recalculate_ambulance_route(reason=f"Hazard {h.id} rejected / cleared by operator.")

    return {"status": "success", "hazard": h}

@app.get("/api/routes/{ambulance_id}", response_model=AmbulanceRoute)
def get_ambulance_route(ambulance_id: str):
    if simulator.ambulance.ambulance_id == ambulance_id:
        return simulator.ambulance
    raise HTTPException(status_code=404, detail="Ambulance not found")

@app.get("/api/signals", response_model=List[TrafficSignal])
def get_signals():
    return simulator.signal_coordinator.get_signals_list()

@app.get("/api/metrics", response_model=SimulationMetrics)
def get_metrics():
    return simulator.metrics

@app.get("/api/snapshot")
def get_snapshot():
    return simulator.get_snapshot()

# ----------------- WebSocket Endpoint -----------------

@app.websocket("/ws/events")
async def websocket_events(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        # Immediately send current state
        init_data = json.dumps(simulator.get_snapshot())
        await websocket.send_text(init_data)
        while True:
            # Keep reading incoming client ping/commands if any
            data = await websocket.receive_text()
            try:
                cmd = json.loads(data)
                action = cmd.get("action")
                if action == "start":
                    simulator.start()
                elif action == "pause":
                    simulator.pause()
                elif action == "reset":
                    simulator.reset()
                elif action == "water_main_break":
                    simulator.trigger_water_main_break()
                elif action == "false_alarm":
                    simulator.trigger_false_alarm()
                elif action == "secondary_accident":
                    simulator.trigger_secondary_accident()
                elif action == "dispatch":
                    simulator.dispatch_ambulance()
                await broadcast_state()
            except Exception:
                pass
    except WebSocketDisconnect:
        if websocket in active_connections:
            active_connections.remove(websocket)
    except Exception:
        if websocket in active_connections:
            active_connections.remove(websocket)
