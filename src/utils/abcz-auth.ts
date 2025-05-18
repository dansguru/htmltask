export const initializeABCZAuth = () => {
    // Listen for messages from iframes
    window.addEventListener('message', (event) => {
        // Verify the origin of the message is from the same origin
        // This is important because the iframes are loaded from the same origin
        if (event.origin !== window.location.origin) return;

        const { type, data } = event.data;

        if (type === 'ABCZ_AUTH_REQUEST') {
            // Get tokens and other auth data from localStorage
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
        } else if (type === 'ABCZ_LOGIN_REQUEST') {
            // Trigger login flow
            const app_id = localStorage.getItem('config.app_id') || "76128";
            window.location.href = `https://oauth.deriv.com/oauth2/authorize?app_id=${app_id}`;
        } else if (type === 'ABCZ_LOGOUT') {
            // Clear auth data and reload
            localStorage.removeItem('tokens');
            localStorage.removeItem('active_loginid');
            localStorage.removeItem('client_id');
            window.location.reload();
        }
    });
};

export const setupABCZIframe = (iframe: HTMLIFrameElement) => {
    // Create cleanup function for event listeners
    const cleanupFns: (() => void)[] = [];
    
    // Add event listener for iframe load
    const onLoad = () => {
        // Send initial auth state
        const tokens = localStorage.getItem('tokens');
        const clientId = localStorage.getItem('client_id');
        const activeLoginId = localStorage.getItem('active_loginid');

        if (tokens && clientId && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: 'ABCZ_AUTH_RESPONSE',
                data: { 
                    tokens: JSON.parse(tokens),
                    clientId,
                    activeLoginId
                }
            }, window.location.origin);
            
            // Also simulate the format used in dashboard.js for compatibility
            iframe.contentWindow.postMessage({
                authorize: JSON.parse(tokens),
                login_id: activeLoginId,
                client_id: clientId
            }, window.location.origin);
        }
    };
    
    iframe.addEventListener('load', onLoad);
    cleanupFns.push(() => iframe.removeEventListener('load', onLoad));

    // Listen for auth changes in localStorage
    const handleStorageChange = (e: StorageEvent) => {
        if ((e.key === 'tokens' || e.key === 'client_id' || e.key === 'active_loginid') && 
            iframe.contentWindow) {
            
            const tokens = localStorage.getItem('tokens');
            const clientId = localStorage.getItem('client_id');
            const activeLoginId = localStorage.getItem('active_loginid');

            if (tokens && clientId) {
                iframe.contentWindow.postMessage({
                    type: 'ABCZ_AUTH_UPDATE',
                    data: { 
                        tokens: JSON.parse(tokens),
                        clientId,
                        activeLoginId
                    }
                }, window.location.origin);
                
                // Also simulate the format used in dashboard.js for compatibility
                iframe.contentWindow.postMessage({
                    authorize: JSON.parse(tokens),
                    login_id: activeLoginId,
                    client_id: clientId
                }, window.location.origin);
            } else {
                // Send auth required message if tokens are removed
                iframe.contentWindow.postMessage({
                    type: 'ABCZ_AUTH_REQUIRED'
                }, window.location.origin);
                
                // Trigger a custom event that components can listen for
                const authRequiredEvent = new Event('abcz_auth_required');
                document.dispatchEvent(authRequiredEvent);
            }
        }
    };

    window.addEventListener('storage', handleStorageChange);
    cleanupFns.push(() => window.removeEventListener('storage', handleStorageChange));

    // Return cleanup function to remove event listeners
    return () => {
        cleanupFns.forEach(fn => fn());
    };
}; 