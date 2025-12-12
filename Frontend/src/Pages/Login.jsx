import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AiOutlineLoading3Quarters } from '../assets/Icons';
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
          // On any check failure, fall back to home to avoid blocking login
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
      {/* Purple gradient decorations */}
      <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob"></div>
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      
      {/* Logo/Brand in top-left */}
      <div className="absolute top-6 left-6 z-10">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent group-hover:from-violet-500 group-hover:to-purple-500 transition-all duration-300">
            Threadwork
          </span>
        </Link>
      </div>
      
      {/* Centered form panel */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Sign In
              </h1>
              <p className="text-gray-500">Welcome back to Threadwork</p>
            </div>

            {/* Google OAuth - Top */}
            <GoogleOAuth onSuccess={handleGoogleSuccess} isSignup={false} />

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Email and Password Form */}
            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-200 outline-none"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-200 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <AiOutlineLoading3Quarters className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

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

export default Login;
