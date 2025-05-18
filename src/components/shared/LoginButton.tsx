import React from 'react';
import { getAppId } from '@/components/shared/utils/config/config';
import './LoginButton.css';

interface LoginButtonProps {
    className?: string;
    label?: string;
}

const LoginButton: React.FC<LoginButtonProps> = ({ className, label = 'Login with Deriv' }) => {
    const handleLogin = () => {
        const app_id = getAppId();
        
        // Store current path to redirect back after login
        sessionStorage.setItem('redirect_after_login', window.location.href);
        
        // Also store in localStorage for cross-tab awareness
        localStorage.setItem('login_initiated', 'true');
        localStorage.setItem('login_initiated_at', Date.now().toString());
        
        window.location.href = `https://oauth.deriv.com/oauth2/authorize?app_id=${app_id}`;
    };

    return (
        <button 
            className={`deriv-login-button ${className || ''}`}
            onClick={handleLogin}
        >
            {label}
        </button>
    );
};

export default LoginButton; 