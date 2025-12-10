import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HiLightningBolt, AiOutlineLoading3Quarters } from '../assets/Icons';

function CompleteProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, password, signupMethod } = location.state || {};
  
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

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
      } else {
        // For email signup
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
          navigate('/');
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

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/4 bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-indigo-400/15 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-8">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
              <HiLightningBolt className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold mb-4">Almost there!</h2>
            <p className="text-lg text-white/80 leading-relaxed">
              Just a few more details to personalize your experience
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-start lg:pl-80 p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HiLightningBolt className="w-7 h-7 text-white" />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Complete your profile
              </h1>
              <p className="text-gray-500">Tell us a bit about yourself</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full py-3.5 mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <AiOutlineLoading3Quarters className="animate-spin h-5 w-5" />
                    {signupMethod === 'google' ? 'Completing...' : 'Creating account...'}
                  </span>
                ) : (
                  signupMethod === 'google' ? 'Complete Profile' : 'Create account'
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
