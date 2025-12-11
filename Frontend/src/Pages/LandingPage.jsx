import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiLightningBolt } from 'react-icons/hi';
import { FiGrid, FiZap, FiShield } from 'react-icons/fi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { IoClose } from 'react-icons/io5';
import Navbar from '../Components/Navbar';

function LandingPage() {
  const navigate = useNavigate();
  const [trialInput, setTrialInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTrialChat, setShowTrialChat] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const howItWorksRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const openChat = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowTrialChat(true);
    }, 50);
  };

  const closeChat = () => {
    setIsTransitioning(false);
    setTimeout(() => {
      setShowTrialChat(false);
      setMessages([]);
      setTrialInput('');
    }, 500);
  };

  const handleTrialSubmit = async (e) => {
    e.preventDefault();
    if (!trialInput.trim()) return;
    
    const userMessage = trialInput;
    openChat();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setTrialInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/trial-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.responses && Array.isArray(data.responses)) {
          const modelResponses = {};
          data.responses.forEach((resp) => {
            modelResponses[resp.model] = resp.response;
          });
          const synthesized = modelResponses['GPT-OSS'] || 'No synthesis available';
          setMessages(prev => [...prev, { role: 'assistant', content: synthesized }]);
        }
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Network error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!trialInput.trim()) return;
    
    const userMessage = trialInput;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setTrialInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/trial-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.responses && Array.isArray(data.responses)) {
          const modelResponses = {};
          data.responses.forEach((resp) => {
            modelResponses[resp.model] = resp.response;
          });
          const synthesized = modelResponses['GPT-OSS'] || 'No synthesis available';
          setMessages(prev => [...prev, { role: 'assistant', content: synthesized }]);
        }
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Network error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
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
                    type="text"
                    value={trialInput}
                    onChange={(e) => setTrialInput(e.target.value)}
                    placeholder="Try it now — ask anything..."
                    className="flex-1 bg-transparent px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none text-lg"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !trialInput.trim()}
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
                {/* Mock chat interface */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">You</span>
                    </div>
                    <div className="bg-gray-200 rounded-2xl rounded-tl-md px-4 py-3 text-gray-900">
                      What's the best way to learn programming in 2025?
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <HiLightningBolt className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-purple-100 border border-purple-300 rounded-2xl rounded-tl-md px-4 py-3 text-gray-900 flex-1">
                      <p className="text-sm text-purple-700 mb-2 font-medium">Threadwork</p>
                      <p>Based on insights from multiple AI models, the most effective approach combines: interactive coding platforms, project-based learning, and consistent daily practice. Start with Python or JavaScript...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={howItWorksRef} id="how-it-works" className="py-24 px-6 relative scroll-mt-20 overflow-hidden">
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
            <div className="bg-white border-2 border-gray-300 rounded-2xl p-8 hover:border-purple-400 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
                <FiGrid className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multiple AI Models</h3>
              <p className="text-gray-600 leading-relaxed">
                Query a variety of AI models simultaneously. Each model brings unique strengths to your questions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border-2 border-gray-300 rounded-2xl p-8 hover:border-purple-400 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                <FiZap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Synthesis</h3>
              <p className="text-gray-600 leading-relaxed">
                Our synthesis engine combines the best insights from all models into one coherent, comprehensive response.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border-2 border-gray-300 rounded-2xl p-8 hover:border-purple-400 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-6">
                <FiShield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Better Accuracy</h3>
              <p className="text-gray-600 leading-relaxed">
                Cross-reference answers across models to reduce hallucinations and get more reliable information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 bg-gray-50 relative overflow-hidden">
        {/* Purple gradient decorations */}
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-25"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Three simple steps to smarter AI responses</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Ask Your Question</h3>
              <p className="text-gray-600">
                Type your question or prompt just like you would with any AI assistant.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Models Respond</h3>
              <p className="text-gray-600">
                Multiple AI models process your question simultaneously, each providing their perspective.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Get Synthesized Answer</h3>
              <p className="text-gray-600">
                Receive a unified response that combines the strengths of all models.
              </p>
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white border-2 border-gray-300 rounded-2xl p-6 text-center hover:border-blue-400 transition-all">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔷</span>
              </div>
              <h3 className="font-bold text-gray-900">DeepSeek</h3>
              <p className="text-sm text-gray-600 mt-1">Reasoning Expert</p>
            </div>

            <div className="bg-white border-2 border-gray-300 rounded-2xl p-6 text-center hover:border-purple-400 transition-all">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🦙</span>
              </div>
              <h3 className="font-bold text-gray-900">Llama</h3>
              <p className="text-sm text-gray-600 mt-1">Meta's Powerhouse</p>
            </div>

            <div className="bg-white border-2 border-gray-300 rounded-2xl p-6 text-center hover:border-cyan-400 transition-all">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌐</span>
              </div>
              <h3 className="font-bold text-gray-900">GLM-4</h3>
              <p className="text-sm text-gray-600 mt-1">Multilingual Master</p>
            </div>

            <div className="bg-white border-2 border-gray-300 rounded-2xl p-6 text-center hover:border-emerald-400 transition-all">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="font-bold text-gray-900">Qwen</h3>
              <p className="text-sm text-gray-600 mt-1">Coding Specialist</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        {/* Purple gradient decorations */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative">
              <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
              <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
                Join thousands of users who are already getting smarter AI responses with Threadwork.
              </p>
              <Link 
                to="/signup" 
                className="inline-block px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:bg-gray-50 active:scale-[0.98] transition-all duration-200"
              >
                Create Free Account
              </Link>
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

      {/* Chat Overlay - Slides in from right */}
      <div className={`fixed inset-0 z-50 transition-transform duration-500 ease-in-out ${
        showTrialChat && isTransitioning ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="min-h-screen bg-white flex flex-col">
          {/* Chat Navigation */}
          <nav className="bg-white border-b border-gray-300">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <HiLightningBolt className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">Threadwork AI</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">2 Models</span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={closeChat}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
                  >
                    <IoClose className="w-5 h-5" />
                    Close
                  </button>
                  <Link 
                    to="/signup" 
                    className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-500 hover:to-purple-500 transition-all duration-200 shadow-lg shadow-purple-500/25"
                  >
                    Sign Up for Full Access
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 py-8 bg-gray-50">
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex items-start gap-3 animate-fadeIn ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <HiLightningBolt className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={`rounded-2xl px-4 py-3 max-w-2xl ${
                    msg.role === 'user' 
                      ? 'bg-purple-600 text-white rounded-tr-md' 
                      : 'bg-white border border-gray-300 text-gray-900 rounded-tl-md'
                  }`}>
                    {msg.role === 'assistant' && (
                      <p className="text-sm text-purple-600 mb-2 font-medium">Threadwork</p>
                    )}
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">You</span>
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start gap-3 animate-fadeIn">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <HiLightningBolt className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-gray-300 rounded-2xl rounded-tl-md px-4 py-3 text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <span className="ml-2">Consulting AI Models...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Chat Input */}
          <div className="bg-white border-t border-gray-300 px-6 py-4">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleChatSubmit} className="relative">
                <div className="flex items-center bg-white border-2 border-gray-300 rounded-2xl p-2 focus-within:border-purple-500 focus-within:bg-gray-50 transition-all duration-200">
                  <input
                    type="text"
                    value={trialInput}
                    onChange={(e) => setTrialInput(e.target.value)}
                    placeholder="Ask another question..."
                    className="flex-1 bg-transparent px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none text-lg"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !trialInput.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                  >
                    {isLoading ? (
                      <AiOutlineLoading3Quarters className="w-5 h-5 animate-spin" />
                    ) : (
                      <HiLightningBolt className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </form>
              <p className="text-center text-gray-600 text-sm mt-3">
                Trial is limited to 2 models • <Link to="/signup" className="text-purple-600 hover:text-purple-700 font-medium">Sign up</Link> for all models & saved chats
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
