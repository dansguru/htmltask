import React, { useEffect } from 'react';

const CopyTrading: React.FC = () => {
    useEffect(() => {
      
        const loadContent = async () => {
            try {
                const response = await fetch('/src/pages/htmltools/copytrading.html');
                const html = await response.text();
                const container = document.getElementById('copy-trading-container');
                if (container) {
                    container.innerHTML = html;
                }
            } catch (error) {
                console.error('Error loading copy trading tool:', error);
            }
        };

        loadContent();
    }, []);

    return <div id="copy-trading-container" className="copy-trading-wrapper" />;
};

export default CopyTrading; 