import React, { useEffect, useState, useRef } from 'react';
import { getAppId } from '@/components/shared/utils/config/config';
import { useAuth } from '@/contexts/AuthContext';
import { setupABCZIframe } from '@/utils/abcz-auth';
import { useDevice } from '@deriv-com/ui';
import './styles.css';

const SmartAnalysisTool = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [appId, setAppId] = useState<string>('');
    const { isAuthenticated, tokens } = useAuth();
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const { isMobile } = useDevice();

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
                <p>Please log in to use the Smart Analysis Tool.</p>
            </div>
        );
    }

    return (
        <div className="smart-analysis-wrapper">
            {error && <div className="error-message">{error}</div>}
            {isLoading && <div className="loading">Loading Smart Analysis Tool...</div>}
            <iframe
                ref={iframeRef}
                src={`/abcz/layout/analysis.html?app_id=${appId}&tokens=${encodeURIComponent(JSON.stringify(tokens))}`}
                className="smart-analysis-iframe"
                onLoad={() => setIsLoading(false)}
                onError={() => setError('Failed to load Smart Analysis Tool')}
                style={{
                    width: '100%',
                    height: isMobile ? 'calc(100vh - 96px)' : 'calc(100vh - 48px)',
                    border: 'none',
                    position: 'absolute',
                    top: isMobile ? '96px' : '48px',
                    left: 0,
                    right: 0,
                    bottom: 0
                }}
            />
        </div>
    );
};

export default SmartAnalysisTool;