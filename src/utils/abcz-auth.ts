export const initializeABCZAuth = () => {
    // Listen for messages from iframes
    window.addEventListener('message', (event) => {
        // Verify the origin of the message
        if (event.origin !== window.location.origin) return;

        const { type, data } = event.data;

        if (type === 'ABCZ_AUTH_REQUEST') {
            // Get tokens from localStorage
            const tokens = localStorage.getItem('tokens');
            if (tokens) {
                // Send tokens back to the iframe
                event.source?.postMessage({
                    type: 'ABCZ_AUTH_RESPONSE',
                    data: { tokens: JSON.parse(tokens) }
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
        if (tokens) {
            iframe.contentWindow?.postMessage({
                type: 'ABCZ_AUTH_RESPONSE',
                data: { tokens: JSON.parse(tokens) }
            }, { targetOrigin: window.location.origin });
        }
    });
}; 