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

import { SnapshotData } from './types';

const API_BASE = 'http://127.0.0.1:8000';
const WS_BASE = 'ws://127.0.0.1:8000/ws/events';

export const App: React.FC = () => {
  const [data, setData] = useState<SnapshotData | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
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
    } catch (err) {
      // Backend may be starting
    }
  };

  useEffect(() => {
    fetchSnapshot();

    // WebSocket connection
    let ws: WebSocket;
    let reconnectTimeout: any;

    const connectWS = () => {
      try {
        ws = new WebSocket(WS_BASE);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            setData(parsed);
          } catch (e) {
            console.error('WS Parse error:', e);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          reconnectTimeout = setTimeout(connectWS, 2000);
        };

        ws.onerror = () => {
          setIsConnected(false);
          ws.close();
        };
      } catch (err) {
        setIsConnected(false);
        reconnectTimeout = setTimeout(connectWS, 2000);
      }
    };

    connectWS();
    const interval = setInterval(fetchSnapshot, 2000);

    return () => {
      if (wsRef.current) wsRef.current.close();
      clearTimeout(reconnectTimeout);
      clearInterval(interval);
    };
  }, []);

  // API Action triggers
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
        {/* Left: Streamlined Sidebar with dynamic live events */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          events={data?.events ?? []}
        />

        {/* Center: Dynamic View Area (Full screen width) */}
        <main className="flex-1 p-5 overflow-y-auto space-y-4">
          {activeTab === 'live-map' && (
            <div className="flex flex-col h-[calc(100vh-105px)] space-y-3">
              {/* Clean Scenario Control Bar */}
              <ScenarioBar
                simulationState={data?.summary.simulation_state ?? 'IDLE'}
                onStart={handleStart}
                onPause={handlePause}
                onReset={handleReset}
                onTriggerWaterBreak={handleTriggerWaterBreak}
                onDispatchAmbulance={handleDispatchAmbulance}
                onTriggerFalseAlarm={handleTriggerFalseAlarm}
                onTriggerSecondaryAccident={handleTriggerSecondaryAccident}
              />

              {/* Full-Width Live GIS Map */}
              <div className="flex-1 min-h-0 rounded-2xl overflow-hidden border border-gray-200 shadow-xs">
                <LiveMap
                  vehicles={data?.vehicles ?? []}
                  hazards={data?.hazards ?? []}
                  signals={data?.signals ?? []}
                  ambulance={data?.ambulance}
                  segments={data?.segments ?? []}
                  onSelectHazard={() => setActiveTab('tickets')}
                />
              </div>
            </div>
          )}

          {activeTab === 'tickets' && (
            <TicketsView
              hazards={data?.hazards ?? []}
              onTriggerWaterBreak={handleTriggerWaterBreak}
            />
          )}

          {activeTab === 'buses' && (
            <BusesView
              vehicles={data?.vehicles ?? []}
              onTriggerFalseAlarm={handleTriggerFalseAlarm}
              onTriggerWaterBreak={handleTriggerWaterBreak}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView metrics={data?.metrics} />
          )}
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

export default App;
