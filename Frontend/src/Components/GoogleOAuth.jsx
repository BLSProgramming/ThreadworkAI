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
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        console.log('🔍 Initializing Google Sign-In with client_id:', clientId);
        console.log('🌐 Current origin:', window.location.origin);
        
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCallback,
          auto_select: false,
          cancel_on_tap_outside: true
        });
        
        // Render the Google button in the container
        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(
            googleButtonRef.current,
            {
              theme: 'outline',
              size: 'large',
              width: googleButtonRef.current.offsetWidth,
              text: isSignup ? 'signup_with' : 'signin_with',
              shape: 'rectangular',
              logo_alignment: 'left'
            }
          );
        }
        
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

  const handleGoogleCallback = async (response) => {
    setIsLoading(true);
    try {
      const endpoint = isSignup ? '/api/google-signup' : '/api/google-login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
      {/* Google Button Container */}
      <div 
        ref={googleButtonRef}
        className="w-full mb-6"
        style={{ minHeight: '44px' }}
      ></div>

      {/* Divider */}
      <div className="relative mb-6">
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