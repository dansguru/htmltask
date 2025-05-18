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
        const storedTokens = localStorage.getItem('tokens');
        if (storedTokens) {
            const tokensArray = Object.values(JSON.parse(storedTokens));
            setTokens(tokensArray);
            setIsAuthenticated(true);
        }

        // Listen for auth changes from Deriv
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'tokens') {
                if (e.newValue) {
                    const tokensArray = Object.values(JSON.parse(e.newValue));
                    setTokens(tokensArray);
                    setIsAuthenticated(true);
                } else {
                    setTokens([]);
                    setIsAuthenticated(false);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

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