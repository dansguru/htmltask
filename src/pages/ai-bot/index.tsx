import React, { useEffect, useState } from 'react';
import { getAppId } from '@/components/shared/utils/config/config';
import { useAuth } from '@/contexts/AuthContext';
import './styles.css';

const AIBot = () => {
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
                <p>Please log in to use the AI Bot feature.</p>
            </div>
        );
    }

    return (
        <div className="ai-bot-wrapper">
            {error && <div className="error-message">{error}</div>}
            {isLoading && <div className="loading">Loading AI Bot...</div>}
            <iframe
                src={`/abcz/layout/thebot.html?app_id=${appId}&tokens=${encodeURIComponent(JSON.stringify(tokens))}`}
                className="ai-bot-iframe"
                onLoad={() => setIsLoading(false)}
                onError={() => setError('Failed to load AI Bot')}
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

export default AIBot; 