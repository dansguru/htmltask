import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import { Localize } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';
import ChunkLoader from '@/components/loader/chunk-loader';
import { LabelPairedChartLineCaptionRegularIcon } from '@deriv/quill-icons/LabelPaired';

interface CopyTradingProps {
    onTabChange?: (index: number) => void;
}

const CopyTrading = observer(({ onTabChange }: CopyTradingProps) => {
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

                // Load HTML content
                const response = await fetch('/htmltools/copytrading.html');
                if (!response.ok) {
                    throw new Error('Failed to load copy trading tool');
                }
                const content = await response.text();
                const container = document.getElementById('copy-trading-container');
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
        return <ChunkLoader message='Loading Copy Trading...' />;
    }

    if (error) {
        return (
            <div className='error-message'>
                <Localize i18n_default_text='Error loading Copy Trading: {{error}}' values={{ error }} />
            </div>
        );
    }

    return (
        <div className='copy-trading-wrapper'>
            <div className='copy-trading-header'>
                <LabelPairedChartLineCaptionRegularIcon
                    height='24px'
                    width='24px'
                    fill='var(--text-general)'
                />
                <h2><Localize i18n_default_text='Copy Trading' /></h2>
            </div>
            <div id='copy-trading-container' className='copy-trading-content' />
        </div>
    );
});

export default CopyTrading; 