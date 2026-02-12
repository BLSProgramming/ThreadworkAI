import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiLightningBolt } from '../assets/Icons';
import { IoClose } from 'react-icons/io5';
import Collapsible from './Collapsible';
import { useContentRenderer } from '../hooks/useContentRenderer.jsx';
import { parseSynthesisNew, parseReasoningSections } from '../utils/contentFormatting';

function TrialChat({ onClose, initialQuestion = '' }) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const hasSentInitial = useRef(false);

  const { renderFormattedContent } = useContentRenderer();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-send the initial question from the landing page input
  useEffect(() => {
    if (initialQuestion && !hasSentInitial.current) {
      hasSentInitial.current = true;
      sendMessage(initialQuestion);
    }
  }, [initialQuestion]);

  // Render synthesis sections matching HomePage format
  const renderSynthesis = (text) => {
    const sections = parseSynthesisNew(text);

    if (!sections) {
      return renderFormattedContent(text);
    }

    const reasoningSubs = parseReasoningSections(sections.reasoning);

    return (
      <div className="space-y-4">
        {/* Answer */}
        {sections.answer && (
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-xl shadow-md overflow-hidden">
            <Collapsible
              defaultOpen={true}
              titleClassName="px-5 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold text-lg"
              title={<span className="flex items-center gap-2">✓ Answer</span>}
              showCollapseButton={true}
              collapseButtonClassName="mt-2 bg-emerald-500 text-white hover:bg-emerald-400 rounded-lg"
            >
              <div className="px-5 py-4 pb-12 space-y-4 text-gray-800">
                {renderFormattedContent(sections.answer, {
                  headingClass: 'text-emerald-700',
                  bulletColor: 'text-emerald-600',
                })}
              </div>
            </Collapsible>
          </div>
        )}

        {/* Model Agreement */}
        {reasoningSubs && (reasoningSubs.consensus || reasoningSubs.conflicts) && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg shadow-sm overflow-hidden">
            <Collapsible
              defaultOpen={!reasoningSubs.conflicts}
              titleClassName="px-4 py-3 text-xs font-bold text-purple-700 uppercase tracking-wider"
              title={<span className="flex items-center gap-2">🤝 Model Agreement</span>}
              showCollapseButton={true}
              collapseButtonClassName="mt-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg"
            >
              <div className="px-4 pb-4 pt-2 space-y-3 text-gray-700 text-sm">
                {reasoningSubs.consensus && (
                  <div>
                    <h4 className="font-bold text-purple-700 text-sm mb-2 flex items-center gap-1">✓ Consensus</h4>
                    <p className="text-xs text-purple-600 mb-2 italic">All models agreed on these points:</p>
                    {renderFormattedContent(reasoningSubs.consensus, {
                      headingClass: 'text-purple-700',
                      bulletColor: 'text-purple-600',
                    })}
                  </div>
                )}
                {reasoningSubs.conflicts && (
                  <div className="mt-3 pt-3 border-t border-purple-200 bg-orange-50 -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
                    <h4 className="font-bold text-orange-700 text-sm mb-2 flex items-center gap-1">⚡ Where Models Disagreed</h4>
                    <p className="text-xs text-orange-600 mb-2 italic">Models had different opinions. The choice below explains the reasoning:</p>
                    {renderFormattedContent(reasoningSubs.conflicts, {
                      headingClass: 'text-orange-700',
                      bulletColor: 'text-orange-600',
                    })}
                  </div>
                )}
              </div>
            </Collapsible>
          </div>
        )}

        {/* Verification */}
        {reasoningSubs && reasoningSubs.checks && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm overflow-hidden">
            <Collapsible
              defaultOpen={true}
              titleClassName="px-4 py-3 text-xs font-bold text-blue-700 uppercase tracking-wider"
              title={<span className="flex items-center gap-2">🔍 How to Verify This Answer</span>}
              showCollapseButton={true}
              collapseButtonClassName="mt-2 bg-blue-200 text-blue-700 hover:bg-blue-300 rounded-lg"
            >
              <div className="px-4 pb-4 pt-2 space-y-3 text-gray-700 text-sm bg-white">
                <p className="text-xs text-blue-600 italic mb-2">Use these checks to confirm the answer is correct:</p>
                {renderFormattedContent(reasoningSubs.checks, {
                  headingClass: 'text-blue-700',
                  bulletColor: 'text-blue-600',
                })}
              </div>
            </Collapsible>
          </div>
        )}

        {/* Fallback reasoning */}
        {sections.reasoning && !reasoningSubs && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg shadow-sm overflow-hidden">
            <Collapsible
              defaultOpen={false}
              titleClassName="px-4 py-3 text-xs font-bold text-purple-700 uppercase tracking-wider"
              title={<span className="flex items-center gap-2">🧠 How we got this answer</span>}
              showCollapseButton={true}
              collapseButtonClassName="mt-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg"
            >
              <div className="px-4 pb-4 pt-2 space-y-3 text-gray-700 text-sm">
                {renderFormattedContent(sections.reasoning, {
                  headingClass: 'text-purple-700',
                  bulletColor: 'text-purple-600',
                })}
              </div>
            </Collapsible>
          </div>
        )}

        {/* Tips */}
        {sections.tips && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg shadow-sm overflow-hidden">
            <Collapsible
              defaultOpen={true}
              titleClassName="px-4 py-2 bg-amber-100 text-amber-700 font-bold text-sm"
              title={<span className="flex items-center gap-2">💡 Tips</span>}
              showCollapseButton={true}
              collapseButtonClassName="mt-2 bg-amber-200 text-amber-700 hover:bg-amber-300 rounded-lg"
            >
              <div className="px-4 py-3 pr-14 space-y-2 text-gray-700 text-sm">
                {renderFormattedContent(sections.tips, {
                  headingClass: 'text-amber-700',
                  bulletColor: 'text-amber-600',
                })}
              </div>
            </Collapsible>
          </div>
        )}
      </div>
    );
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessageId = Date.now();
    const botMessageId = userMessageId + 1;
    const allResponses = {};

    setMessages((prev) => [...prev, { id: userMessageId, text, sender: 'user' }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/trial-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, text: 'Something went wrong. Please try again.', sender: 'bot' },
        ]);
        return;
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const upsertBotMessage = (update) => {
        setMessages((currentMessages) => {
          const existing = currentMessages.find((m) => m.id === botMessageId);
          if (existing) {
            return currentMessages.map((m) =>
              m.id === botMessageId
                ? {
                    ...m,
                    ...update,
                    allResponses: { ...m.allResponses, ...allResponses },
                  }
                : m
            );
          }
          return [
            ...currentMessages,
            {
              id: botMessageId,
              text: null,
              sender: 'bot',
              model: 'Threadwork AI',
              allResponses: { ...allResponses },
              ...update,
            },
          ];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        for (let i = 0; i < lines.length - 1; i += 1) {
          const line = lines[i];
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6);
          try {
            const event = JSON.parse(jsonStr);
            if (event.type === 'model_response') {
              const { model, response: modelText } = event.data;
              allResponses[model.toLowerCase()] = modelText;
              upsertBotMessage({});
            } else if (event.type === 'synthesis') {
              upsertBotMessage({ text: event.data?.response || '' });
            } else if (event.type === 'done') {
              setIsLoading(false);
            }
          } catch (err) {
            console.error('Trial chat SSE parse error:', err);
          }
        }

        buffer = lines[lines.length - 1];
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: 'Network error. Please try again.', sender: 'bot' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const TRIAL_MODEL_STYLES = [
    {
      key: 'deepseek',
      title: 'DeepSeek',
      container: 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200',
      heading: 'text-blue-700',
      collapse: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    },
    {
      key: 'llama',
      title: 'Llama',
      container: 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200',
      heading: 'text-purple-700',
      collapse: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
    },
  ];

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Top bar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <HiLightningBolt className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">Threadwork AI</span>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full font-medium">Trial · 2 Models</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm"
              >
                <IoClose className="w-4 h-4" />
                Close
              </button>
              <Link
                to="/signup"
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-all shadow-sm"
              >
                Sign Up for Full Access
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-3 py-6 space-y-6">
          {/* Header card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Threadwork AI</p>
              <h1 className="text-2xl font-semibold text-gray-900">Trial Chat</h1>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full">Synthesized answers</span>
            </div>
          </div>

          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                <HiLightningBolt className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Try Threadwork AI</h2>
              <p className="text-gray-600 max-w-md mb-8">
                Ask anything below. Trial uses 2 models — sign up to unlock all models and saved chats.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full">
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-1">✨ Better answers</p>
                  <p className="text-xs text-gray-600">Synthesized final response</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-1">🔍 Compare models</p>
                  <p className="text-xs text-gray-600">Side-by-side context</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-1">🎯 2 trial models</p>
                  <p className="text-xs text-gray-600">Llama & Qwen</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="mb-6">
                  {message.sender === 'user' ? (
                    <div className="flex justify-end items-end gap-3">
                      <div className="max-w-2xl bg-indigo-600 text-white rounded-xl rounded-br-none px-4 py-3 shadow-sm">
                        <p className="text-sm leading-relaxed break-words">{message.text}</p>
                      </div>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex-shrink-0 mb-1">
                        👤
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-6 min-w-0">
                      {/* Individual model responses */}
                      {message.allResponses && Object.keys(message.allResponses).length > 0 && (
                        <div className="flex-[0.75] max-w-xl space-y-4 min-w-0">
                          {TRIAL_MODEL_STYLES.filter((item) => message.allResponses[item.key])
                            .map((item) => (
                              <div
                                key={item.key}
                                className={`${item.container} rounded-xl shadow-sm overflow-hidden border-l-4 transition-shadow hover:shadow-md`}
                              >
                                <Collapsible
                                  defaultOpen={false}
                                  titleClassName={`px-4 py-3 text-xs font-bold ${item.heading} uppercase tracking-wider font-mono`}
                                  title={item.title}
                                  showCollapseButton={true}
                                  collapseButtonClassName={`mt-2 ${item.collapse} rounded-lg`}
                                >
                                  <div className="px-4 pb-4 pt-2 space-y-3 text-sm text-gray-900">
                                    {renderFormattedContent(message.allResponses[item.key] || 'No response', {
                                      headingClass: item.heading,
                                      bulletColor: item.heading,
                                    })}
                                  </div>
                                </Collapsible>
                              </div>
                            ))}
                        </div>
                      )}

                      {/* Synthesized response */}
                      <div className="flex-[2.25] min-w-0">
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 rounded-xl rounded-bl-none h-fit shadow-sm">
                          {message.text ? (
                            <Collapsible
                              defaultOpen={true}
                              titleClassName="px-4 py-3 text-xs font-bold text-indigo-700 uppercase tracking-wider font-mono"
                              title={
                                <span className="flex items-center gap-3">
                                  <span className="text-emerald-600">✓</span>
                                  {message.model || 'Threadwork AI'}
                                </span>
                              }
                              showCollapseButton={false}
                              collapseButtonClassName="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg font-semibold"
                            >
                              <div className="px-4 pb-4 pt-2 space-y-3 text-sm text-gray-800">
                                {renderSynthesis(message.text)}
                              </div>
                            </Collapsible>
                          ) : (
                            <div className="px-4 py-8 text-center">
                              <div className="inline-block">
                                <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
                              </div>
                              <p className="mt-3 text-sm text-gray-600">Synthesizing response...</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 px-4 py-3 rounded-xl rounded-bl-none shadow-sm">
                    <div className="flex gap-2 items-center">
                      <span className="text-xs text-gray-600 font-medium">Generating response</span>
                      <div className="flex gap-1.5 ml-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input bar */}
      <div className="border-t border-gray-200 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="flex gap-3 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Send
            </button>
          </form>
          <p className="text-center text-gray-500 text-xs mt-3">
            Trial is limited to 2 models ·{' '}
            <Link to="/signup" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Sign up
            </Link>{' '}
            for all models & saved chats
          </p>
        </div>
      </div>
    </div>
  );
}

export default TrialChat;
