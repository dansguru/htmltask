import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAppId } from '@/components/shared/utils/config/config';

interface AuthContextType {
    isAuthenticated: boolean;
    tokens: string[];
    activeLoginId: string;
    setTokens: (tokens: string[]) => void;
    setActiveLoginId: (loginId: string) => void;
    login: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [tokens, setTokens] = useState<string[]>([]);
    const [activeLoginId, setActiveLoginId] = useState('');
    const [authChecked, setAuthChecked] = useState(false);

    const login = () => {
        const app_id = getAppId();
        // Store current path to redirect back after login
        sessionStorage.setItem('redirect_after_login', window.location.href);
        window.location.href = `https://oauth.deriv.com/oauth2/authorize?app_id=${app_id}`;
    };

    // This effect runs only once on mount to check for previous login
    useEffect(() => {
        console.log('AuthContext: Initial check for OAuth redirect');
        // Check for redirect from OAuth
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        
        if (code) {
            console.log('AuthContext: OAuth code found in URL');
            // We have a successful OAuth redirect, store it
            localStorage.setItem('deriv_auth_code', code);
            
            // Clean the URL and redirect to the original path if available
            const redirectPath = sessionStorage.getItem('redirect_after_login') || window.location.pathname;
            sessionStorage.removeItem('redirect_after_login');
            
            // Remove query params and redirect
            window.history.replaceState({}, document.title, window.location.pathname);
            if (redirectPath !== window.location.href) {
                window.location.href = redirectPath;
            }
        }
    }, []);

    useEffect(() => {
        console.log('AuthContext: Checking existing authentication');
        // Check for existing tokens in localStorage
        const checkAuth = () => {
            const storedTokens = localStorage.getItem('tokens');
            const activeLoginId = localStorage.getItem('active_loginid');
            const clientId = localStorage.getItem('client_id');
            const authToken = localStorage.getItem('authToken');
            
            // Debug info
            console.log("Auth check:", { 
                storedTokens: !!storedTokens, 
                activeLoginId: !!activeLoginId, 
                clientId: !!clientId,
                authToken: !!authToken
            });
            
            // Try new format tokens first
            if (storedTokens && (clientId || activeLoginId)) {
                try {
                    const tokensObj = JSON.parse(storedTokens);
                    const tokensArray = Object.values(tokensObj).map(token => String(token));
                    console.log('AuthContext: Setting tokens from stored tokens object', tokensArray.length);
                    setTokens(tokensArray);
                    setIsAuthenticated(true);
                    if (activeLoginId) {
                        setActiveLoginId(activeLoginId);
                    }
                    
                    // Broadcast auth state to any ABCZ iframes in the page
                    broadcastAuthState(tokensObj, clientId, activeLoginId);
                    setAuthChecked(true);
                    return;
                } catch (error) {
                    console.error('Error parsing tokens:', error);
                }
            }
            
            // Try legacy authToken as fallback
            if (authToken && activeLoginId) {
                try {
                    console.log('AuthContext: Setting token from authToken');
                    setTokens([authToken]);
                    setIsAuthenticated(true);
                    setActiveLoginId(activeLoginId);
                    
                    // Create compatible tokens format and store it
                    const tokensObj: Record<string, string> = {};
                    tokensObj[activeLoginId] = authToken;
                    localStorage.setItem('tokens', JSON.stringify(tokensObj));
                    
                    // Broadcast auth state
                    broadcastAuthState(tokensObj, activeLoginId, activeLoginId);
                    setAuthChecked(true);
                    return;
                } catch (error) {
                    console.error('Error handling legacy token:', error);
                }
            }
            
            console.log('AuthContext: No valid tokens found');
            setTokens([]);
            setIsAuthenticated(false);
            setAuthChecked(true);
        };
        
        // Broadcast authentication state to all iframes
        const broadcastAuthState = (tokensObj: any, clientId: string | null, activeLoginId: string | null) => {
            console.log('AuthContext: Broadcasting auth state to iframes');
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
                    }, '*');
                    
                    // Also use the format from dashboard.js
                    iframe.contentWindow.postMessage({
                        authorize: tokensObj,
                        login_id: activeLoginId,
                        client_id: clientId
                    }, '*');
                }
            });
        };

        // Initial check
        checkAuth();

        // Listen for auth changes from Deriv
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'tokens' || e.key === 'active_loginid' || e.key === 'client_id' || e.key === 'authToken') {
                console.log("Storage change detected:", e.key);
                checkAuth();
            }
        };

        // Check periodically for changes
        const intervalId = setInterval(checkAuth, 2000);

        window.addEventListener('storage', handleStorageChange);
        
        // Listen for messages from parent window or iframes
        const handleMessage = (event: MessageEvent) => {
            // Accept messages from any origin to allow cross-iframe communication
            if (event.data?.type === 'auth' || 
                event.data?.type === 'login' || 
                event.data?.type === 'logout' ||
                event.data?.authorize) {
                console.log("Auth message received:", event.data?.type);
                checkAuth();
            }
        };

        window.addEventListener('message', handleMessage);

        // Request auth status from parent window
        const requestAuthStatus = () => {
            window.parent.postMessage({ type: 'request_auth_status' }, '*');
            
            // Also broadcast to all frames
            const bc = new BroadcastChannel('deriv_auth_channel');
            bc.postMessage({ type: 'request_auth_status' });
            bc.close();
        };

        // Request auth status every 5 seconds if not authenticated
        const authCheckInterval = setInterval(() => {
            if (!isAuthenticated) {
                requestAuthStatus();
            } else {
                clearInterval(authCheckInterval);
            }
        }, 5000);

        // Set up broadcast channel for cross-tab communication
        const bc = new BroadcastChannel('deriv_auth_channel');
        bc.onmessage = (event) => {
            if (event.data?.type === 'auth_update') {
                checkAuth();
            }
        };

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('message', handleMessage);
            clearInterval(intervalId);
            clearInterval(authCheckInterval);
            bc.close();
        };
    }, [isAuthenticated]);

    // Watch for authChecked and isAuthenticated changes
    useEffect(() => {
        if (authChecked && !isAuthenticated) {
            // Check if we have an auth code but no tokens
            const authCode = localStorage.getItem('deriv_auth_code');
            if (authCode) {
                console.log("Have auth code but not authenticated, retrying auth check");
                
                // Wait a bit and force another check
                const retryTimeout = setTimeout(() => {
                    const storedTokens = localStorage.getItem('tokens');
                    if (!storedTokens) {
                        console.log("Still no tokens, clearing auth code");
                        localStorage.removeItem('deriv_auth_code');
                    }
                }, 3000);
                
                return () => clearTimeout(retryTimeout);
            }
        }
    }, [authChecked, isAuthenticated]);

    console.log('AuthContext rendering with:', { isAuthenticated, tokensCount: tokens.length, activeLoginId, authChecked });

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            tokens,
            activeLoginId,
            setTokens,
            setActiveLoginId,
            login
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 