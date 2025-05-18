import React from 'react';
import { getAppId } from '@/components/shared/utils/config/config';

interface LoginButtonProps {
    className?: string;
}

const LoginButton: React.FC<LoginButtonProps> = ({ className }) => {
    const handleLogin = () => {
        const app_id = getAppId();
        window.location.href = `https://oauth.deriv.com/oauth2/authorize?app_id=${app_id}`;
    };

    return (
        <button 
            className={`deriv-login-button ${className || ''}`}
            onClick={handleLogin}
        >
            Login with Deriv
        </button>
    );
};

export default LoginButton; 