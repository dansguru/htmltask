import React from 'react';

interface RiseFallPanelProps {
  riseCount: number;
  fallCount: number;
  isRunning: boolean;
  onStartStop: () => void;
  onOpenSettings: () => void;
}

const RiseFallPanel: React.FC<RiseFallPanelProps> = ({
  riseCount,
  fallCount,
  isRunning,
  onStartStop,
  onOpenSettings,
}) => {
  const total = riseCount + fallCount;
  const risePercentage = ((riseCount / total) * 100).toFixed(2);
  const fallPercentage = ((fallCount / total) * 100).toFixed(2);

  return (
    <div className="panel">
      <h3>RISE | FALL</h3>
      <div className="divider"></div>
      <div className="progress">
        <div className="green" style={{ width: `${risePercentage}%` }}></div>
        <div className="red" style={{ width: `${fallPercentage}%` }}></div>
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

export default RiseFallPanel;