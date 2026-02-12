import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { HiLightningBolt } from 'react-icons/hi';
import { FiGrid, FiZap, FiShield } from 'react-icons/fi';
import Navbar from '../Components/Navbar';
import TrialChat from '../Components/TrialChat';

const MARQUEE_MODELS = [
  { name: 'DeepSeek', desc: 'Reasoning, math, coding', emoji: '🔷', hoverBorder: 'hover:border-blue-400', iconBg: 'bg-blue-500/20' },
  { name: 'Llama', desc: 'Fast, general Q&A', emoji: '🦙', hoverBorder: 'hover:border-purple-400', iconBg: 'bg-purple-500/20' },
  { name: 'GLM-4.6', desc: 'Multilingual, reasoning', emoji: '🌐', hoverBorder: 'hover:border-cyan-400', iconBg: 'bg-cyan-500/20' },
  { name: 'Qwen', desc: 'Coding, tools', emoji: '✨', hoverBorder: 'hover:border-emerald-400', iconBg: 'bg-emerald-500/20' },
  { name: 'Essential', desc: 'Creative, writing', emoji: '🎨', hoverBorder: 'hover:border-orange-400', iconBg: 'bg-orange-500/20' },
  { name: 'Moonshot', desc: 'Long reasoning', emoji: '🌙', hoverBorder: 'hover:border-pink-400', iconBg: 'bg-pink-500/20' },
];

