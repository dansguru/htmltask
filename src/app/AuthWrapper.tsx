import React, { useEffect } from 'react';
import ChunkLoader from '@/components/loader/chunk-loader';
import { generateDerivApiInstance } from '@/external/bot-skeleton/services/api/appId';
import { localize } from '@deriv-com/translations';
import { URLUtils } from '@deriv-com/utils';
import App from './App';

const setLocalStorageToken = async (loginInfo: URLUtils.LoginInfo[], paramsToDelete: string[]) => {
    console.log('AuthWrapper.setLocalStorageToken: Starting with loginInfo', { count: loginInfo.length });
    
    if (loginInfo.length) {
        try {
            const defaultActiveAccount = URLUtils.getDefaultActiveAccount(loginInfo);
            if (!defaultActiveAccount) return;

            const accountsList: Record<string, string> = {};
            const clientAccounts: Record<string, { loginid: string; token: string; currency: string }> = {};

            loginInfo.forEach((account: { loginid: string; token: string; currency: string }) => {
                accountsList[account.loginid] = account.token;
                clientAccounts[account.loginid] = account;
            });

            console.log('AuthWrapper: Storing tokens in localStorage', { 
                loginIds: Object.keys(accountsList).length
            });
            
            localStorage.setItem('accountsList', JSON.stringify(accountsList));
            localStorage.setItem('clientAccounts', JSON.stringify(clientAccounts));

            URLUtils.filterSearchParams(paramsToDelete);
            const api = await generateDerivApiInstance();

            if (api) {
                const { authorize, error } = await api.authorize(loginInfo[0].token);
                api.disconnect();
                if (!error) {
                    const firstId = authorize?.account_list[0]?.loginid;
                    const filteredTokens = loginInfo.filter(token => token.loginid === firstId);
                    if (filteredTokens.length) {
                        console.log('AuthWrapper: Setting auth tokens from successful authorization');
                        localStorage.setItem('authToken', filteredTokens[0].token);
                        localStorage.setItem('active_loginid', filteredTokens[0].loginid);
                        // Also set tokens in the format expected by the AuthContext
                        const tokensObject = filteredTokens.reduce((acc, token) => {
                            acc[token.loginid] = token.token;
                            return acc;
                        }, {} as Record<string, string>);
                        localStorage.setItem('tokens', JSON.stringify(tokensObject));
                        return;
                    }
                }
            }

            console.log('AuthWrapper: Setting auth tokens without validation');
            localStorage.setItem('authToken', loginInfo[0].token);
            localStorage.setItem('active_loginid', loginInfo[0].loginid);
            
            // Also set tokens in the format expected by the AuthContext
            const tokensObject = loginInfo.reduce((acc, token) => {
                acc[token.loginid] = token.token;
                return acc;
            }, {} as Record<string, string>);
            localStorage.setItem('tokens', JSON.stringify(tokensObject));
        } catch (error) {
            console.error('Error setting up login info:', error);
        }
    }
};

// Utility function to initiate login with Deriv
const initiateLogin = () => {
    const app_id = localStorage.getItem('config.app_id') || '76128';
    
    console.log('AuthWrapper.initiateLogin: Starting login flow with app_id', app_id);
    
    // Store current path to redirect back after login
    sessionStorage.setItem('redirect_after_login', window.location.href);
    
    // Also store in localStorage for cross-tab awareness
    localStorage.setItem('login_initiated', 'true');
    localStorage.setItem('login_initiated_at', Date.now().toString());
    
    window.location.href = `https://oauth.deriv.com/oauth2/authorize?app_id=${app_id}`;
};

export const AuthWrapper = () => {
    const [isAuthComplete, setIsAuthComplete] = React.useState(false);
    const { loginInfo, paramsToDelete } = URLUtils.getLoginInfoFromURL();

    console.log('AuthWrapper: Initializing with', { 
        hasLoginInfo: loginInfo.length > 0,
        isAuthComplete
    });

    // Check if we need to auto-login user
    useEffect(() => {
        const checkAuthStatus = () => {
            const tokensStr = localStorage.getItem('tokens');
            const authToken = localStorage.getItem('authToken');
            const activeLoginId = localStorage.getItem('active_loginid');
            
            console.log('AuthWrapper.checkAuthStatus: Checking auth status', { 
                hasTokensStr: !!tokensStr, 
                hasAuthToken: !!authToken, 
                hasActiveLoginId: !!activeLoginId, 
                hasLoginInfo: loginInfo.length > 0
            });
            
            // If we don't have any auth data and not coming from a redirect
            if ((!tokensStr || !activeLoginId) && (!authToken || !activeLoginId) && !loginInfo.length) {
                // Check if we're on a page that requires auth
                const currentHash = window.location.hash.substring(1);
                const authRequiredPages = [
                    'smart-analysis', 'analysis-tool', 'copy-trading', 
                    'ai-bot', 'signal'
                ];
                
                if (authRequiredPages.some(page => currentHash.includes(page))) {
                    console.log("Authentication required for this page, initiating login...");
                    initiateLogin();
                    return false;
                }
            }
            return true;
        };

        // Only proceed with initialization if we don't need to auto-login
        if (checkAuthStatus()) {
            // Normal initialization logic continues
            const initializeAuth = async () => {
                if (loginInfo.length > 0) {
                    console.log('AuthWrapper: Has login info from URL, setting up tokens');
                    await setLocalStorageToken(loginInfo, paramsToDelete);
                } else {
                    console.log('AuthWrapper: No login info from URL');
                }
                
                URLUtils.filterSearchParams(['lang']);
                
                // Check if we have the legacy authToken but no tokens in new format
                const authToken = localStorage.getItem('authToken');
                const activeLoginId = localStorage.getItem('active_loginid');
                const tokens = localStorage.getItem('tokens');
                
                if (authToken && activeLoginId && !tokens) {
                    console.log('AuthWrapper: Converting legacy token format to new format');
                    const tokensObject: Record<string, string> = {};
                    tokensObject[activeLoginId] = authToken;
                    localStorage.setItem('tokens', JSON.stringify(tokensObject));
                }
                
                // Broadcast the auth state to any tools that need it
                const event = new Event('auth_state_updated');
                document.dispatchEvent(event);
                
                setIsAuthComplete(true);
            };
            
            initializeAuth();
        }
    }, [loginInfo, paramsToDelete]);

    // Listen for auth required events
    useEffect(() => {
        const handleAuthRequired = () => {
            console.log("Auth required event received, initiating login...");
            initiateLogin();
        };
        
        document.addEventListener('abcz_auth_required', handleAuthRequired);
        
        return () => {
            document.removeEventListener('abcz_auth_required', handleAuthRequired);
        };
    }, []);

    if (!isAuthComplete) {
        return <ChunkLoader message={localize('Initializing...')} />;
    }

    return <App />;
};
