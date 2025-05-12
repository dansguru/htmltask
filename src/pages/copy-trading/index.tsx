import React, { useEffect, useState } from 'react';
import { getAppId } from '@/components/shared/utils/config/config';
import './styles.css';

const CopyTrading = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [appId, setAppId] = useState<string>('');

    useEffect(() => {
        const app_id = getAppId();
        setAppId(String(app_id));
    }, []);

    return (
        <div className="copy-trading-wrapper">
            {error && <div className="error-message">{error}</div>}
            {isLoading && <div className="loading">Loading Copy Trading...</div>}
            <iframe
                src={`/abcz/layout/copytrading.html?app_id=${appId}`}
                className="copy-trading-iframe"
                onLoad={() => setIsLoading(false)}
                onError={() => setError('Failed to load Copy Trading')}
                style={{
                    width: '100%',
                    height: 'calc(100vh - 48px)', // Subtract header height
                    border: 'none',
                    position: 'absolute',
                    top: '48px', // Header height
                    left: 0,
                    right: 0,
                    bottom: 0
                }}
            />
        </div>
    );
};

export default CopyTrading; 