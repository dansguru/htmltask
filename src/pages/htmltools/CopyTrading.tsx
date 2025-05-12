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
                console.log('Loading Copy Trading scripts...');
                
                // Load required scripts
                const configScript = document.createElement('script');
                configScript.src = `${window.location.origin}/htmltools/config-bridge.js`;
                console.log('Loading config script from:', configScript.src);
                document.body.appendChild(configScript);

                const copyTradingScript = document.createElement('script');
                copyTradingScript.src = `${window.location.origin}/htmltools/copytrading.js`;
                console.log('Loading copy trading script from:', copyTradingScript.src);
                document.body.appendChild(copyTradingScript);

                // Load HTML content
                const htmlUrl = `${window.location.origin}/htmltools/copytrading.html`;
                console.log('Loading HTML content from:', htmlUrl);
                const response = await fetch(htmlUrl);
                
                if (!response.ok) {
                    throw new Error(`Failed to load copy trading tool: ${response.status} ${response.statusText}`);
                }
                
                const content = await response.text();
                console.log('HTML content loaded successfully');
                
                const container = document.getElementById('copy-trading-container');
                if (container) {
                    container.innerHTML = content;
                    setIsLoading(false);
                    console.log('Copy Trading loaded successfully');
                } else {
                    throw new Error('Container element not found');
                }
            } catch (err) {
                console.error('Error loading Copy Trading:', err);
                setError(err instanceof Error ? err.message : 'An error occurred');
                setIsLoading(false);
            }
        };

        loadScripts();

        return () => {
            console.log('Cleaning up Copy Trading scripts...');
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