export const initializeABCZAuth = () => {
    // Listen for messages from iframes
    window.addEventListener('message', (event) => {
        // Verify the origin of the message
        if (event.origin !== window.location.origin) return;

        const { type, data } = event.data;

        if (type === 'ABCZ_AUTH_REQUEST') {
            // Get tokens from localStorage
            const tokens = localStorage.getItem('tokens');
            const clientId = localStorage.getItem('client_id');
            const activeLoginId = localStorage.getItem('active_loginid');

            if (tokens && clientId) {
                // Send tokens back to the iframe
                event.source?.postMessage({
                    type: 'ABCZ_AUTH_RESPONSE',
                    data: { 
                        tokens: JSON.parse(tokens),
                        clientId,
                        activeLoginId
                    }
                }, { targetOrigin: event.origin });
            }
        }
    });
};

export const setupABCZIframe = (iframe: HTMLIFrameElement) => {
    // Add event listener for iframe load
    iframe.addEventListener('load', () => {
        // Send initial auth state
        const tokens = localStorage.getItem('tokens');
        const clientId = localStorage.getItem('client_id');
        const activeLoginId = localStorage.getItem('active_loginid');

        if (tokens && clientId) {
            iframe.contentWindow?.postMessage({
                type: 'ABCZ_AUTH_RESPONSE',
                data: { 
                    tokens: JSON.parse(tokens),
                    clientId,
                    activeLoginId
                }
            }, { targetOrigin: window.location.origin });
        }
    });

    // Listen for auth changes
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'tokens' || e.key === 'client_id' || e.key === 'active_loginid') {
            const tokens = localStorage.getItem('tokens');
            const clientId = localStorage.getItem('client_id');
            const activeLoginId = localStorage.getItem('active_loginid');

            if (tokens && clientId) {
                iframe.contentWindow?.postMessage({
                    type: 'ABCZ_AUTH_UPDATE',
                    data: { 
                        tokens: JSON.parse(tokens),
                        clientId,
                        activeLoginId
                    }
                }, { targetOrigin: window.location.origin });
            }
        }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
}; 