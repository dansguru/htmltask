import React from 'react';
import { ContractType } from '../types/types';

interface EvenOddPanelProps {
  evenCount: number;
  oddCount: number;
  isRunning: boolean;
  onStartStop: () => void;
  onOpenSettings: () => void;
}

const EvenOddPanel: React.FC<EvenOddPanelProps> = ({
  evenCount,
  oddCount,
  isRunning,
  onStartStop,
  onOpenSettings,
}) => {
  const total = evenCount + oddCount;
  const evenPercentage = ((evenCount / total) * 100).toFixed(2);
  const oddPercentage = ((oddCount / total) * 100).toFixed(2);

  return (
    <div className="panel">
      <h3>EVEN | ODD</h3>
      <div className="divider"></div>
      <div className="progress">
        <div className="green" style={{ width: `${evenPercentage}%` }}></div>
        <div className="red" style={{ width: `${oddPercentage}%` }}></div>
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

export default EvenOddPanel;