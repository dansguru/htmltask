import React, { useState, useEffect } from 'react';
import './styles.css';
import DigitPanel from './components/DigitPanel';
import OverUnderPanel from './components/OverUnderPanel';
import EvenOddPanel from './components/EvenOddPanel';
import RiseFallPanel from './components/RiseFallPanel';
import SettingsDialog from './components/SettingsDialog';
import useDerivApi from './hooks/useDerivApi';

// Debug component to show current state
const DebugPanel = ({ state }: { state: Record<string, unknown> }) => (
  <div className="debug-panel">
    <h4>Debug Information</h4>
    <pre>{JSON.stringify(state, null, 2)}</pre>
  </div>
);

const SYMBOL_OPTIONS = [
  { value: 'R_10', label: 'Volatility 10 Index' },
  { value: 'R_25', label: 'Volatility 25 Index' },
  // ... other options
];

const SmartAnalysisTool = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [symbol, setSymbol] = useState('R_10');
  const [tickCount, setTickCount] = useState(1000);
  const [showSettings, setShowSettings] = useState(false);
  const [stake, setStake] = useState(1);
  const [martingale, setMartingale] = useState(1.2);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false); // Debug mode toggle

  const api = useDerivApi({ 
    symbol, 
    tickCount, 
    isRunning, 
    stake, 
    martingale 
  });

  // Debug state
  const debugState = {
    isRunning,
    symbol,
    tickCount,
    stake,
    martingale,
    error,
    apiState: {
      price: api.price,
      isLoading: api.isLoading,
      error: api.error,
      isConnected: api.isConnected,
      lastUpdate: api.lastUpdate
    }
  };

  useEffect(() => {
    console.log('SmartAnalysisTool mounted');
    return () => console.log('SmartAnalysisTool unmounted');
  }, []);

  useEffect(() => {
    if (api.error) {
      setError(api.error.message);
      setIsRunning(false);
      console.error('API Error:', api.error);
    } else {
      setError(null);
    }
  }, [api.error]);

  useEffect(() => {
    console.log('Connecting to API...');
    api.connect();
    
    return () => {
      console.log('Disconnecting from API...');
      api.disconnect();
    };
  }, [symbol, tickCount]);

  const handleStartStop = () => {
    console.log(isRunning ? 'Stopping analysis' : 'Starting analysis');
    setIsRunning(!isRunning);
  };

  if (api.isLoading) {
    return (
      <div className="status-container">
        <div className="loading-spinner" />
        <p>Initializing Smart Analysis Tool...</p>
        <button onClick={() => setShowDebug(!showDebug)}>
          {showDebug ? 'Hide Debug' : 'Show Debug'}
        </button>
        {showDebug && <DebugPanel state={debugState} />}
      </div>
    );
  }

  if (error) {
    return (
      <div className="status-container error">
        <h3>Error Loading Smart Analysis</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
        <DebugPanel state={debugState} />
      </div>
    );
  }

  if (!api.price && !api.isLoading) {
    return (
      <div className="status-container warning">
        <h3>No Market Data Received</h3>
        <p>Please check your connection and symbol selection</p>
        <button onClick={() => api.connect()}>Reconnect</button>
        <button onClick={() => setShowDebug(!showDebug)}>
          {showDebug ? 'Hide Debug' : 'Show Debug'}
        </button>
        {showDebug && <DebugPanel state={debugState} />}
      </div>
    );
  }

  return (
    <div className="smart-analysis-tool">
      <div className="toolbar">
        <button 
          onClick={() => setShowDebug(!showDebug)}
          className="debug-button"
        >
          {showDebug ? 'Hide Debug' : 'Debug'}
        </button>
      </div>

      {showDebug && <DebugPanel state={debugState} />}

      <div className="top-bar">
        {/* ... rest of your existing UI ... */}
      </div>

      <div className="grid-container">
        <DigitPanel digitCounts={api.digitCounts} lastDigit={api.lastDigit} />
        <OverUnderPanel
          overUnderArray={api.overUnderArray}
          isRunning={isRunning}
          onStartStop={handleStartStop}
          onOpenSettings={() => setShowSettings(true)}
        />
        {/* ... other panels ... */}
      </div>

      <SettingsDialog
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={(ticks, stake, martingale) => {
          setTickCount(ticks);
          setStake(stake);
          setMartingale(martingale);
          setShowSettings(false);
        }}
        initialTicks={tickCount}
        initialStake={stake}
        initialMartingale={martingale}
      />
    </div>
  );
};

export default SmartAnalysisTool;