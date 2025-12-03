import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from '../assets/Icons';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password, rememberMe });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-purple-900 p-5">
      <div className="bg-white rounded-2xl shadow-2xl p-12 w-full max-w-md animate-[slideUp_0.5s_ease-out]">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-900 bg-clip-text text-transparent mb-3 tracking-tight">
            Threadwork
          </h1>
          <p className="text-gray-500 text-base">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-semibold text-gray-700">
              Email address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              autoComplete="email"
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-100 placeholder:text-gray-400"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-semibold text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-100 placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center -mt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 cursor-pointer accent-purple-600"
              />
              <label htmlFor="remember" className="text-sm text-gray-700 cursor-pointer select-none">
                Remember me
              </label>
            </div>
            <a href="#" className="text-sm text-purple-600 font-medium hover:text-purple-900 transition-colors">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="mt-2 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-purple-900 text-white rounded-lg text-base font-semibold hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-300 active:translate-y-0 transition-all duration-300"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-purple-600 font-semibold hover:text-purple-900 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
