import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import { Localize, localize } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';
import ChunkLoader from '@/components/loader/chunk-loader';

const CopyTrading: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isDesktop } = useDevice();
    const { dashboard } = useStore();

    useEffect(() => {
        const loadContent = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/htmltools/copytrading.html');
                if (!response.ok) {
                    throw new Error('Failed to load copy trading tool');
                }
                const html = await response.text();
                const container = document.getElementById('copy-trading-container');
                if (container) {
                    container.innerHTML = html;
                }
                setIsLoading(false);
            } catch (error) {
                console.error('Error loading copy trading tool:', error);
                setError('Failed to load copy trading tool. Please try again later.');
                setIsLoading(false);
            }
        };

        loadContent();
    }, []);

    if (isLoading) {
        return <ChunkLoader message='Loading Copy Trading...' />;
    }

    if (error) {
        return (
            <div className='copy-trading-error'>
                <Localize i18n_default_text={error} />
            </div>
        );
    }

    return (
        <div className='copy-trading-wrapper'>
            <div id='copy-trading-container' className='copy-trading-content' />
        </div>
    );
};

export default observer(CopyTrading); 