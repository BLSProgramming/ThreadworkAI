import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineLoading3Quarters } from '../assets/Icons';

function AuthWrapper({ children }) {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/check-auth', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          // Store user_id for user-specific localStorage
          if (data.user_id) {
            localStorage.setItem('current_user_id', data.user_id);
          }
          setIsAuthenticated(true);
          setIsChecking(false);
        } else {
          // Not authenticated, redirect to login
          localStorage.removeItem('current_user_id');
          navigate('/login', { replace: true });
        }
      } catch (err) {
        console.error('Auth check error:', err);
        localStorage.removeItem('current_user_id');
        navigate('/login', { replace: true });
      }
    };

    checkAuth();
  }, [navigate]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <AiOutlineLoading3Quarters className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return isAuthenticated ? children : null;
}

export default AuthWrapper;
