import React, { useEffect } from 'react';

const SmartAnalysis: React.FC = () => {
    useEffect(() => {
   
        const loadContent = async () => {
            try {
                const response = await fetch('/src/pages/htmltools/analysis copy.js');
                const js = await response.text();
                const container = document.getElementById('smart-analysis-container');
                if (container) {
                  
                    const script = document.createElement('script');
                    script.textContent = js;
                    container.appendChild(script);
                }
            } catch (error) {
                console.error('Error loading smart analysis tool:', error);
            }
        };

        loadContent();
    }, []);

    return <div id="smart-analysis-container" className="smart-analysis-wrapper" />;
};

export default SmartAnalysis; 