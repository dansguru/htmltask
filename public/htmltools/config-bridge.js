// Configuration bridge for HTML tools
window.configBridge = {
    // API configuration
    api: {
        baseUrl: process.env.API_URL || 'https://api.deriv.com',
        appId: process.env.APP_ID || '1089',
        getToken: () => localStorage.getItem('token'),
    },

    // WebSocket configuration
    websocket: {
        url: process.env.WS_URL || 'wss://ws.binaryws.com/websockets/v3',
        maxReconnects: 5,
        reconnectInterval: 5000,
        onOpen: () => {
            window.configBridge.updateState({ isConnected: true });
        },
        onClose: () => {
            window.configBridge.updateState({ isConnected: false });
        },
    },

    // Trading configuration
    trading: {
        defaultSymbol: 'R_100',
        defaultDuration: 5,
        defaultAmount: 10,
        getBalance: () => {
            const balance = localStorage.getItem('balance');
            return balance ? parseFloat(balance) : 0;
        },
    },

    // UI configuration
    ui: {
        theme: localStorage.getItem('theme') || 'dark',
        language: localStorage.getItem('language') || 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        updateTheme: (theme) => {
            localStorage.setItem('theme', theme);
            window.configBridge.ui.theme = theme;
            document.documentElement.setAttribute('data-theme', theme);
        },
    },

    // Event handlers
    onError: (error) => {
        console.error('Tool Error:', error);
        // You can integrate with your app's error handling system here
        if (window.app && window.app.showError) {
            window.app.showError(error);
        }
    },

    onSuccess: (data) => {
        console.log('Tool Success:', data);
        // You can integrate with your app's success handling system here
        if (window.app && window.app.showSuccess) {
            window.app.showSuccess(data);
        }
    },

    // Helper functions
    formatPrice: (price) => {
        return parseFloat(price).toFixed(2);
    },

    formatDate: (date) => {
        return new Date(date).toLocaleString();
    },

    // State management
    state: {
        isConnected: false,
        isAuthenticated: false,
        currentSymbol: 'R_100',
        currentPrice: null,
        lastUpdate: null,
    },

    // Update state
    updateState: (newState) => {
        window.configBridge.state = {
            ...window.configBridge.state,
            ...newState,
            lastUpdate: new Date().toISOString(),
        };
        
        // Notify app of state changes
        if (window.app && window.app.onStateChange) {
            window.app.onStateChange(window.configBridge.state);
        }
    },

    // Initialize
    init: () => {
        // Load saved state
        const savedState = localStorage.getItem('toolState');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                window.configBridge.updateState(state);
            } catch (e) {
                console.error('Error loading saved state:', e);
            }
        }

        // Set up state persistence
        window.addEventListener('beforeunload', () => {
            localStorage.setItem('toolState', JSON.stringify(window.configBridge.state));
        });
    },
};

// Initialize the bridge
window.configBridge.init(); 