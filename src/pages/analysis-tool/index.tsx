import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { setupABCZIframe } from '@/utils/abcz-auth';
import { getAppId } from '@/components/shared/utils/config/config';
import './styles.css';

const AnalysisTool: React.FC = () => {
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
            setupABCZIframe(iframeRef.current);
            setLoading(false);
        }
    }, [appId]);

    if (!isAuthenticated) {
        return (
            <div className="auth-required">
                <h2>Authentication Required</h2>
                <p>Please log in to use the Analysis Tool.</p>
            </div>
        );
    }

    if (loading) {
        return <div className="loading">Loading Analysis Tool...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="analysis-tool-container">
            <iframe
                ref={iframeRef}
                src={`https://analysis-tool.abcz.com?app_id=${appId}&tokens=${encodeURIComponent(JSON.stringify(tokens))}`}
                className="analysis-tool-iframe"
                title="Analysis Tool"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    );
};

export default AnalysisTool;
