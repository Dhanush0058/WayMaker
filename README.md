# WayMaker — Smart Emergency Routing & Traffic Coordination Platform

> **Smarter Roads. Safer Lives.**

WayMaker is a full-stack smart-city emergency routing and traffic coordination platform built for rapid emergency dispatch and dynamic citywide congestion mitigation. When unexpected road hazards (water-main ruptures, sinkholes, severe potholes, or secondary collisions) occur, WayMaker detects them via real-time vehicle telematics, verifies incidents across multi-sensor streams, dynamically reroutes ambulances through safe corridors, and preemptively orchestrates traffic signals into synchronized "Green Waves" to save critical response time.

---

## 📸 Interface Design & Architecture

The user interface matches the reference smart-city control center design:
- **Green-and-White Theme**: `#16A34A` (Primary Green), `#166534` (Dark Green), `#F8FAFC` / `#FFFFFF` (Crisp light surface), `#DC2626` (Hazard Red), `#F59E0B` (Warning Amber).
- **Top Header**: Live telemetry status, simulation clock (`10:24 AM`), search bar, operator badge (`City Admin | Control Center`), and benchmark evaluation triggers.
- **Left Navigation**: Live Map, Incidents, Buses, Ambulances, Traffic Signals, Analytics, and Real-time Telematics Feed with anomaly tags.
- **Summary Metrics**:
  - 🚑 **3** Active Ambulances (`All on track`)
  - 🚌 **42** Buses on Road (`Live Tracking`)
  - ⚠️ **6** Hazards Detected (`+ 2 New`)
  - 🚦 **126** Traffic Signals (`98 Synced`)
- **Central Live Map (Leaflet / GIS)**:
  - Hospital hub (*City General Hospital*)
  - Real-time ambulance tracking with siren animations (*Ambulance A-17*)
  - Animated glowing green optimal route with directional arrows
  - Hazard indicator (*Pothole / Rupture on 5th Avenue*) with pulsing ripple
  - Bypassed compromised road segment in warning orange
  - Synchronized traffic lights with active green-wave preemption
  - Map controls: Map / Satellite / Terrain toggles, zoom controls, and floating legend bar
- **Right Command Panels**:
  - **Selected Ambulance**: Live ETA (**8 min** vs 12–15 min baseline), distance (4.2 km), speed (52 km/h), and route stage timeline.
  - **Hazard Information**: Real camera image thumbnail of detected pothole/fracture, high-severity indicator, detection timestamp, and direct map link.
- **Scenario Controls**: One-click deterministic triggers for the hackathon demonstration scenarios.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 19 + TypeScript
  - Vite + Tailwind CSS
  - Leaflet (OpenStreetMap & Carto Voyager GIS)
  - Lucide Icons
- **Backend**:
  - Python 3.13 + FastAPI
  - WebSockets (`/ws/events`) for streaming live simulation snapshots
  - Pydantic v2 schemas and validation
- **Routing & Graph Engine**:
  - NetworkX directed weighted multigraph modeling urban corridors and intersections
  - Dijkstra pathfinding with dynamic congestion and hazard risk multipliers
  - Traffic Signal Preemption Coordinator (Green Wave)

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Python 3.11+** installed
- **Node.js 18+** & **npm** installed

### 2. Backend Setup
```bash
# Navigate to workspace root
cd WayMaker

# Install Python dependencies
python -m pip install fastapi uvicorn pydantic networkx websockets pytest httpx

# Start the FastAPI backend (runs on http://127.0.0.1:8000)
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

### 3. Frontend Setup
```bash
# Open a new terminal and navigate to frontend
cd WayMaker/frontend

# Install npm packages
npm install

# Start Vite dev server (runs on http://127.0.0.1:5173)
npm run dev
```

Visit **`http://127.0.0.1:5173/`** in your browser.

---

## 🧪 Demonstration Scenarios

### 1. Mandatory Scenario: Sudden Water-Main / Pothole Break
1. Click **`1. Water-Main / Pothole Break`** in the scenario toolbar.
2. Bus 42 telematics drops to 0 km/h on 5th Avenue; anomaly is registered.
3. Multi-sensor fusion verifies severe fracture (Confidence: 92%); road segment is marked `BLOCKED`.
4. Click **`2. Dispatch A-17`**.
5. Routing engine detects the blockage and recalculates the ambulance path through the Somajiguda bypass corridor.
6. Traffic signals along the route transition into `GREEN_WAVE_ACTIVE`.
7. Displays updated ETA (8 min vs 15 min baseline, saving critical minutes).

### 2. Scenario A: False Alarm (Transit Bus Stop)
1. Click **`Scenario A: False Alarm`**.
2. Bus 18 stops at a designated transit stop for passenger boarding.
3. WayMaker's transit geofence engine identifies the scheduled stop.
4. Anomaly is suppressed as normal transit boarding; the road remains open without unnecessary closures.

### 3. Scenario B: Dynamic Rerouting (Secondary Collision)
1. While Ambulance A-17 is en route, click **`Scenario B: Dynamic Reroute`**.
2. A secondary collision blocks the Somajiguda bypass.
3. WayMaker detects the secondary blockage in real time and recalculates the remaining journey via the Necklace Road lake corridor.

---

## 📡 REST & WebSocket API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard` | Summary statistics (ambulances, buses, hazards, signals, ETA) |
| `GET` | `/api/vehicles` | Current telematics states of all reporting vehicles |
| `GET` | `/api/hazards` | Active hazards with confidence scores and verification state |
| `POST` | `/api/simulation/start` | Start live simulation clock |
| `POST` | `/api/simulation/pause` | Pause simulation |
| `POST` | `/api/simulation/reset` | Reset all corridors, incidents, and units |
| `POST` | `/api/simulation/water-main-break` | Trigger water-main break on 5th Avenue |
| `POST` | `/api/simulation/false-alarm` | Trigger bus stop boarding scenario |
| `POST` | `/api/simulation/secondary-accident` | Trigger secondary collision |
| `POST` | `/api/ambulances/dispatch` | Dispatch Ambulance A-17 |
| `POST` | `/api/hazards/{id}/verify` | Operator manual verification override |
| `GET` | `/api/routes/{id}` | Detailed coordinates and step breakdown of calculated route |
| `GET` | `/api/signals` | Smart traffic signal controller states |
| `GET` | `/api/metrics` | Evaluation benchmark metrics |
| `GET` | `/api/snapshot` | Complete atomic snapshot of city simulation |
| `WS` | `/ws/events` | High-frequency live WebSocket telematics stream |

---

## 📊 Evaluation & Automated Test Suite

Run the automated pytest test suite:
```bash
python -m pytest backend/tests/test_waymaker.py -v
```

**Test Coverage**:
- `test_speed_anomaly_detection`: Confirms sudden bus deceleration triggers anomaly flag.
- `test_false_positive_handling`: Confirms scheduled stops are not misclassified as hazards.
- `test_hazard_confidence_and_verification`: Verifies multi-source sensor fusion confidence scoring.
- `test_closed_road_avoidance_and_routing`: Validates Dijkstra pathfinding avoids impassable roads.
- `test_traffic_signal_state_transitions`: Confirms signals transition to `GREEN_WAVE_ACTIVE` when an ambulance approaches.
- `test_simulation_api_endpoints`: End-to-end API integration tests.
