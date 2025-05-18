import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAppId } from '@/components/shared/utils/config/config';

interface AuthContextType {
    isAuthenticated: boolean;
    tokens: string[];
    activeLoginId: string;
    setTokens: (tokens: string[]) => void;
    setActiveLoginId: (loginId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [tokens, setTokens] = useState<string[]>([]);
    const [activeLoginId, setActiveLoginId] = useState('');

    useEffect(() => {
        // Check for existing tokens in localStorage
        const checkAuth = () => {
            const storedTokens = localStorage.getItem('tokens');
            const activeLoginId = localStorage.getItem('active_loginid');
            const clientId = localStorage.getItem('client_id');
            
            if (storedTokens && clientId) {
                try {
                    const tokensObj = JSON.parse(storedTokens);
                    const tokensArray = Object.values(tokensObj).map(token => String(token));
                    setTokens(tokensArray);
                    setIsAuthenticated(true);
                    if (activeLoginId) {
                        setActiveLoginId(activeLoginId);
                    }
                } catch (error) {
                    console.error('Error parsing tokens:', error);
                }
            } else {
                setTokens([]);
                setIsAuthenticated(false);
            }
        };

        // Initial check
        checkAuth();

        // Listen for auth changes from Deriv
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'tokens' || e.key === 'active_loginid' || e.key === 'client_id') {
                checkAuth();
            }
        };

        // Also check periodically for changes
        const intervalId = setInterval(checkAuth, 1000);

        window.addEventListener('storage', handleStorageChange);
        
        // Listen for messages from parent window (Deriv)
        const handleMessage = (event: MessageEvent) => {
            // Accept messages from Deriv domains
            if (event.origin === 'https://app.deriv.com' || 
                event.origin === 'https://oauth.deriv.com' ||
                event.origin === 'https://deriv.com') {
                
                if (event.data?.type === 'auth' || 
                    event.data?.type === 'login' || 
                    event.data?.type === 'logout') {
                    checkAuth();
                }
            }
        };

        window.addEventListener('message', handleMessage);

        // Request auth status from parent window
        const requestAuthStatus = () => {
            window.parent.postMessage({ type: 'request_auth_status' }, '*');
        };

        // Request auth status every 5 seconds until authenticated
        const authCheckInterval = setInterval(() => {
            if (!isAuthenticated) {
                requestAuthStatus();
            } else {
                clearInterval(authCheckInterval);
            }
        }, 5000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('message', handleMessage);
            clearInterval(intervalId);
            clearInterval(authCheckInterval);
        };
    }, [isAuthenticated]);

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            tokens,
            activeLoginId,
            setTokens,
            setActiveLoginId
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