export const initializeABCZAuth = () => {
    // Create a broadcast channel for cross-tool communication
    const broadcastChannel = new BroadcastChannel('deriv_auth_channel');
    
    // Listen for messages from iframes
    window.addEventListener('message', (event) => {
        // Verify it's a message we care about
        if (!event.data || typeof event.data !== 'object') return;

        const { type, data } = event.data;

        if (type === 'ABCZ_AUTH_REQUEST') {
            // Get tokens and other auth data from localStorage
            const tokens = localStorage.getItem('tokens');
            const clientId = localStorage.getItem('client_id');
            const activeLoginId = localStorage.getItem('active_loginid');

            if (tokens && (clientId || activeLoginId)) {
                // Send tokens back to the iframe
                event.source?.postMessage({
                    type: 'ABCZ_AUTH_RESPONSE',
                    data: { 
                        tokens: JSON.parse(tokens),
                        clientId,
                        activeLoginId
                    }
                }, { targetOrigin: '*' });
                
                // Also use the format from dashboard.js
                event.source?.postMessage({
                    authorize: JSON.parse(tokens),
                    login_id: activeLoginId,
                    client_id: clientId
                }, { targetOrigin: '*' });
            }
        } else if (type === 'ABCZ_LOGIN_REQUEST') {
            // Trigger auth required event for AuthWrapper to handle
            const authRequiredEvent = new Event('abcz_auth_required');
            document.dispatchEvent(authRequiredEvent);
        } else if (type === 'ABCZ_LOGOUT') {
            // Clear auth data and reload
            localStorage.removeItem('tokens');
            localStorage.removeItem('active_loginid');
            localStorage.removeItem('client_id');
            window.location.reload();
        } else if (type === 'ABCZ_AUTH_STATUS_UPDATE') {
            // Notify all tools about auth status change
            broadcastChannel.postMessage({ type: 'auth_update' });
            
            // Notify all iframes
            broadcastAuthStateToAllIframes();
        }
    });
    
    // Listen for broadcast channel messages
    broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'auth_update') {
            broadcastAuthStateToAllIframes();
        }
    };
    
    // Function to broadcast auth state to all iframes
    function broadcastAuthStateToAllIframes() {
        const tokens = localStorage.getItem('tokens');
        const clientId = localStorage.getItem('client_id');
        const activeLoginId = localStorage.getItem('active_loginid');
        
        if (tokens && (clientId || activeLoginId)) {
            const tokensObj = JSON.parse(tokens);
            
            // Find all iframes and send them the auth data
            const iframes = document.querySelectorAll('iframe');
            iframes.forEach(iframe => {
                if (iframe.contentWindow) {
                    iframe.contentWindow.postMessage({
                        type: 'ABCZ_AUTH_UPDATE',
                        data: { 
                            tokens: tokensObj,
                            clientId,
                            activeLoginId
                        }
                    }, { targetOrigin: '*' });
                    
                    // Also use the format from dashboard.js
                    iframe.contentWindow.postMessage({
                        authorize: tokensObj,
                        login_id: activeLoginId,
                        client_id: clientId
                    }, { targetOrigin: '*' });
                }
            });
        }
    }
    
    // Try to read app_id from the config
    function getAppIdFromConfig() {
        try {
            // Try to fetch from abcz/config.json
            const xhr = new XMLHttpRequest();
            xhr.open('GET', '/abcz/config.json', false); // Synchronous request
            xhr.send(null);
            
            if (xhr.status === 200) {
                const config = JSON.parse(xhr.responseText);
                return config.app_id || "76128";
            }
        } catch (e) {
            console.error("Error reading app_id from config:", e);
        }
        
        return "76128"; // Default app_id
    }
    
    // Initial auth state broadcast
    setTimeout(broadcastAuthStateToAllIframes, 500);
    
    // Return cleanup function
    return () => {
        broadcastChannel.close();
    };
};

