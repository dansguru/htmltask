import React, { useEffect, useRef, useState } from 'react';
import './splash-screen.scss';

const SplashScreen: React.FC = () => {
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [features] = useState([
        "Analysis Tool",
        "Trading Bots",
        "Copy Trading"
    ]);

    // Loading bar animation
    useEffect(() => {
        const interval = setInterval(() => {
            setLoadingProgress(prev => {
                if (prev >= 100) return 100;
                return prev + 1;
            });
        }, 50); // Completes in 5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className='splash-screen'>
            <div className='container'>
                <div className='logo'>DTMARKET</div>
                <div className='tagline'>TRADING PLATFORM</div>
                <h2>Welcome to GeetTrader</h2>
                <p className='subtitle'>Your trusted trading application</p>

                <div className='progress-bar-container'>
                    <div className='progress-bar' style={{ width: `${loadingProgress}%` }}></div>
                </div>
                <div className='status'>✔ Ready to take your trade to the Next Level</div>

                <div className='features'>
                    {features.map((feature, index) => (
                        <div className='feature' key={index}>
                            <div className='circle'></div>
                            <div>{feature}</div>
                        </div>
                    ))}
                </div>

                <div className='footer'>Making trading smooth, simple, and stress-free</div>
            </div>
        </div>
    );
};

export default SplashScreen;