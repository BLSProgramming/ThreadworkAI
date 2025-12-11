import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiLightningBolt } from 'react-icons/hi';
import { FiGrid, FiZap, FiShield } from 'react-icons/fi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { IoClose } from 'react-icons/io5';

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
    howItWorksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Landing Page */}
      <div className={`min-h-screen transition-transform duration-500 ease-in-out ${
        showTrialChat && isTransitioning ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}>
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <HiLightningBolt className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Threadwork AI</span>
              </div>
              <div className="flex items-center gap-4">
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm text-purple-300 mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Powered by Multiple AI Models
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight flex flex-col items-center">
              <span className="inline-block">One Question</span>
              <span className="inline-block bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Multiple Minds
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
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
                className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-200"
              >
                See How It Works
              </button>
            </div>

            {/* Try It Now Input */}
            <div className="mt-12 max-w-2xl mx-auto">
              <form onSubmit={handleTrialSubmit} className="relative">
                <div className="flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-2 focus-within:border-purple-500/50 focus-within:bg-white/15 transition-all duration-200">
                  <input
                    type="text"
                    value={trialInput}
                    onChange={(e) => setTrialInput(e.target.value)}
                    placeholder="Try it now — ask anything..."
                    className="flex-1 bg-transparent px-4 py-3 text-white placeholder:text-gray-400 outline-none text-lg"
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
                <p className="text-center text-gray-500 text-sm mt-3">
                  Trial uses 2 models • <Link to="/signup" className="text-purple-400 hover:text-purple-300">Sign up</Link> for full access
                </p>
              </form>
            </div>
          </div>

          {/* Hero Image/Demo */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10 pointer-events-none"></div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 shadow-2xl">
              <div className="bg-slate-800/80 rounded-2xl p-6 border border-white/5">
                {/* Mock chat interface */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">You</span>
                    </div>
                    <div className="bg-white/10 rounded-2xl rounded-tl-md px-4 py-3 text-gray-200">
                      What's the best way to learn programming in 2025?
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <HiLightningBolt className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded-2xl rounded-tl-md px-4 py-3 text-gray-200 flex-1">
                      <p className="text-sm text-purple-300 mb-2 font-medium">Threadwork</p>
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
      <section ref={howItWorksRef} id="how-it-works" className="py-24 px-6 relative scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why Threadwork AI?</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Get the best of multiple AI models without the hassle of switching between them
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
                <FiGrid className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Multiple AI Models</h3>
              <p className="text-gray-400 leading-relaxed">
                Query a variety of AI models simultaneously. Each model brings unique strengths to your questions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                <FiZap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Smart Synthesis</h3>
              <p className="text-gray-400 leading-relaxed">
                Our synthesis engine combines the best insights from all models into one coherent, comprehensive response.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-6">
                <FiShield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Better Accuracy</h3>
              <p className="text-gray-400 leading-relaxed">
                Cross-reference answers across models to reduce hallucinations and get more reliable information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-gray-400">Three simple steps to smarter AI responses</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Ask Your Question</h3>
              <p className="text-gray-400">
                Type your question or prompt just like you would with any AI assistant.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Models Respond</h3>
              <p className="text-gray-400">
                Multiple AI models process your question simultaneously, each providing their perspective.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Get Synthesized Answer</h3>
              <p className="text-gray-400">
                Receive a unified response that combines the strengths of all models.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Models Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Powered By Leading Models</h2>
            <p className="text-xl text-gray-400">Access the world's most advanced AI models in one place</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔷</span>
              </div>
              <h3 className="font-bold text-white">DeepSeek</h3>
              <p className="text-sm text-gray-500 mt-1">Reasoning Expert</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🦙</span>
              </div>
              <h3 className="font-bold text-white">Llama</h3>
              <p className="text-sm text-gray-500 mt-1">Meta's Powerhouse</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌐</span>
              </div>
              <h3 className="font-bold text-white">GLM-4</h3>
              <p className="text-sm text-gray-500 mt-1">Multilingual Master</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="font-bold text-white">Qwen</h3>
              <p className="text-sm text-gray-500 mt-1">Coding Specialist</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
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
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                <HiLightningBolt className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Threadwork AI</span>
            </div>
            
            <div className="flex items-center gap-8 text-gray-400 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            
            <p className="text-gray-500 text-sm">
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
          {/* Chat Navigation */}
          <nav className="bg-slate-900/80 backdrop-blur-lg border-b border-white/10">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <HiLightningBolt className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-white">Trial Chat</span>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">2 Models</span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={closeChat}
                    className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition-colors font-medium"
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
          <div className="flex-1 overflow-y-auto px-6 py-8">
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
                      : 'bg-white/10 text-gray-200 rounded-tl-md'
                  }`}>
                    {msg.role === 'assistant' && (
                      <p className="text-sm text-purple-300 mb-2 font-medium">Synthesized Response</p>
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
                  <div className="bg-white/10 rounded-2xl rounded-tl-md px-4 py-3 text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <span className="ml-2">Consulting AI Models...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Chat Input */}
          <div className="bg-slate-900/80 backdrop-blur-lg border-t border-white/10 px-6 py-4">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleChatSubmit} className="relative">
                <div className="flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-2 focus-within:border-purple-500/50 focus-within:bg-white/15 transition-all duration-200">
                  <input
                    type="text"
                    value={trialInput}
                    onChange={(e) => setTrialInput(e.target.value)}
                    placeholder="Ask another question..."
                    className="flex-1 bg-transparent px-4 py-3 text-white placeholder:text-gray-400 outline-none text-lg"
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
              <p className="text-center text-gray-500 text-sm mt-3">
                Trial is limited to 2 models • <Link to="/signup" className="text-purple-400 hover:text-purple-300">Sign up</Link> for all models & saved chats
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
