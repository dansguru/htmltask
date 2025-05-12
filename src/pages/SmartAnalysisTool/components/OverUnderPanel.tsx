import React, { useState } from 'react';
import { ContractType } from '../types/types';

interface OverUnderPanelProps {
  lastDigit: number;
  isRunning: boolean;
  onStartStop: () => void;
  onOpenSettings: () => void;
}

const OverUnderPanel: React.FC<OverUnderPanelProps> = ({
  lastDigit,
  isRunning,
  onStartStop,
  onOpenSettings,
}) => {
  const [digits, setDigits] = useState<number[]>([]);

  useEffect(() => {
    setDigits(prev => [...prev.slice(-9), lastDigit]);
  }, [lastDigit]);

  return (
    <div className="panel">
      <h3>OVER | UNDER</h3>
      <div className="divider"></div>
      <div className="button-grid">
        {digits.map((digit, i) => (
          <button key={i} style={{ backgroundColor: digit > 4 ? '#4CAF50' : '#F44336' }}>
            {digit}
          </button>
        ))}
      </div>
      <div className="panel-controls">
        <button onClick={onStartStop}>
          <i className={`fas fa-${isRunning ? 'stop' : 'play'}`}></i>
        </button>
        <button onClick={onOpenSettings}>
          <i className="fas fa-sliders-h"></i>
        </button>
      </div>
    </div>
  );
};

export default OverUnderPanel;