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
                // Load required scripts
                const configScript = document.createElement('script');
                configScript.src = '/htmltools/config-bridge.js';
                document.body.appendChild(configScript);

                const analysisScript = document.createElement('script');
                analysisScript.src = '/htmltools/analysis.js';
                document.body.appendChild(analysisScript);

                // Load HTML content
                const response = await fetch('/htmltools/analysis.html');
                if (!response.ok) {
                    throw new Error('Failed to load analysis tool');
                }
                const content = await response.text();
                const container = document.getElementById('analysis-tool-container');
                if (container) {
                    container.innerHTML = content;
                    setIsLoading(false);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                setIsLoading(false);
            }
        };

        loadScripts();

        return () => {
            // Cleanup scripts when component unmounts
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