import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import { Localize } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';
import ChunkLoader from '@/components/loader/chunk-loader';
import { LabelPairedChartLineCaptionRegularIcon } from '@deriv/quill-icons/LabelPaired';

interface AnalysisToolProps {
    onTabChange?: (index: number) => void;
}

const AnalysisTool = observer(({ onTabChange }: AnalysisToolProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isDesktop } = useDevice();
    const { dashboard } = useStore();

    useEffect(() => {
        const loadScripts = async () => {
            try {
                console.log('Loading Analysis Tool scripts...');
                
                // Load required scripts
                const configScript = document.createElement('script');
                configScript.src = `${window.location.origin}/htmltools/config-bridge.js`;
                console.log('Loading config script from:', configScript.src);
                document.body.appendChild(configScript);

                const analysisScript = document.createElement('script');
                analysisScript.src = `${window.location.origin}/htmltools/analysis.js`;
                console.log('Loading analysis script from:', analysisScript.src);
                document.body.appendChild(analysisScript);

                // Load HTML content
                const htmlUrl = `${window.location.origin}/htmltools/analysis.html`;
                console.log('Loading HTML content from:', htmlUrl);
                const response = await fetch(htmlUrl);
                
                if (!response.ok) {
                    throw new Error(`Failed to load analysis tool: ${response.status} ${response.statusText}`);
                }
                
                const content = await response.text();
                console.log('HTML content loaded successfully');
                
                const container = document.getElementById('analysis-tool-container');
                if (container) {
                    container.innerHTML = content;
                    setIsLoading(false);
                    console.log('Analysis Tool loaded successfully');
                } else {
                    throw new Error('Container element not found');
                }
            } catch (err) {
                console.error('Error loading Analysis Tool:', err);
                setError(err instanceof Error ? err.message : 'An error occurred');
                setIsLoading(false);
            }
        };

        loadScripts();

        return () => {
            console.log('Cleaning up Analysis Tool scripts...');
            const scripts = document.querySelectorAll('script[src*="htmltools"]');
            scripts.forEach(script => script.remove());
        };
    }, []);

    if (isLoading) {
        return <ChunkLoader message='Loading Analysis Tool...' />;
    }

    if (error) {
        return (
            <div className='error-message'>
                <Localize i18n_default_text='Error loading Analysis Tool: {{error}}' values={{ error }} />
            </div>
        );
    }

    return (
        <div className='analysis-tool-wrapper'>
            <div className='analysis-tool-header'>
                <LabelPairedChartLineCaptionRegularIcon
                    height='24px'
                    width='24px'
                    fill='var(--text-general)'
                />
                <h2><Localize i18n_default_text='Analysis Tool' /></h2>
            </div>
            <div id='analysis-tool-container' className='analysis-tool-content' />
        </div>
    );
});

export default AnalysisTool; 