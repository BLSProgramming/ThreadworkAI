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
          setIsAuthenticated(true);
          setIsChecking(false);
        } else {
          // Not authenticated, redirect to login
          navigate('/login', { replace: true });
        }
      } catch (err) {
        console.error('Auth check error:', err);
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
