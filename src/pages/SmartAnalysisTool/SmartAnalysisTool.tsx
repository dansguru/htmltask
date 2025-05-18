import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { setupABCZIframe } from '@/utils/abcz-auth';
import { getAppId } from '@/components/shared/utils/config/config';
import { useDevice } from '@deriv-com/ui';
import './styles.css';

const SmartAnalysisTool: React.FC = () => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const { isAuthenticated, tokens } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [appId, setAppId] = useState<string | null>(null);
    const { isMobile } = useDevice();

    // Debug auth state
    useEffect(() => {
        console.log('SmartAnalysisTool: Auth state', { isAuthenticated, tokensExist: !!tokens, tokensLength: tokens?.length });
    }, [isAuthenticated, tokens]);

    useEffect(() => {
        const fetchAppId = async () => {
            try {
                const id = await getAppId();
                setAppId(String(id));
                console.log('SmartAnalysisTool: AppId fetched', id);
            } catch (err) {
                setError('Failed to load application ID');
                console.error('Error fetching app ID:', err);
            }
        };
        fetchAppId();
    }, []);

    useEffect(() => {
        if (iframeRef.current && appId) {
            console.log('SmartAnalysisTool: Setting up iframe with appId', appId);
            const cleanup = setupABCZIframe(iframeRef.current);
            setLoading(false);
            return () => {
                console.log('SmartAnalysisTool: Cleaning up iframe');
                cleanup();
            };
        }
    }, [appId]);

    if (loading) {
        console.log('SmartAnalysisTool: Still loading...', { appId, hasIframe: !!iframeRef.current });
        return <div className="loading">Loading Smart Analysis Tool...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    console.log('SmartAnalysisTool: Rendering iframe with tokens', tokens);
    return (
        <div className="smart-analysis-container">
            <iframe
                ref={iframeRef}
                src={`/abcz/layout/analysis.html?app_id=${appId}&tokens=${encodeURIComponent(JSON.stringify(tokens || []))}`}
                className="smart-analysis-iframe"
                title="Smart Analysis Tool"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
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