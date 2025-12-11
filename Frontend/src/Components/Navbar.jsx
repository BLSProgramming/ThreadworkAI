import { Link } from 'react-router-dom';
import { HiLightningBolt } from 'react-icons/hi';

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <HiLightningBolt className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Threadwork AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              to="/faq" 
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors font-medium"
            >
              FAQ
            </Link>
            <Link 
              to="/contact" 
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors font-medium"
            >
              Contact
            </Link>
            <Link 
              to="/login" 
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors font-medium"
            >
              Sign in
            </Link>
            <Link 
              to="/signup" 
              className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-500 hover:to-purple-500 transition-all duration-200 shadow-lg shadow-purple-500/25"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
