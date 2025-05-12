import React, { useState } from 'react';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ticks: number, stake: number, martingale: number) => void;
  initialTicks: number;
  initialStake: number;
  initialMartingale: number;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTicks,
  initialStake,
  initialMartingale,
}) => {
  const [ticks, setTicks] = useState(initialTicks);
  const [stake, setStake] = useState(initialStake);
  const [martingale, setMartingale] = useState(initialMartingale);

  const handleSave = () => {
    onSave(ticks, stake, martingale);
  };

  if (!isOpen) return null;

  return (
    <div className="dialog">
      <div className="dialog-title">Bot Settings</div>
      <div className="form-group">
        <label>Ticks:</label>
        <input type="number" value={ticks} onChange={(e) => setTicks(Number(e.target.value))} />
      </div>
      <div className="form-group">
        <label>Stake:</label>
        <input type="number" value={stake} onChange={(e) => setStake(Number(e.target.value))} />
      </div>
      <div className="form-group">
        <label>Martingale:</label>
        <input type="number" value={martingale} onChange={(e) => setMartingale(Number(e.target.value))} />
      </div>
      <button onClick={handleSave}>Save</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

export default SettingsDialog;