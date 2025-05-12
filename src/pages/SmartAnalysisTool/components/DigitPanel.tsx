import React from 'react';

interface DigitPanelProps {
  digitCounts: number[];
  lastDigit: number;
}

const DigitPanel: React.FC<DigitPanelProps> = ({ digitCounts, lastDigit }) => {
  const colorMapping = [
    '#B2EBF2', '#FFCDD2', '#C5E1A5', '#FFF59D', '#FFEB3B',
    '#B39DDB', '#80CBC4', '#C8E6C9', '#F8BBD0', '#FF7043',
  ];

  return (
    <div className="panel">
      <h3>LAST DIGITS</h3>
      <div className="divider"></div>
      <div className="circle-grid">
        {digitCounts.map((count, index) => (
          <div
            key={index}
            className="circle"
            style={{
              backgroundColor: index === lastDigit ? '#f44336' : '#121212',
              color: index === lastDigit ? '#fff' : 'white',
              border: count === Math.max(...digitCounts) ? '3px solid green' : 
                     count === Math.min(...digitCounts) ? '3px solid red' : 'none',
            }}
          >
            {index}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DigitPanel;