import { useState, useEffect, useRef } from 'react';
import { AiOutlineLoading3Quarters } from '../assets/Icons';

function GoogleOAuth({ onSuccess, isSignup = false }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const googleButtonRef = useRef(null);

  useEffect(() => {
    // Initialize Google Sign-In
    const initializeGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback
        });
        setIsGoogleReady(true);
      }
    };

    // Check if the Google script is loaded
    if (window.google) {
      initializeGoogleSignIn();
    } else {
      // Wait for the script to load
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle);
          initializeGoogleSignIn();
        }
      }, 100);

      return () => clearInterval(checkGoogle);
    }
  }, [isSignup]);

  const handleGoogleClick = () => {
    if (window.google && isGoogleReady) {
      window.google.accounts.id.prompt();
    }
  };

  const handleGoogleCallback = async (response) => {
    setIsLoading(true);
    try {
      const endpoint = isSignup ? '/api/google-signup' : '/api/google-login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        onSuccess(data);
      } else {
        throw new Error(data.message || data.error || `Google ${isSignup ? 'signup' : 'login'} failed`);
      }
    } catch (err) {
      console.error(`Google ${isSignup ? 'signup' : 'login'} error:`, err);
      alert(`Failed to ${isSignup ? 'sign up' : 'sign in'} with Google. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Custom Google Button */}
      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={isLoading || !isGoogleReady}
        className="w-full py-3.5 px-4 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
      >
        {isLoading ? (
          <>
            <AiOutlineLoading3Quarters className="w-5 h-5 animate-spin" />
            <span>{isSignup ? 'Signing up...' : 'Signing in...'}</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-bold">Continue with Google</span>
          </>
        )}
      </button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">Or</span>
        </div>
      </div>
    </>
  );
}

export default GoogleOAuth;
