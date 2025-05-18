import React, { useEffect, useState } from 'react';
import { getAppId } from '@/components/shared/utils/config/config';
import { useAuth } from '@/contexts/AuthContext';
import './styles.css';

const Signal = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [appId, setAppId] = useState<string>('');
    const { isAuthenticated, tokens } = useAuth();

    useEffect(() => {
        const app_id = getAppId();
        setAppId(String(app_id));
    }, []);

    if (!isAuthenticated) {
        return (
            <div className="auth-required">
                <h2>Authentication Required</h2>
                <p>Please log in to use the Signal Trader feature.</p>
            </div>
        );
    }

    return (
        <div className="signal-wrapper">
            {error && <div className="error-message">{error}</div>}
            {isLoading && <div className="loading">Loading Signal Trader...</div>}
            <iframe
                src={`/abcz/layout/signal.html?app_id=${appId}&tokens=${encodeURIComponent(JSON.stringify(tokens))}`}
                className="signal-iframe"
                onLoad={() => setIsLoading(false)}
                onError={() => setError('Failed to load Signal Trader')}
                style={{
                    width: '100%',
                    height: 'calc(100vh - 48px)',
                    border: 'none',
                    position: 'absolute',
                    top: '48px',
                    left: 0,
                    right: 0,
                    bottom: 0
                }}
            />
        </div>
    );
};

export default Signal; 