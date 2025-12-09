import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css';
import { HiLightningBolt } from '../assets/Icons';
import Collapsible from '../Components/Collapsible';

function HomePage() {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedModels, setSelectedModels] = useState({
    deepseek: true,
    llama: true,
    glm: true,
    qwen: true,
  });
  const [modelSearch, setModelSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const pendingChatRef = useRef(null);
  const isLoadingChatRef = useRef(false);

  const modelOptions = [
    { key: 'deepseek', label: 'DeepSeek' },
    { key: 'llama', label: 'Llama' },
    { key: 'glm', label: 'GLM-4.6' },
    { key: 'qwen', label: 'Qwen' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Inline CodeBlock component for copy UX per block
  const CodeBlock = ({ code, lang = 'text' }) => {
    const [copied, setCopied] = useState(false);
    const timeoutRef = useRef(null);

    useEffect(() => () => clearTimeout(timeoutRef.current), []);

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(code.trimEnd());
        setCopied(true);
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setCopied(false), 1800);
      } catch (err) {
        console.error('Copy failed', err);
      }
    };

    return (
      <pre className="relative bg-gray-900 text-gray-100 text-sm rounded-lg p-4 overflow-x-auto border border-gray-800 my-2">
        <div className="text-xs text-gray-400 mb-2 flex items-center gap-2">
          <span className="px-2 py-0.5 bg-gray-800 rounded uppercase tracking-wide">{lang}</span>
          <span>Code</span>
          <button
            type="button"
            onClick={handleCopy}
            className={`ml-auto px-3 py-1 text-[11px] font-semibold rounded border transition transform active:scale-95 ${
              copied
                ? 'bg-emerald-600 text-white border-emerald-700'
                : 'bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700'
            }`}
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <code className={`block whitespace-pre language-${lang.toLowerCase()}`}>{code.trimEnd()}</code>
      </pre>
    );
  };

  // Render text with headings, lists, inline bold, and fenced code blocks (```lang\ncode```)
  const renderFormattedContent = (text, { headingClass = 'text-indigo-700', bulletColor = 'text-indigo-600' } = {}) => {
    if (!text) return null;

    const renderInlineBold = (str) => {
      const parts = str.split(/(\*\*[^*]+\*\*)/g);
      return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={`bold-${i}`}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });
    };

    const renderLines = (block, blockIndex) => {
      const lines = block.split('\n');
      return lines.map((line, idx) => {
        const key = `${blockIndex}-${idx}`;
        const trimmed = line.trim();
        if (!trimmed) return <div key={key} className="h-2" />;

        const subheaderMatch = trimmed.match(/^\*([^*]+)\*$/);
        if (subheaderMatch) {
          return (
            <h4 key={key} className={`font-bold ${headingClass} text-sm mt-3 mb-1`}>
              {subheaderMatch[1]}
            </h4>
          );
        }

        if (/^#{1,3}\s/.test(trimmed) || /^[A-Z][A-Za-z\s\-‑]+:$/.test(trimmed) || /^[A-Z][A-Za-z\s\-‑]+\s*\([^)]+\)$/.test(trimmed)) {
          const headerText = trimmed.replace(/^#+\s*/, '').replace(/:$/, '');
          return (
            <h3 key={key} className={`font-bold ${headingClass} text-sm mt-4 mb-2 uppercase tracking-wide`}>
              {headerText}
            </h3>
          );
        }

        const numberedBoldMatch = trimmed.match(/^(\d+)\.?\s*\*\*([^*]+)\*\*:?:?\s*(.*)$/);
        if (numberedBoldMatch) {
          return (
            <div key={key} className="ml-4 my-1 text-sm text-gray-800 flex">
              <span className={`font-bold ${headingClass} mr-2 min-w-[1.5rem]`}>{numberedBoldMatch[1]}.</span>
              <span>
                <strong className="text-gray-900">{numberedBoldMatch[2]}</strong>
                {numberedBoldMatch[3] ? `: ${numberedBoldMatch[3]}` : ''}
              </span>
            </div>
          );
        }

        const numberedLabelMatch = trimmed.match(/^(\d+)\.\s*([A-Za-z][A-Za-z\s\-‑]+):\s*(.+)$/);
        if (numberedLabelMatch) {
          return (
            <div key={key} className="ml-4 my-1 text-sm text-gray-800 flex">
              <span className={`font-bold ${headingClass} mr-2 min-w-[1.5rem]`}>{numberedLabelMatch[1]}.</span>
              <span>
                <strong className="text-gray-900">{numberedLabelMatch[2]}</strong>: {numberedLabelMatch[3]}
              </span>
            </div>
          );
        }

        const numberedMatch = trimmed.match(/^(\d+)\.\s*(.+)$/);
        if (numberedMatch) {
          return (
            <div key={key} className="ml-4 my-1 text-sm text-gray-800 flex">
              <span className={`font-bold ${headingClass} mr-2 min-w-[1.5rem]`}>{numberedMatch[1]}.</span>
              <span>{renderInlineBold(numberedMatch[2])}</span>
            </div>
          );
        }

        const bulletMatch = trimmed.match(/^[\-•\*]\s+(.+)$/);
        if (bulletMatch) {
          return (
            <div key={key} className="ml-4 my-1 text-sm text-gray-800 flex gap-2">
              <span className={`${bulletColor} font-bold`}>•</span>
              <span>{renderInlineBold(bulletMatch[1])}</span>
            </div>
          );
        }

        return (
          <p key={key} className="text-sm leading-relaxed text-gray-800">
            {renderInlineBold(trimmed)}
          </p>
        );
      });
    };

    const renderCodeBlock = (code, lang = 'text', key) => <CodeBlock key={key} code={code} lang={lang} />;

    const segments = [];
    const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeRegex.exec(text)) !== null) {
      const [fullMatch, lang, code] = match;
      const before = text.slice(lastIndex, match.index);
      if (before.trim()) {
        segments.push({ type: 'text', content: before });
      }
      segments.push({ type: 'code', content: code, lang: lang || 'text' });
      lastIndex = match.index + fullMatch.length;
    }
    const after = text.slice(lastIndex);
    if (after.trim()) {
      segments.push({ type: 'text', content: after });
    }

    return segments.map((segment, idx) => {
      if (segment.type === 'code') {
        return renderCodeBlock(segment.content, segment.lang, `code-${idx}`);
      }
      return <div key={`text-${idx}`}>{renderLines(segment.content, idx)}</div>;
    });
  };

  const persistChats = (updater) => {
    const chats = JSON.parse(localStorage.getItem('chats') || '[]');
    const updated = updater(chats);
    localStorage.setItem('chats', JSON.stringify(updated));
    window.dispatchEvent(new Event('chats-updated'));
    return updated;
  };

  useEffect(() => {
    isLoadingChatRef.current = true;
    if (chatId) {
      const chats = JSON.parse(localStorage.getItem('chats') || '[]');
      const currentChat = chats.find((chat) => chat.id === chatId);
      if (currentChat && currentChat.messages) {
        setMessages(currentChat.messages);
      } else {
        setMessages([]);
      }
      pendingChatRef.current = null;
    } else {
      setMessages([]);
    }
    setTimeout(() => {
      isLoadingChatRef.current = false;
    }, 100);
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    Prism.highlightAll();
  }, [messages]);

  useEffect(() => {
    if (chatId && messages.length > 0 && !isLoadingChatRef.current) {
      persistChats((chats) => {
        const chatIndex = chats.findIndex((chat) => chat.id === chatId);
        if (chatIndex !== -1) {
          chats[chatIndex].messages = messages;
        }
        return chats;
      });
    }
  }, [messages, chatId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const activeModels = modelOptions
      .filter((opt) => selectedModels[opt.key])
      .map((opt) => opt.key);

    if (!activeModels.length) return;

    const userMessage = { id: Date.now(), text: input, sender: 'user' };
    const nextMessages = [...messages, userMessage];
    const savedInput = input;

    let currentChatId = chatId;
    if (!chatId) {
      const newChatId = `chat-${Date.now()}`;
      currentChatId = newChatId;
      pendingChatRef.current = { id: newChatId, userMessage: nextMessages };

      const chats = JSON.parse(localStorage.getItem('chats') || '[]');
      const newChat = {
        id: newChatId,
        title: input.substring(0, 30) || 'New Chat',
        createdAt: new Date().toISOString(),
        messages: nextMessages,
      };
      chats.unshift(newChat);
      localStorage.setItem('chats', JSON.stringify(chats));
      setTimeout(() => {
        window.dispatchEvent(new Event('chats-updated'));
      }, 0);
      navigate(`/chat/${newChatId}`);
    } else {
      setMessages(nextMessages);
      persistChats((chats) => {
        const chatIndex = chats.findIndex((chat) => chat.id === currentChatId);
        if (chatIndex !== -1) {
          const chat = chats[chatIndex];
          chat.messages = nextMessages;
          if (!chat.title || chat.title === 'New Chat') {
            chat.title = userMessage.text.substring(0, 30) || 'New Chat';
          }
        }
        return chats;
      });
    }

    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: savedInput, models: activeModels }),
      });

      if (response.ok) {
        const data = await response.json();
        let botMessages = [];
        if (data.responses && Array.isArray(data.responses)) {
          const modelResponses = {};
          data.responses.forEach((resp) => {
            modelResponses[resp.model] = resp.response;
          });

          botMessages = [
            {
              id: Date.now() + Math.random(),
              text: modelResponses['GPT-OSS'] || 'No response',
              sender: 'bot',
              model: 'Threadwork AI',
              allResponses: {
                deepseek: modelResponses['DeepSeek'],
                llama: modelResponses['Llama'],
                glm: modelResponses['GLM'],
                qwen: modelResponses['Qwen'],
              },
            },
          ];
        } else {
          botMessages = [{ id: Date.now() + 1, text: 'No response received', sender: 'bot' }];
        }

        setMessages((currentMessages) => {
          const merged = [...currentMessages, ...botMessages];
          persistChats((chats) => {
            const chatIndex = chats.findIndex((chat) => chat.id === currentChatId);
            if (chatIndex !== -1) {
              chats[chatIndex].messages = merged;
            }
            return chats;
          });
          return merged;
        });
      } else {
        const botMessage = { id: Date.now() + 1, text: 'Error: Could not get response', sender: 'bot' };
        setMessages((currentMessages) => {
          const merged = [...currentMessages, botMessage];
          persistChats((chats) => {
            const chatIndex = chats.findIndex((chat) => chat.id === currentChatId);
            if (chatIndex !== -1) {
              chats[chatIndex].messages = merged;
            }
            return chats;
          });
          return merged;
        });
      }
    } catch (err) {
      const botMessage = { id: Date.now() + 1, text: 'Network error. Please try again.', sender: 'bot' };
      setMessages((currentMessages) => {
        const merged = [...currentMessages, botMessage];
        persistChats((chats) => {
          const chatIndex = chats.findIndex((chat) => chat.id === currentChatId);
          if (chatIndex !== -1) {
            chats[chatIndex].messages = merged;
          }
          return chats;
        });
        return merged;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const lastBotId = [...messages].reverse().find((m) => m.sender === 'bot')?.id;
  const filteredModels = modelOptions.filter((opt) =>
    opt.label.toLowerCase().includes(modelSearch.toLowerCase())
  );

  return (
    <>
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-3 py-6 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Threadwork AI</p>
              <h1 className="text-2xl font-semibold text-gray-900">Multi-model copilot</h1>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full">Synthesized answers</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">4 model views</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <div>
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Model Selection</p>
                <p className="text-sm text-gray-600">Pick which models to include</p>
              </div>
              <input
                type="text"
                value={modelSearch}
                onChange={(e) => setModelSearch(e.target.value)}
                placeholder="Search models..."
                className="w-56 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div className="p-4 space-y-3">
              {filteredModels.map((opt) => (
                <div
                  key={opt.key}
                  className="flex items-center justify-between px-3 py-3 border border-gray-100 rounded-lg hover:border-indigo-200 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{opt.label}</p>
                    <p className="text-xs text-gray-500">Enable this model in the ensemble</p>
                  </div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={!!selectedModels[opt.key]}
                      onChange={() =>
                        setSelectedModels((prev) => ({ ...prev, [opt.key]: !prev[opt.key] }))
                      }
                    />
                    <span
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                        selectedModels[opt.key] ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${
                          selectedModels[opt.key] ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </span>
                  </label>
                </div>
              ))}

              {filteredModels.length === 0 && (
                <div className="text-center py-6 text-sm text-gray-500">
                  No models found matching "{modelSearch}"
                </div>
              )}
            </div>
          </div>

          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                <HiLightningBolt className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Ready to assist you</h2>
              <p className="text-gray-600 max-w-md mb-8">
                Ask me anything and get responses from multiple AI models, synthesized into one comprehensive answer
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
                  <p className="text-sm font-medium text-gray-900 mb-1">🎯 Multiple models</p>
                  <p className="text-xs text-gray-600">Select models above</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id}>
                  {message.sender === 'user' ? (
                    <div className="flex justify-end mb-4">
                      <div className="max-w-2xl bg-indigo-600 text-white rounded-lg rounded-br-none px-4 py-3">
                        <p className="text-sm leading-relaxed">{message.text}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-6 mb-4">
                      {message.allResponses && Object.keys(message.allResponses || {}).length > 0 && (
                        <div className="flex-[0.75] max-w-xl space-y-4">
                          {[
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
                            {
                              key: 'glm',
                              title: 'GLM-4.6',
                              container: 'bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200',
                              heading: 'text-cyan-700',
                              collapse: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100',
                            },
                            {
                              key: 'qwen',
                              title: 'Qwen',
                              container: 'bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200',
                              heading: 'text-emerald-700',
                              collapse: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
                            },
                          ]
                            .filter((item) => message.allResponses[item.key])
                            .map((item) => (
                              <div
                                key={item.key}
                                className={`${item.container} rounded-lg shadow-sm`}
                              >
                                <Collapsible
                                  defaultOpen={false}
                                  titleClassName={`px-4 py-3 text-xs font-bold ${item.heading} uppercase tracking-wider`}
                                  title={item.title}
                                  showCollapseButton={true}
                                  collapseButtonClassName={item.collapse}
                                >
                                  <div className="px-4 pb-6 pt-1 space-y-2 text-sm text-gray-900">
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

                      <div className="flex-[2.25]">
                        <div className="bg-gray-100 text-gray-900 rounded-lg rounded-bl-none h-fit" key={`detail-${message.id}`}>
                          <Collapsible
                            defaultOpen={message.id === lastBotId}
                            titleClassName="px-4 py-3 text-xs font-semibold text-indigo-600 uppercase tracking-wider"
                            title={<span>{message.model ? `✓ ${message.model}` : 'Threadwork AI'}</span>}
                            showCollapseButton={true}
                            collapseButtonClassName="bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                          >
                            <div className="px-4 pb-6 pt-1 space-y-3 text-gray-900">
                              {renderFormattedContent(message.text || 'No response', {
                                headingClass: 'text-indigo-700',
                                bulletColor: 'text-indigo-600',
                              })}
                            </div>
                          </Collapsible>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg rounded-bl-none">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-3 py-4">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Send a message..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default HomePage;