import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { setupABCZIframe } from '@/utils/abcz-auth';
import { getAppId } from '@/components/shared/utils/config/config';
import './styles.css';

const CopyTrading: React.FC = () => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const { isAuthenticated, tokens } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [appId, setAppId] = useState<string | null>(null);

    useEffect(() => {
        const fetchAppId = async () => {
            try {
                const id = await getAppId();
                setAppId(String(id));
            } catch (err) {
                setError('Failed to load application ID');
                console.error('Error fetching app ID:', err);
            }
        };
        fetchAppId();
    }, []);

    useEffect(() => {
        if (iframeRef.current && appId) {
            const cleanup = setupABCZIframe(iframeRef.current);
            setLoading(false);
            return () => {
                cleanup?.();
            };
        }
    }, [appId]);

    if (loading) {
        return <div className="loading">Loading Copy Trading...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="copy-trading-container">
            <iframe
                ref={iframeRef}
                src={`/abcz/layout/copytrading.html?app_id=${appId}&tokens=${encodeURIComponent(JSON.stringify(tokens))}`}
                className="copy-trading-iframe"
                title="Copy Trading"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
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