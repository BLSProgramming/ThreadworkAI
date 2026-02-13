import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, HiLightningBolt } from '../assets/Icons';
import GoogleOAuth from '../Components/GoogleOAuth';

function Signup() {
  const navigate = useNavigate();
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);

  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: '', color: 'bg-gray-200' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const levels = [
      { strength: 1, label: 'Weak', color: 'bg-red-500' },
      { strength: 2, label: 'Fair', color: 'bg-orange-500' },
      { strength: 3, label: 'Good', color: 'bg-yellow-500' },
      { strength: 4, label: 'Strong', color: 'bg-green-500' },
    ];

    return levels[strength - 1] || { strength: 0, label: 'Too short', color: 'bg-gray-300' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password,
          country
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        navigate('/login');
      } else {
        alert(data.message || data.error || 'Signup failed');
      }
    } catch (err) {
      console.error('Signup error:', err);
      alert('Network error. Please try again.');
    }
  };

  const passwordStrength = getPasswordStrength();

  const handleGoogleSuccess = (data) => {
    if (data.needsProfile) {
      navigate('/complete-profile', { state: { signupMethod: 'google' } });
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel - Threaded Models Web */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/15 rounded-full blur-2xl animate-blob animation-delay-4000"></div>
          {/* Dot grid */}
          <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px'}}></div>
        </div>

        {/* Threaded Web Diagram */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
          <div className="relative" style={{width: '420px', height: '420px'}}>
            {/* SVG connection lines */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 420 420" fill="none">
              {/* Threads from center (210,210) to each model node — pentagon layout */}
              {/* DeepSeek - top */}
              <line x1="210" y1="210" x2="210" y2="40" stroke="url(#thread1)" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6">
                <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="2s" repeatCount="indefinite" />
              </line>
              {/* Llama - top right */}
              <line x1="210" y1="210" x2="372" y2="152" stroke="url(#thread2)" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6">
                <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="2.3s" repeatCount="indefinite" />
              </line>
              {/* GLM - bottom right */}
              <line x1="210" y1="210" x2="310" y2="355" stroke="url(#thread3)" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6">
                <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="1.8s" repeatCount="indefinite" />
              </line>
              {/* Essential - bottom left */}
              <line x1="210" y1="210" x2="110" y2="355" stroke="url(#thread4)" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6">
                <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="2.1s" repeatCount="indefinite" />
              </line>
              {/* Moonshot - top left */}
              <line x1="210" y1="210" x2="48" y2="152" stroke="url(#thread5)" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6">
                <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="1.9s" repeatCount="indefinite" />
              </line>

              {/* Inter-model connections (outer web) */}
              <line x1="210" y1="40" x2="372" y2="152" stroke="white" strokeWidth="0.5" opacity="0.1" />
              <line x1="372" y1="152" x2="310" y2="355" stroke="white" strokeWidth="0.5" opacity="0.1" />
              <line x1="310" y1="355" x2="110" y2="355" stroke="white" strokeWidth="0.5" opacity="0.1" />
              <line x1="110" y1="355" x2="48" y2="152" stroke="white" strokeWidth="0.5" opacity="0.1" />
              <line x1="48" y1="152" x2="210" y2="40" stroke="white" strokeWidth="0.5" opacity="0.1" />

              {/* Gradient definitions */}
              <defs>
                <linearGradient id="thread1" x1="210" y1="210" x2="210" y2="40" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <linearGradient id="thread2" x1="210" y1="210" x2="372" y2="152" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <linearGradient id="thread3" x1="210" y1="210" x2="310" y2="355" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <linearGradient id="thread4" x1="210" y1="210" x2="110" y2="355" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
                <linearGradient id="thread5" x1="210" y1="210" x2="48" y2="152" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center: Threadwork Logo */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/40 ring-4 ring-purple-500/20">
                <HiLightningBolt className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Orbiting glow ring */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-purple-500/20 animate-pulse"></div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full border border-purple-500/10"></div>

            {/* Model Nodes — pentagon */}
            {/* DeepSeek - top center */}
            <div className="absolute z-10" style={{left: '210px', top: '40px', transform: 'translate(-50%, -50%)'}}>
              <div className="w-14 h-14 bg-slate-800/80 backdrop-blur-sm border border-blue-500/30 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/10 hover:scale-110 hover:border-blue-400/60 transition-all duration-300">
                <span className="text-xl">🔷</span>
              </div>
              <div className="text-[10px] text-blue-300 font-medium text-center mt-1.5 tracking-wide">DeepSeek</div>
            </div>

            {/* Llama - top right */}
            <div className="absolute z-10" style={{left: '372px', top: '152px', transform: 'translate(-50%, -50%)'}}>
              <div className="w-14 h-14 bg-slate-800/80 backdrop-blur-sm border border-purple-500/30 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/10 hover:scale-110 hover:border-purple-400/60 transition-all duration-300">
                <span className="text-xl">🦙</span>
              </div>
              <div className="text-[10px] text-purple-300 font-medium text-center mt-1.5 tracking-wide">Llama</div>
            </div>

            {/* GLM - bottom right */}
            <div className="absolute z-10" style={{left: '310px', top: '355px', transform: 'translate(-50%, -50%)'}}>
              <div className="w-14 h-14 bg-slate-800/80 backdrop-blur-sm border border-cyan-500/30 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/10 hover:scale-110 hover:border-cyan-400/60 transition-all duration-300">
                <span className="text-xl">🌐</span>
              </div>
              <div className="text-[10px] text-cyan-300 font-medium text-center mt-1.5 tracking-wide">GLM-4.6</div>
            </div>

            {/* Essential - bottom left */}
            <div className="absolute z-10" style={{left: '110px', top: '355px', transform: 'translate(-50%, -50%)'}}>
              <div className="w-14 h-14 bg-slate-800/80 backdrop-blur-sm border border-orange-500/30 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/10 hover:scale-110 hover:border-orange-400/60 transition-all duration-300">
                <span className="text-xl">🎨</span>
              </div>
              <div className="text-[10px] text-orange-300 font-medium text-center mt-1.5 tracking-wide">Essential</div>
            </div>

            {/* Moonshot - top left */}
            <div className="absolute z-10" style={{left: '48px', top: '152px', transform: 'translate(-50%, -50%)'}}>
              <div className="w-14 h-14 bg-slate-800/80 backdrop-blur-sm border border-pink-500/30 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/10 hover:scale-110 hover:border-pink-400/60 transition-all duration-300">
                <span className="text-xl">🌙</span>
              </div>
              <div className="text-[10px] text-pink-300 font-medium text-center mt-1.5 tracking-wide">Moonshot</div>
            </div>
          </div>

          {/* Tagline below diagram */}
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">All Models, One Thread</h2>
            <p className="text-white/50 text-sm max-w-xs mx-auto">Five AI models woven together to give you the most complete answer every time.</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center">
              <HiLightningBolt className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Header */}
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Sign up for Threadwork
          </h1>
          <p className="text-gray-500 mb-8">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium">
              Sign in →
            </Link>
          </p>

          {/* Google OAuth */}
          <GoogleOAuth onSuccess={handleGoogleSuccess} isSignup={true} />

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
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
                autoComplete="email"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  autoComplete="new-password"
                  className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                </button>
              </div>
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          level <= passwordStrength.strength ? passwordStrength.color : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${passwordStrength.color.replace('bg-', 'text-')}`}>
                    {passwordStrength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Country/Region */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                Country/Region
              </label>
              <select
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none appearance-none cursor-pointer"
              >
                <option value="">Select your country</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="JP">Japan</option>
                <option value="IN">India</option>
                <option value="BR">Brazil</option>
                <option value="MX">Mexico</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Terms */}
            <p className="text-xs text-gray-500">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-purple-600 hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-purple-600 hover:underline">Privacy Policy</Link>.
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
            >
              Create account
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
            <div className="flex justify-center gap-4">
              <Link to="/terms" className="hover:text-purple-600">Terms</Link>
              <Link to="/privacy" className="hover:text-purple-600">Privacy</Link>
              <Link to="/contact" className="hover:text-purple-600">Contact</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
