import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AiOutlineLoading3Quarters } from '../assets/Icons';

function CompleteProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, password, signupMethod, isExistingUser } = location.state || {};
  
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Check if profile is already complete on mount
  useEffect(() => {
    const checkProfileStatus = async () => {
      try {
        const response = await fetch('/api/check-profile', { credentials: 'include' });
        const data = await response.json();
        
        if (response.ok && data.profileComplete) {
          // Profile already complete, redirect to home
          navigate('/home', { replace: true });
        } else {
          setIsChecking(false);
        }
      } catch (err) {
        // If error checking, allow profile completion
        setIsChecking(false);
      }
    };

    checkProfileStatus();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (signupMethod === 'google') {
        // For Google signup, send profile completion data
        const response = await fetch('/api/complete-google-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            full_name: fullName, 
            birth_date: birthDate 
          })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          navigate('/home');
        } else {
          alert(data.message || data.error || 'Failed to complete profile');
        }
      } else if (isExistingUser) {
        // For existing users who need to complete their profile
        const response = await fetch('/api/complete-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            full_name: fullName, 
            birth_date: birthDate 
          })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          navigate('/home');
        } else {
          alert(data.message || data.error || 'Failed to complete profile');
        }
      } else {
        // For new email signup
        const response = await fetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            full_name: fullName, 
            email, 
            password, 
            birth_date: birthDate 
          })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          navigate('/login');
        } else {
          alert(data.message || data.error || 'Signup failed');
        }
      }
    } catch (err) {
      console.error('Profile completion error:', err);
      alert('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking profile status
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <AiOutlineLoading3Quarters className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

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
                Complete your profile
              </h1>
              <p className="text-gray-500">Tell us a bit about yourself</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full name
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                  autoComplete="name"
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-200 outline-none"
                />
              </div>

              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Birth date
                </label>
                <input
                  type="date"
                  id="birthDate"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-200 outline-none"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">
                    I agree to the{' '}
                    <a href="#" className="text-purple-600 hover:text-purple-700">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-purple-600 hover:text-purple-700">Privacy Policy</a>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading || !agreeToTerms}
                className="w-full py-3.5 mt-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <AiOutlineLoading3Quarters className="w-5 h-5 animate-spin" />
                    {signupMethod === 'google' ? 'Completing...' : 'Updating...'}
                  </>
                ) : (
                  signupMethod === 'google' ? 'Complete Profile' : 'Update Profile'
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            © 2025 Threadwork. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CompleteProfile;
