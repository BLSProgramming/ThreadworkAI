import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiLightningBolt, FiCheckCircle, FiTrendingUp, FiUsers, AiOutlineLoading3Quarters } from '../assets/Icons';

function GoogleLogin() {
  const navigate = useNavigate();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const googleButtonRef = useRef(null);

  useEffect(() => {
    // Initialize Google Sign-In
    const initializeGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback
        });

        // Render the button
        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(
            googleButtonRef.current,
            {
              theme: 'outline',
              size: 'large',
              width: googleButtonRef.current.offsetWidth,
              text: 'continue_with',
              shape: 'rectangular'
            }
          );
        }
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
  }, []);

  const handleGoogleCallback = async (response) => {
    setIsGoogleLoading(true);
    try {
      // Send the credential (JWT token) to your backend
      const res = await fetch('/api/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        navigate('/home');
      } else {
        alert(data.message || data.error || 'Google login failed');
      }
    } catch (err) {
      console.error('Google login error:', err);
      alert('Failed to sign in with Google. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/4 bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-800 relative overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-indigo-400/15 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-8">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
              <HiLightningBolt className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold mb-4">Welcome back!</h2>
            <p className="text-lg text-white/80 leading-relaxed">
              Placeholder
            </p>
          </div>
          
          {/* Feature highlights */}
          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <FiCheckCircle className="w-5 h-5" />
              </div>
              <span className="text-white/90">Placeholder</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <FiTrendingUp className="w-5 h-5" />
              </div>
              <span className="text-white/90">Placeholder</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <FiUsers className="w-5 h-5" />
              </div>
              <span className="text-white/90">Placeholder</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Google Login */}
      <div className="flex-1 flex items-center justify-start lg:pl-80 p-8 pt-24 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HiLightningBolt className="w-7 h-7 text-white" />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Threadwork
              </h1>
              <p className="text-gray-500">Sign in with your Google account</p>
            </div>

            {/* Google Login Button */}
            <div 
              ref={googleButtonRef}
              className="w-full mb-6 flex items-center justify-center"
              style={{ minHeight: '44px' }}
            >
              {isGoogleLoading && (
                <div className="flex items-center gap-2 text-gray-600">
                  <AiOutlineLoading3Quarters className="w-5 h-5 animate-spin" />
                  Signing in...
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or</span>
              </div>
            </div>

            {/* Email Login Link */}
            <Link
              to="/email-login"
              className="w-full py-3.5 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Sign in with Email
            </Link>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-500">
                Don't have an account?{' '}
                <Link to="/signup" className="text-purple-600 font-semibold hover:text-purple-700 transition-colors">
                  Create account
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            © 2025 Threadwork. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default GoogleLogin;
