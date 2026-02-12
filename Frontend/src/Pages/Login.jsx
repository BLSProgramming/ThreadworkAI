import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AiOutlineLoading3Quarters } from '../assets/Icons';
import { HiLightningBolt } from 'react-icons/hi';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import GoogleOAuth from '../Components/GoogleOAuth';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        // After successful login, check whether the profile is complete
        try {
          const profileRes = await fetch('/api/check-profile', { credentials: 'include' });
          const profileData = await profileRes.json();

          if (profileRes.ok && profileData.profileComplete) {
            navigate('/home');
          } else {
            navigate('/complete-profile', { state: { email, isExistingUser: true } });
          }
        } catch (checkErr) {
          console.error('Profile check error:', checkErr);
          navigate('/home');
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = (data) => {
    if (data.needsProfile) {
      navigate('/complete-profile', { state: { signupMethod: 'google' } });
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-violet-100 rounded-full mix-blend-multiply filter blur-3xl opacity-25 pointer-events-none"></div>

      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-[400px]">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <HiLightningBolt className="w-6 h-6 text-white" />
              </div>
            </Link>
          </div>

          {/* Header */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Sign in to Threadwork
          </h1>
          <p className="text-gray-500 mb-8 text-center">
            Don't have an account?{' '}
            <Link to="/signup" className="text-purple-600 hover:text-purple-700 font-medium">
              Create one <span className="inline-block">→</span>
            </Link>
          </p>

          {/* Google OAuth */}
          <GoogleOAuth onSuccess={handleGoogleSuccess} isSignup={false} />

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <span className="text-red-500 mt-0.5">⚠</span>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Email and Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-200 outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link to="/password-reset" className="text-xs text-purple-600 hover:text-purple-700 font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-200 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30"
            >
              {isLoading ? (
                <>
                  <AiOutlineLoading3Quarters className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <FiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-10">
            © 2025 Threadwork AI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