function LandingPage() {
  const [trialInput, setTrialInput] = useState('');
  const [showTrialChat, setShowTrialChat] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [initialQuestion, setInitialQuestion] = useState('');
  const howItWorksRef = useRef(null);
  const heroInputRef = useRef(null);

  const scrollToHowItWorks = (e) => {
    e.preventDefault();
    if (!howItWorksRef.current) return;
    
    const target = howItWorksRef.current;
    const targetPosition = target.getBoundingClientRect().top + window.scrollY + 500;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    const duration = 1200;
    let start = null;
    
    const easeInOutCubic = (t) => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };
    
    const animation = (currentTime) => {
      if (start === null) start = currentTime;
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = easeInOutCubic(progress);
      window.scrollTo(0, startPosition + distance * ease);
      
      if (progress < 1) {
        requestAnimationFrame(animation);
      }
    };
    
    requestAnimationFrame(animation);
  };

  const scrollToHero = () => {
    const target = heroInputRef.current;
    if (!target) return;
    const targetPosition = target.getBoundingClientRect().top + window.scrollY - 200;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    const duration = 1200;
    let start = null;

    const easeInOutCubic = (t) => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const animation = (currentTime) => {
      if (start === null) start = currentTime;
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = easeInOutCubic(progress);
      window.scrollTo(0, startPosition + distance * ease);

      if (progress < 1) {
        requestAnimationFrame(animation);
      } else {
        heroInputRef.current?.focus();
      }
    };

    requestAnimationFrame(animation);
  };

  const openChat = (question) => {
    setInitialQuestion(question);
    setIsTransitioning(true);
    setTimeout(() => {
      setShowTrialChat(true);
    }, 50);
  };

  const closeChat = () => {
    setIsTransitioning(false);
    setTimeout(() => {
      setShowTrialChat(false);
      setInitialQuestion('');
    }, 500);
  };

  const handleTrialSubmit = (e) => {
    e.preventDefault();
    if (!trialInput.trim()) return;
    const question = trialInput;
    setTrialInput('');
    openChat(question);
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Landing Page */}
      <div className={`min-h-screen transition-transform duration-500 ease-in-out ${
        showTrialChat && isTransitioning ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}>
        {/* Navigation */}
        <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 border border-purple-200 rounded-full text-sm text-purple-700 mb-8">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Powered by Multiple AI Models
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight flex flex-col items-center">
              <span className="inline-block">One Question</span>
              <span className="inline-block bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Multiple Minds
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Threadwork AI synthesizes responses from multiple leading AI models to give you the most comprehensive, accurate, and balanced answers.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/signup" 
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 hover:from-violet-500 hover:to-purple-500 active:scale-[0.98] transition-all duration-200"
              >
                Start Free Today
              </Link>
              <button 
                onClick={scrollToHowItWorks}
                className="w-full sm:w-auto px-8 py-4 bg-gray-100 border border-gray-300 text-gray-900 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-all duration-200"
              >
                See How It Works
              </button>
            </div>

            {/* Try It Now Input */}
            <div className="mt-12 max-w-2xl mx-auto">
              <form onSubmit={handleTrialSubmit} className="relative">
                <div className="flex items-center bg-white border-2 border-gray-300 rounded-2xl p-2 focus-within:border-purple-500 focus-within:bg-gray-50 transition-all duration-200">
                  <input
                    ref={heroInputRef}
                    type="text"
                    value={trialInput}
                    onChange={(e) => setTrialInput(e.target.value)}
                    placeholder="Try it now — ask anything..."
                    className="flex-1 bg-transparent px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none text-lg"
                  />
                  <button
                    type="submit"
                    disabled={!trialInput.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                  >
                    <HiLightningBolt className="w-5 h-5" />
                    <span>Ask</span>
                  </button>
                </div>
                <p className="text-center text-purple-400 text-sm mt-3">
                  Trial uses 2 models • <Link to="/signup" className="text-purple-400 hover:text-purple-300">Sign up</Link> for full access
                </p>
              </form>
            </div>
          </div>

          {/* Hero Image/Demo */}
          <div className="mt-20 relative">
            <div className="bg-white border-2 border-gray-300 rounded-3xl p-6 shadow-lg">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                {/* Mock chat interface matching real output */}
                <div className="space-y-5">
                  {/* User message */}
                  <div className="flex justify-end items-end gap-3">
                    <div className="max-w-md bg-indigo-600 text-white rounded-xl rounded-br-none px-4 py-3 shadow-sm">
                      <p className="text-sm leading-relaxed">Is it better to learn React or Vue first?</p>
                    </div>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex-shrink-0 mb-1">
                      👤
                    </div>
                  </div>

                  {/* Bot response area */}
                  <div className="flex gap-4">
                    {/* Individual model panels */}
                    <div className="flex-[0.6] space-y-3 hidden md:block">
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl overflow-hidden border-l-4 border-l-purple-400">
                        <div className="px-3 py-2 text-[10px] font-bold text-purple-700 uppercase tracking-wider font-mono">Llama</div>
                        <div className="px-3 pb-3 text-xs text-gray-600">React has a larger ecosystem and job market, making it a practical first choice...</div>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl overflow-hidden border-l-4 border-l-emerald-400">
                        <div className="px-3 py-2 text-[10px] font-bold text-emerald-700 uppercase tracking-wider font-mono">Qwen</div>
                        <div className="px-3 pb-3 text-xs text-gray-600">Vue's gentler learning curve makes it ideal for beginners who want to understand core concepts...</div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl overflow-hidden border-l-4 border-l-blue-400">
                        <div className="px-3 py-2 text-[10px] font-bold text-blue-700 uppercase tracking-wider font-mono">DeepSeek</div>
                        <div className="px-3 pb-3 text-xs text-gray-600">Both are excellent — React for career opportunities, Vue for learning fundamentals cleanly...</div>
                      </div>
                    </div>

                    {/* Synthesized answer */}
                    <div className="flex-[2]">
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 rounded-xl rounded-bl-none shadow-sm">
                        <div className="px-4 py-2.5 text-xs font-bold text-indigo-700 uppercase tracking-wider font-mono flex items-center gap-2">
                          <span className="text-emerald-600">✓</span> Threadwork AI
                        </div>
                        {/* Answer section */}
                        <div className="mx-3 mb-3 bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-lg overflow-hidden">
                          <div className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold text-sm">✓ Answer</div>
                          <div className="px-4 py-3 text-sm text-gray-800 space-y-2">
                            <p><span className="font-semibold">Start with React</span> if you're targeting the job market — it has broader industry adoption and more open positions. However, <span className="font-semibold">Vue is the better pedagogical choice</span> if your goal is deeply understanding reactivity and component architecture.</p>
                            <p className="text-gray-600 text-xs">All 3 models agreed that both frameworks teach transferable skills, and switching between them later is straightforward.</p>
                          </div>
                        </div>
                        {/* Agreement section */}
                        <div className="mx-3 mb-3 bg-purple-50 border border-purple-200 rounded-lg overflow-hidden">
                          <div className="px-4 py-2 text-[10px] font-bold text-purple-700 uppercase tracking-wider">🤝 Model Agreement</div>
                          <div className="px-4 pb-3 text-xs text-gray-600">
                            <span className="font-semibold text-purple-700">✓ Consensus:</span> Skills transfer between frameworks · Both have excellent docs · React has more jobs
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={howItWorksRef} id="how-it-works" className="py-24 px-6 relative scroll-mt-20">
        {/* Purple gradient accent */}
        <div className="absolute top-1/2 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-purple-600 mb-4">Why Threadwork AI?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get the best of multiple AI models without the hassle of switching between them
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div
              className="bg-white border-2 border-gray-300 rounded-2xl p-8 hover:border-purple-400 focus-within:border-purple-500 transition-all duration-300 relative group"
              tabIndex={0}
              aria-label="Multiple AI models and their specialties"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
                <FiGrid className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multiple AI Models</h3>
              <p className="text-gray-600 leading-relaxed">
                Query a variety of AI models simultaneously. Each model brings unique strengths to your questions.
              </p>
              <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-4 w-[300px] -translate-x-1/2 rounded-xl border border-gray-200 bg-white/95 p-4 shadow-xl backdrop-blur transition-all duration-200 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Models & Specialties</div>
                <div className="mt-3 grid gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-blue-700">DeepSeek</span>
                    <span className="text-gray-600">Reasoning, math, coding</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-purple-700">Llama</span>
                    <span className="text-gray-600">Fast, general Q&A</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-cyan-700">GLM-4.6</span>
                    <span className="text-gray-600">Multilingual, reasoning</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-emerald-700">Qwen</span>
                    <span className="text-gray-600">Coding, tools</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-orange-700">Essential</span>
                    <span className="text-gray-600">Creative, writing</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-pink-700">Moonshot</span>
                    <span className="text-gray-600">Long reasoning</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div
              className="bg-white border-2 border-gray-300 rounded-2xl p-8 hover:border-purple-400 focus-within:border-purple-500 transition-all duration-300 relative group"
              tabIndex={0}
              aria-label="Smart synthesis details"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                <FiZap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Synthesis</h3>
              <p className="text-gray-600 leading-relaxed">
                Our synthesis engine combines the best insights from all models into one coherent, comprehensive response.
              </p>
              <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-4 w-[300px] -translate-x-1/2 rounded-xl border border-gray-200 bg-white/95 p-4 shadow-xl backdrop-blur transition-all duration-200 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">How It Works</div>
                <div className="mt-3 grid gap-2 text-sm text-gray-600">
                  <div>1. Models answer in parallel</div>
                  <div>2. Responses are cross-checked</div>
                  <div>3. Conflicts are resolved</div>
                  <div>4. One clear answer is produced</div>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div
              className="bg-white border-2 border-gray-300 rounded-2xl p-8 hover:border-purple-400 focus-within:border-purple-500 transition-all duration-300 relative group"
              tabIndex={0}
              aria-label="Accuracy and verification details"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-6">
                <FiShield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Better Accuracy</h3>
              <p className="text-gray-600 leading-relaxed">
                Cross-reference answers across models to reduce hallucinations and get more reliable information.
              </p>
              <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-4 w-[300px] -translate-x-1/2 rounded-xl border border-gray-200 bg-white/95 p-4 shadow-xl backdrop-blur transition-all duration-200 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reliability Checks</div>
                <div className="mt-3 grid gap-2 text-sm text-gray-600">
                  <div>Consensus signals higher confidence</div>
                  <div>Disagreements are explained</div>
                  <div>Reasoning is structured and visible</div>
                  <div>Verification steps are included</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 bg-gray-50 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-25"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-100 border border-purple-200 rounded-full text-sm text-purple-700 mb-6">
              Simple &amp; Powerful
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Three simple steps to smarter AI responses</p>
          </div>

          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-0.5">
              <div className="w-full h-full bg-gradient-to-r from-violet-300 via-purple-400 to-indigo-300 rounded-full"></div>
              {/* Animated dots on line */}
              <div className="absolute top-1/2 left-0 w-2 h-2 bg-violet-500 rounded-full -translate-y-1/2 animate-pulse"></div>
              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-purple-500 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse animation-delay-2000"></div>
              <div className="absolute top-1/2 right-0 w-2 h-2 bg-indigo-500 rounded-full -translate-y-1/2 animate-pulse animation-delay-4000"></div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="relative group">
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center hover:border-violet-300 hover:shadow-xl hover:shadow-violet-100/50 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform duration-300">
                    1
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Ask Your Question</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Type your question or prompt just like you would with any AI assistant.
                  </p>
                  {/* Mini illustration */}
                  <div className="mt-6 bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200">
                      <div className="w-1.5 h-4 bg-violet-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-400">What is quantum computing?</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative group">
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center hover:border-purple-300 hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                    2
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Models Respond</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Multiple AI models process your question simultaneously, each providing their perspective.
                  </p>
                  {/* Mini illustration */}
                  <div className="mt-6 grid grid-cols-3 gap-1.5">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 flex flex-col items-center">
                      <span className="text-sm">🔷</span>
                      <div className="w-full space-y-1 mt-1.5">
                        <div className="h-0.5 bg-blue-200 rounded-full w-full"></div>
                        <div className="h-0.5 bg-blue-200 rounded-full w-3/4"></div>
                      </div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 flex flex-col items-center">
                      <span className="text-sm">🦙</span>
                      <div className="w-full space-y-1 mt-1.5">
                        <div className="h-0.5 bg-purple-200 rounded-full w-full"></div>
                        <div className="h-0.5 bg-purple-200 rounded-full w-2/3"></div>
                      </div>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 flex flex-col items-center">
                      <span className="text-sm">✨</span>
                      <div className="w-full space-y-1 mt-1.5">
                        <div className="h-0.5 bg-emerald-200 rounded-full w-full"></div>
                        <div className="h-0.5 bg-emerald-200 rounded-full w-5/6"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative group">
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                    3
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Get Synthesized Answer</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Receive a unified response that combines the strengths of all models.
                  </p>
                  {/* Mini illustration */}
                  <div className="mt-6 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-emerald-600 text-xs">✓</span>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Synthesized</span>
                    </div>
                    <div className="space-y-1">
                      <div className="h-1 bg-emerald-200 rounded-full w-full"></div>
                      <div className="h-1 bg-emerald-200 rounded-full w-5/6"></div>
                      <div className="h-1 bg-emerald-200 rounded-full w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Synthesis Diagram Section */}
      <section className="py-24 px-6 bg-gray-50 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          {/* Flow Diagram */}
          <div className="relative">
            {/* Row 1: User Question */}
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl px-8 py-4 shadow-lg shadow-purple-500/20 max-w-sm w-full text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-purple-200 mb-1">Your Question</div>
                <p className="text-sm font-medium">"Is it better to learn React or Vue first?"</p>
              </div>
            </div>

            {/* Arrow down */}
            <div className="flex justify-center mb-6">
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-8 bg-gradient-to-b from-purple-400 to-gray-300"></div>
                <svg className="w-4 h-4 text-gray-400 -mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </div>
            </div>

            {/* Row 2: Parallel Models */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 max-w-3xl mx-auto">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
                <span className="text-lg">🔷</span>
                <div className="text-xs font-bold text-blue-700 mt-1">DeepSeek</div>
                <div className="mt-2 space-y-1">
                  <div className="h-0.5 bg-blue-200 rounded-full w-full"></div>
                  <div className="h-0.5 bg-blue-200 rounded-full w-4/5"></div>
                  <div className="h-0.5 bg-blue-200 rounded-full w-3/5"></div>
                </div>
                <p className="text-[10px] text-blue-600 mt-2 leading-tight">"Both are great — React for jobs..."</p>
              </div>
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 text-center">
                <span className="text-lg">🦙</span>
                <div className="text-xs font-bold text-purple-700 mt-1">Llama</div>
                <div className="mt-2 space-y-1">
                  <div className="h-0.5 bg-purple-200 rounded-full w-full"></div>
                  <div className="h-0.5 bg-purple-200 rounded-full w-3/4"></div>
                  <div className="h-0.5 bg-purple-200 rounded-full w-5/6"></div>
                </div>
                <p className="text-[10px] text-purple-600 mt-2 leading-tight">"React has a larger ecosystem..."</p>
              </div>
              <div className="bg-cyan-50 border-2 border-cyan-200 rounded-xl p-4 text-center">
                <span className="text-lg">🌐</span>
                <div className="text-xs font-bold text-cyan-700 mt-1">GLM-4.6</div>
                <div className="mt-2 space-y-1">
                  <div className="h-0.5 bg-cyan-200 rounded-full w-full"></div>
                  <div className="h-0.5 bg-cyan-200 rounded-full w-2/3"></div>
                  <div className="h-0.5 bg-cyan-200 rounded-full w-4/5"></div>
                </div>
                <p className="text-[10px] text-cyan-600 mt-2 leading-tight">"Vue's learning curve is gentler..."</p>
              </div>
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 text-center">
                <span className="text-lg">✨</span>
                <div className="text-xs font-bold text-emerald-700 mt-1">Qwen</div>
                <div className="mt-2 space-y-1">
                  <div className="h-0.5 bg-emerald-200 rounded-full w-full"></div>
                  <div className="h-0.5 bg-emerald-200 rounded-full w-5/6"></div>
                  <div className="h-0.5 bg-emerald-200 rounded-full w-2/3"></div>
                </div>
                <p className="text-[10px] text-emerald-600 mt-2 leading-tight">"Depends on your goals..."</p>
              </div>
            </div>

            {/* Converging arrows */}
            <div className="flex justify-center mb-6">
              <div className="relative w-64 h-12">
                {/* Left line */}
                <div className="absolute left-0 top-0 w-1/2 h-full">
                  <div className="absolute top-0 right-0 w-0.5 h-full bg-gradient-to-b from-purple-300 to-indigo-400 origin-top" style={{transform: 'rotate(-15deg)'}}></div>
                </div>
                {/* Center line */}
                <div className="absolute left-1/2 top-0 w-0.5 h-full bg-gradient-to-b from-gray-300 to-indigo-400 -translate-x-1/2"></div>
                {/* Right line */}
                <div className="absolute right-0 top-0 w-1/2 h-full">
                  <div className="absolute top-0 left-0 w-0.5 h-full bg-gradient-to-b from-emerald-300 to-indigo-400 origin-top" style={{transform: 'rotate(15deg)'}}></div>
                </div>
                {/* Arrow tip */}
                <svg className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </div>
            </div>

            {/* Row 3: Synthesis Engine */}
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border-2 border-indigo-300 rounded-2xl px-6 py-5 max-w-md w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/50 via-transparent to-violet-100/50 animate-pulse"></div>
                <div className="relative flex items-center justify-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                    <FiZap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-indigo-900">Synthesis Engine</div>
                    <div className="text-[11px] text-indigo-600">Cross-references • Resolves conflicts • Merges insights</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow down */}
            <div className="flex justify-center mb-6">
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-8 bg-gradient-to-b from-indigo-400 to-emerald-400"></div>
                <svg className="w-4 h-4 text-emerald-500 -mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </div>
            </div>

            {/* Row 4: Synthesized Output */}
            <div className="flex justify-center">
              <div className="bg-white border-2 border-emerald-300 rounded-2xl max-w-lg w-full shadow-lg shadow-emerald-100/50 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-3 flex items-center gap-2">
                  <span className="text-white text-sm">✓</span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Synthesized Answer</span>
                </div>
                {/* Body */}
                <div className="p-5 space-y-3">
                  <p className="text-sm text-gray-800 leading-relaxed">
                    <span className="font-semibold">Start with React</span> if you're targeting the job market — it has broader industry adoption.
                    However, <span className="font-semibold">Vue is better pedagogically</span> if your goal is understanding reactivity deeply.
                  </p>
                  {/* Agreement badge */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-2.5 flex items-start gap-2">
                    <span className="text-purple-600 text-xs mt-0.5">🤝</span>
                    <div>
                      <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wider mb-0.5">Model Agreement</div>
                      <p className="text-xs text-gray-600">All 4 models agreed: skills transfer between frameworks, both have excellent docs</p>
                    </div>
                  </div>
                  {/* Conflict badge */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 flex items-start gap-2">
                    <span className="text-amber-600 text-xs mt-0.5">⚖️</span>
                    <div>
                      <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-0.5">Resolved Disagreement</div>
                      <p className="text-xs text-gray-600">2 models favored React first, 2 favored Vue — resolved based on career vs. learning goals</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Models Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        {/* Purple gradient accents */}
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-25"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powered By Leading Models</h2>
            <p className="text-xl text-gray-600">Access the world's most advanced AI models in one place</p>
          </div>

          <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden">
            <div className="flex gap-6 marquee-right px-6">
              {[...MARQUEE_MODELS, ...MARQUEE_MODELS].map((m, i) => (
                <div key={`${m.name}-${i}`} className={`bg-white border-2 border-gray-300 rounded-2xl p-6 text-center ${m.hoverBorder} transition-colors duration-200 w-56 shrink-0`}>
                  <div className={`w-12 h-12 ${m.iconBg} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <span className="text-2xl">{m.emoji}</span>
                  </div>
                  <h3 className="font-bold text-gray-900">{m.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        {/* Purple gradient decorations */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
            {/* Animated background blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-blob"></div>
              <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
              {/* Sparkle grid dots */}
              <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px'}}></div>
            </div>
            
            <div className="relative">
              {/* Icon */}
              <div className="w-16 h-16 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <HiLightningBolt className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Ready to Get Started?</h2>
              <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands of users who are already getting smarter AI responses with Threadwork.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  to="/signup" 
                  className="w-full sm:w-auto px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg shadow-xl shadow-black/10 hover:shadow-2xl hover:bg-gray-50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  Create Free Account
                </Link>
                <button
                  onClick={scrollToHero}
                  className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-bold text-lg hover:bg-white/20 active:scale-[0.98] transition-all duration-200"
                >
                  Try It First
                </button>
              </div>

              {/* Trust signals */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-purple-200 text-sm">
                <div className="flex items-center gap-1.5">
                  <FiShield className="w-4 h-4" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FiZap className="w-4 h-4" />
                  <span>6 AI models included</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FiGrid className="w-4 h-4" />
                  <span>Instant access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                <HiLightningBolt className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">Threadwork AI</span>
            </div>
            
            <div className="flex items-center gap-8 text-gray-600 text-sm">
              <a href="/privacy-policy" className="hover:text-purple-600 transition-colors">Privacy Policy</a>
              <a href="/terms-of-service" className="hover:text-purple-600 transition-colors">Terms of Service</a>
              <a href="/contact" className="hover:text-purple-600 transition-colors">Contact</a>
            </div>
            
            <p className="text-gray-600 text-sm">
              © 2025 Threadwork AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      </div>

      {/* Trial Chat Overlay */}
      <div className={`fixed inset-0 z-50 transition-transform duration-500 ease-in-out ${
        showTrialChat && isTransitioning ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {showTrialChat && (
          <TrialChat onClose={closeChat} initialQuestion={initialQuestion} />
        )}
      </div>
    </div>
  );
}

export default LandingPage;
