import React, { useEffect } from 'react';

const AnalysisTool: React.FC = () => {
    useEffect(() => {
    
        const loadContent = async () => {
            try {
                const response = await fetch('/src/pages/htmltools/analysis.html');
                const html = await response.text();
                const container = document.getElementById('analysis-tool-container');
                if (container) {
                    container.innerHTML = html;
                }
            } catch (error) {
                console.error('Error loading analysis tool:', error);
            }
        };

        loadContent();
    }, []);

    return <div id="analysis-tool-container" className="analysis-tool-wrapper" />;
};

export default AnalysisTool; 