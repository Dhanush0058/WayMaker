import React, { useState, useEffect, useRef } from 'react';
import { TopHeader } from './components/TopHeader';
import { Sidebar } from './components/Sidebar';
import { MetricCards } from './components/MetricCards';
import { ScenarioBar } from './components/ScenarioBar';
import { LiveMap } from './components/LiveMap';
import { RightSidebar } from './components/RightSidebar';
import { EvaluationMetricsModal } from './components/EvaluationMetricsModal';
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
      // Backend may be booting
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

  const handleVerifyHazard = (hazardId: string, status: string) => {
    handleApiAction(`/api/hazards/${hazardId}/verify`, 'POST', { status });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 flex flex-col font-sans select-none">
      {/* Top Header */}
      <TopHeader
        summary={data?.summary}
        isConnected={isConnected}
        onOpenMetrics={() => setIsMetricsOpen(true)}
      />

      {/* Main Container: 3-column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Sidebar (Navigation + Real-time Feed) */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          events={data?.events ?? []}
        />

        {/* Center: Live Map & Metric Cards */}
        <main className="flex-1 p-5 overflow-y-auto space-y-4">
          {/* Top 4 Summary Cards */}
          <MetricCards summary={data?.summary} />

          {/* Scenario Trigger & Playback Bar */}
          <ScenarioBar
            simulationState={data?.summary.simulation_state ?? 'IDLE'}
            onStart={handleStart}
            onPause={handlePause}
            onReset={handleReset}
            onTriggerWaterBreak={handleTriggerWaterBreak}
            onDispatchAmbulance={handleDispatchAmbulance}
            onTriggerFalseAlarm={handleTriggerFalseAlarm}
            onTriggerSecondaryAccident={handleTriggerSecondaryAccident}
            onOpenMetrics={() => setIsMetricsOpen(true)}
          />

          {/* Central Live Map */}
          <LiveMap
            vehicles={data?.vehicles ?? []}
            hazards={data?.hazards ?? []}
            signals={data?.signals ?? []}
            ambulance={data?.ambulance}
            segments={data?.segments ?? []}
            onSelectHazard={(h) => console.log('Selected hazard', h)}
          />
        </main>

        {/* Right: Selected Ambulance & Hazard Information Cards */}
        <div className="p-5 pl-0 hidden xl:block">
          <RightSidebar
            ambulance={data?.ambulance}
            hazards={data?.hazards ?? []}
            onDispatch={handleDispatchAmbulance}
            onVerifyHazard={handleVerifyHazard}
            onFocusMap={() => console.log('Focus map')}
          />
        </div>
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
