import React from 'react';
import { TradeHistory } from '../types/types';

interface TradeHistoryProps {
  trades: TradeHistory[];
}

const TradeHistory: React.FC<TradeHistoryProps> = ({ trades }) => {
  return (
    <div className="trade-history">
      <h3>TRADE HISTORY</h3>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Asset</th>
            <th>Stake</th>
            <th>Payout</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade, i) => (
            <tr key={i} className={trade.status}>
              <td>{trade.time}</td>
              <td>{trade.asset}</td>
              <td>{trade.stake.toFixed(2)} USD</td>
              <td>{trade.payout.toFixed(2)} USD</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TradeHistory;