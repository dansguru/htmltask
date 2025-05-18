import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { setupABCZIframe } from '@/utils/abcz-auth';
import { getAppId } from '@/components/shared/utils/config/config';
import LoginButton from '@/components/shared/LoginButton';
import '@/components/shared/LoginButton.css';
import './styles.css';

const AIBot: React.FC = () => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const { isAuthenticated, tokens, login } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [appId, setAppId] = useState<string | null>(null);
    const [showLoginOverlay, setShowLoginOverlay] = useState(false);

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
            
            // Listen for auth events
            const handleAuthRequired = () => {
                setShowLoginOverlay(true);
            };
            
            document.addEventListener('abcz_auth_required', handleAuthRequired);
            
            return () => {
                cleanup?.();
                document.removeEventListener('abcz_auth_required', handleAuthRequired);
            };
        }
    }, [appId]);

    if (!isAuthenticated) {
        return (
            <div className="auth-required">
                <h2>Authentication Required</h2>
                <p>Please log in to use the AI Bot.</p>
                <LoginButton />
            </div>
        );
    }

    if (loading) {
        return <div className="loading">Loading AI Bot...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="ai-bot-container">
            {showLoginOverlay && (
                <div className="auth-required-overlay">
                    <h2>Session Expired</h2>
                    <p>Your session has expired or you have been logged out. Please log in again to continue using the AI Bot.</p>
                    <LoginButton />
                </div>
            )}
            <iframe
                ref={iframeRef}
                src={`/abcz/layout/thebot.html?app_id=${appId}&tokens=${encodeURIComponent(JSON.stringify(tokens))}`}
                className="ai-bot-iframe"
                title="AI Bot"
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

export default AIBot; 