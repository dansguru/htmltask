import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import { Localize, localize } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';
import ChunkLoader from '@/components/loader/chunk-loader';

const AnalysisTool: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isDesktop } = useDevice();
    const { dashboard } = useStore();

    useEffect(() => {
        const loadContent = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/htmltools/analysis.html');
                if (!response.ok) {
                    throw new Error('Failed to load analysis tool');
                }
                const html = await response.text();
                const container = document.getElementById('analysis-tool-container');
                if (container) {
                    container.innerHTML = html;
                }
                setIsLoading(false);
            } catch (error) {
                console.error('Error loading analysis tool:', error);
                setError('Failed to load analysis tool. Please try again later.');
                setIsLoading(false);
            }
        };

        loadContent();
    }, []);

    if (isLoading) {
        return <ChunkLoader message='Loading Analysis Tool...' />;
    }

    if (error) {
        return (
            <div className='analysis-tool-error'>
                <Localize i18n_default_text={error} />
            </div>
        );
    }

    return (
        <div className='analysis-tool-wrapper'>
            <div id='analysis-tool-container' className='analysis-tool-content' />
        </div>
    );
};

export default observer(AnalysisTool); 