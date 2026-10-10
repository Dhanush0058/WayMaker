import React, { useState, useEffect, useRef } from 'react';
import { TopHeader } from './components/TopHeader';
import { Sidebar } from './components/Sidebar';
import { ScenarioBar } from './components/ScenarioBar';
import { LiveMap } from './components/LiveMap';
import { EvaluationMetricsModal } from './components/EvaluationMetricsModal';

// Cleaned 4 core platform views
import { TicketsView } from './components/views/TicketsView';
import { BusesView } from './components/views/BusesView';
import { AnalyticsView } from './components/views/AnalyticsView';

// Unified Simulation Store Provider
import { SimulationStoreProvider } from './context/SimulationStore';
import { SnapshotData } from './types';

const API_BASE = 'http://127.0.0.1:8000';
const WS_BASE = 'ws://127.0.0.1:8000/ws/events';

export const AppContent: React.FC = () => {
  const [data, setData] = useState<SnapshotData | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isMetricsOpen, setIsMetricsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('live-map');
  const wsRef = useRef<WebSocket | null>(null);

  // Poll fallback / initial fetch
  const fetchSnapshot = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/snapshot`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // Backend may be offline/standalone
    }
  };

  useEffect(() => {
    fetchSnapshot();

    let ws: WebSocket;
    let reconnectTimeout: any;

    const connectWS = () => {
      try {
        ws = new WebSocket(WS_BASE);
        wsRef.current = ws;

        ws.onopen = () => setIsConnected(true);
        ws.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            setData(parsed);
          } catch (e) {
            console.error('WS error:', e);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          reconnectTimeout = setTimeout(connectWS, 3000);
        };

        ws.onerror = () => {
          setIsConnected(false);
          ws.close();
        };
      } catch {
        setIsConnected(false);
        reconnectTimeout = setTimeout(connectWS, 3000);
      }
    };

    connectWS();
    const interval = setInterval(fetchSnapshot, 3000);

    return () => {
      if (wsRef.current) wsRef.current.close();
      clearTimeout(reconnectTimeout);
      clearInterval(interval);
    };
  }, []);

  const handleApiAction = async (endpoint: string, method: string = 'POST', body?: any) => {
    try {
      await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      fetchSnapshot();
    } catch (err) {
      console.error('API Error:', err);
    }
  };

  const handleStart = () => handleApiAction('/api/simulation/start');
  const handlePause = () => handleApiAction('/api/simulation/pause');
  const handleReset = () => handleApiAction('/api/simulation/reset');
  const handleTriggerWaterBreak = () => handleApiAction('/api/simulation/water-main-break');
  const handleTriggerFalseAlarm = () => handleApiAction('/api/simulation/false-alarm');
  const handleTriggerSecondaryAccident = () => handleApiAction('/api/simulation/secondary-accident');
  const handleDispatchAmbulance = () => handleApiAction('/api/ambulances/dispatch');

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 flex flex-col font-sans select-none">
      {/* Top Header */}
      <TopHeader
        summary={data?.summary}
        isConnected={isConnected}
        onOpenMetrics={() => setIsMetricsOpen(true)}
      />

      {/* Main Container: Full Width & Height */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: 4-Tab Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Center: Dynamic View Area (Full screen width) */}
        <main className="flex-1 p-5 overflow-y-auto space-y-4">
          {activeTab === 'live-map' && (
            <div className="flex flex-col h-[calc(100vh-105px)] space-y-3">
              {/* Clean Scenario Control Bar */}
              <ScenarioBar
                simulationState={data?.summary.simulation_state ?? 'RUNNING'}
                onStart={handleStart}
                onPause={handlePause}
                onReset={handleReset}
                onTriggerWaterBreak={handleTriggerWaterBreak}
                onDispatchAmbulance={handleDispatchAmbulance}
                onTriggerFalseAlarm={handleTriggerFalseAlarm}
                onTriggerSecondaryAccident={handleTriggerSecondaryAccident}
              />

              {/* Full-Width Live GIS Map with 6 Moving Indian Transit Buses */}
              <div className="flex-1 min-h-0 rounded-2xl overflow-hidden border border-gray-200 shadow-xs">
                <LiveMap onSelectHazard={() => setActiveTab('tickets')} />
              </div>
            </div>
          )}

          {activeTab === 'tickets' && <TicketsView />}

          {activeTab === 'buses' && <BusesView />}

          {activeTab === 'analytics' && <AnalyticsView />}
        </main>
      </div>

      {/* Evaluation & Benchmark Metrics Modal */}
      <EvaluationMetricsModal
        isOpen={isMetricsOpen}
        onClose={() => setIsMetricsOpen(false)}
        metrics={data?.metrics}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <SimulationStoreProvider>
      <AppContent />
    </SimulationStoreProvider>
  );
};

export default App;
