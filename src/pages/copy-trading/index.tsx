import React, { useState } from 'react';
import { localize } from '@deriv-com/translations';
import './styles.css';

const CopyTrading: React.FC = () => {
    const [isCopyEnabled, setIsCopyEnabled] = useState(false);
    const [clientToken, setClientToken] = useState('');

    const handleCopyToggle = () => {
        setIsCopyEnabled(!isCopyEnabled);
    };

    const handleStartCopy = () => {
        if (!clientToken) {
            alert(localize('Please enter a client token'));
            return;
        }
        // Add your copy trading logic here
        console.log('Starting copy trading with token:', clientToken);
    };

    return (
        <div className="copytrade-wrapper">
            <div className="copytrade-container">
                <div className="copytrade-title">
                    <span className="copy">{localize('Copy')}</span>
                    <span className="trade">{localize('Trade')}</span>
                </div>

                <div className="toggle-wrapper">
                    <label className="switch">
                        <input 
                            type="checkbox" 
                            id="copy-toggle"
                            checked={isCopyEnabled}
                            onChange={handleCopyToggle}
                        />
                        <span className="slider"></span>
                    </label>
                    <span>{localize('Copy Trades from Demo to Real account')}</span>
                </div>

                <div className="copytrade-group">
                    <label className="copytrade-label">{localize('Account ID')}</label>
                    <div className="copytrade-readonly-box">12345678</div>
                </div>

                <div className="copytrade-group">
                    <label className="copytrade-label">{localize('Client Token')}</label>
                    <input 
                        className="copytrade-input" 
                        type="text" 
                        placeholder={localize('Enter client token')}
                        value={clientToken}
                        onChange={(e) => setClientToken(e.target.value)}
                    />
                </div>

                <button 
                    className="copytrade-button" 
                    type="button"
                    onClick={handleStartCopy}
                >
                    {localize('Start Copy')}
                </button>
            </div>
        </div>
    );
};

export default CopyTrading; 