import React, { useEffect, useState, useRef } from 'react';
import { getAppId } from '@/components/shared/utils/config/config';
import { useAuth } from '@/contexts/AuthContext';
import { setupABCZIframe } from '@/utils/abcz-auth';
import './styles.css';

const CopyTrading = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [appId, setAppId] = useState<string>('');
    const { isAuthenticated, tokens } = useAuth();
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        const app_id = getAppId();
        setAppId(String(app_id));
    }, []);

    useEffect(() => {
        if (iframeRef.current) {
            setupABCZIframe(iframeRef.current);
        }
    }, []);

    if (!isAuthenticated) {
        return (
            <div className="auth-required">
                <h2>Authentication Required</h2>
                <p>Please log in to use the Copy Trading feature.</p>
            </div>
        );
    }

    return (
        <div className="copy-trading-wrapper">
            {error && <div className="error-message">{error}</div>}
            {isLoading && <div className="loading">Loading Copy Trading...</div>}
            <iframe
                ref={iframeRef}
                src={`/abcz/layout/copytrading.html?app_id=${appId}&tokens=${encodeURIComponent(JSON.stringify(tokens))}`}
                className="copy-trading-iframe"
                onLoad={() => setIsLoading(false)}
                onError={() => setError('Failed to load Copy Trading')}
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

export default CopyTrading; 