export const setupABCZIframe = (iframe: HTMLIFrameElement) => {
    // Create a broadcast channel for cross-tool communication
    const broadcastChannel = new BroadcastChannel('deriv_auth_channel');
    
    console.log('setupABCZIframe: Starting iframe setup');
    
    // Create cleanup function for event listeners
    const cleanupFns: (() => void)[] = [];
    
    // Add event listener for iframe load
    const onLoad = () => {
        console.log('setupABCZIframe: iframe loaded');
        sendAuthStateToIframe(iframe);
    };
    
    // Function to send auth state to a specific iframe
    const sendAuthStateToIframe = (iframe: HTMLIFrameElement) => {
        if (!iframe.contentWindow) {
            console.error('setupABCZIframe: No contentWindow available');
            return;
        }
        
        console.log('setupABCZIframe: Sending auth state to iframe');
        
        // Send initial auth state
        const tokens = localStorage.getItem('tokens');
        const authToken = localStorage.getItem('authToken');
        const clientId = localStorage.getItem('client_id');
        const activeLoginId = localStorage.getItem('active_loginid');

        console.log('setupABCZIframe: Auth data:', { 
            hasTokens: !!tokens, 
            hasAuthToken: !!authToken,
            hasClientId: !!clientId, 
            hasActiveLoginId: !!activeLoginId 
        });

        // First check the new format
        if (tokens && (clientId || activeLoginId)) {
            try {
                const tokensObj = JSON.parse(tokens);
                console.log('setupABCZIframe: Sending tokens object to iframe');
                
                iframe.contentWindow.postMessage({
                    type: 'ABCZ_AUTH_RESPONSE',
                    data: { 
                        tokens: tokensObj,
                        clientId,
                        activeLoginId
                    }
                }, '*');
                
                // Also simulate the format used in dashboard.js for compatibility
                iframe.contentWindow.postMessage({
                    authorize: tokensObj,
                    login_id: activeLoginId,
                    client_id: clientId
                }, '*');
                
                return;
            } catch (e) {
                console.error("Error parsing tokens during iframe setup:", e);
            }
        }
        
        // Then try the legacy format as fallback
        if (authToken && activeLoginId) {
            try {
                console.log('setupABCZIframe: Using legacy token format');
                
                // Create compatible tokens object
                const tokensObj: Record<string, string> = {};
                tokensObj[activeLoginId] = authToken;
                
                iframe.contentWindow.postMessage({
                    type: 'ABCZ_AUTH_RESPONSE',
                    data: { 
                        tokens: tokensObj,
                        clientId: activeLoginId,
                        activeLoginId
                    }
                }, '*');
                
                // Also simulate the format used in dashboard.js for compatibility
                iframe.contentWindow.postMessage({
                    authorize: tokensObj,
                    login_id: activeLoginId,
                    client_id: activeLoginId
                }, '*');
                
                return;
            } catch (e) {
                console.error("Error sending legacy tokens to iframe:", e);
            }
        }
        
        // If we got here, we don't have valid auth data
        console.log('setupABCZIframe: No valid auth data found, triggering auth required event');
        
        // Trigger auth required event for AuthWrapper to handle
        const authRequiredEvent = new Event('abcz_auth_required');
        document.dispatchEvent(authRequiredEvent);
    };
    
    iframe.addEventListener('load', onLoad);
    cleanupFns.push(() => iframe.removeEventListener('load', onLoad));

    // Listen for auth changes in localStorage
    const handleStorageChange = (e: StorageEvent) => {
        if ((e.key === 'tokens' || e.key === 'client_id' || e.key === 'active_loginid' || e.key === 'authToken')) {
            console.log('setupABCZIframe: Auth storage changed, updating iframe');
            sendAuthStateToIframe(iframe);
            
            // Also notify other components via broadcast
            broadcastChannel.postMessage({ type: 'auth_update' });
        }
    };

    window.addEventListener('storage', handleStorageChange);
    cleanupFns.push(() => window.removeEventListener('storage', handleStorageChange));
    
    // Listen for broadcast messages
    const handleBroadcastMessage = (event: MessageEvent) => {
        if (event.data?.type === 'auth_update') {
            console.log('setupABCZIframe: Received auth update broadcast');
            sendAuthStateToIframe(iframe);
        }
    };
    
    broadcastChannel.onmessage = handleBroadcastMessage;
    cleanupFns.push(() => broadcastChannel.close());
    
    // Also listen for auth-related window messages
    const handleWindowMessage = (event: MessageEvent) => {
        console.log('setupABCZIframe: Received window message', event.data?.type);
        
        if (event.data?.type === 'auth' || 
            event.data?.type === 'login' || 
            event.data?.type === 'logout' ||
            event.data?.authorize) {
            sendAuthStateToIframe(iframe);
        } else if (event.data?.type === 'ABCZ_LOGIN_REQUEST') {
            // Trigger auth required event for AuthWrapper to handle
            console.log('setupABCZIframe: Received login request from iframe');
            const authRequiredEvent = new Event('abcz_auth_required');
            document.dispatchEvent(authRequiredEvent);
        }
    };
    
    window.addEventListener('message', handleWindowMessage);
    cleanupFns.push(() => window.removeEventListener('message', handleWindowMessage));
    
    // Send auth state immediately
    console.log('setupABCZIframe: Sending initial auth state');
    setTimeout(() => sendAuthStateToIframe(iframe), 100);

    // Return cleanup function to remove event listeners
    return () => {
        console.log('setupABCZIframe: Cleaning up listeners');
        cleanupFns.forEach(fn => fn());
    };
}; 