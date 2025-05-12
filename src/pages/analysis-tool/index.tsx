import React, { useEffect, useState } from 'react';
import { getAppId } from '@/components/shared/utils/config/config';
import './styles.css';

const AnalysisTool = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [appId, setAppId] = useState<string>('');
    const [isFullScreen, setIsFullScreen] = useState(false);

    useEffect(() => {
        const app_id = getAppId();
        setAppId(String(app_id));
    }, []);

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    return (
        <div className={`analysis-tool-wrapper ${isFullScreen ? 'fullscreen' : ''}`}>
            <div className="tool-controls">
                <button 
                    onClick={toggleFullScreen}
                    className="fullscreen-toggle"
                >
                    {isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
                </button>
            </div>
            {error && <div className="error-message">{error}</div>}
            {isLoading && <div className="loading">Loading Analysis Tool...</div>}
            <iframe
                src={`/abcz/layout/tool.html?app_id=${appId}`}
                className="analysis-tool-iframe"
                onLoad={() => setIsLoading(false)}
                onError={() => setError('Failed to load Analysis Tool')}
                style={{
                    width: '100%',
                    height: isFullScreen ? '100vh' : 'calc(100vh - 48px)',
                    border: 'none',
                    position: isFullScreen ? 'fixed' : 'absolute',
                    top: isFullScreen ? 0 : '48px',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: isFullScreen ? 9999 : 'auto',
                    backgroundColor: '#121212'
                }}
            />
        </div>
    );
};

export default AnalysisTool;
