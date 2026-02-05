import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiLightningBolt } from '../assets/Icons';
import Collapsible from '../Components/Collapsible';
import { streamChat } from '../utils/streamChat';
import ModelSelector from '../Components/ModelSelector';
import { useContentRenderer } from '../hooks/useContentRenderer.jsx';
import { useChatPersistence } from '../hooks/useChatPersistence.jsx';
import { parseSynthesisNew, parseReasoningSections, MODEL_OPTIONS, MODEL_STYLES, INITIAL_MODELS_STATE } from '../utils/contentFormatting';

function HomePage() {
  // State
  const navigate = useNavigate();
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedModels, setSelectedModels] = useState(INITIAL_MODELS_STATE);
  const [isLoading, setIsLoading] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const pendingChatRef = useRef(null);
  const isLoadingChatRef = useRef(false);
  const currentAbortRef = useRef(null);

  // Hooks
  const { renderFormattedContent } = useContentRenderer();
  const { persistChats, saveChatToDatabase } = useChatPersistence();

  // Constants
  const modelOptions = useMemo(() => MODEL_OPTIONS, []);

  const lastBotId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].sender === 'bot') return messages[i].id;
    }
    return null;
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Synthesis rendering wrapper
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
      // Don't clear pendingChatRef here - let the abort useEffect handle it
      // pendingChatRef.current = null;
    } else {
      setMessages([]);
    }
    setTimeout(() => {
      isLoadingChatRef.current = false;
    }, 100);
  }, [chatId]);

  // Auto-scroll and syntax highlighting on message updates
  useEffect(() => {
    // Cleanup on unmount: abort any in-flight stream
    return () => {
      if (currentAbortRef.current) {
        try {
          currentAbortRef.current.abort();
        } catch {}
        currentAbortRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    console.log('[UI] chatId useEffect fired', { 
      chatId, 
      isLoading, 
      hasAbortController: !!currentAbortRef.current,
      pendingChatId: pendingChatRef.current?.id,
      doIdsMatch: pendingChatRef.current?.id === chatId,
      shouldAbort: isLoading && currentAbortRef.current && !(pendingChatRef.current && pendingChatRef.current.id === chatId)
    });
    
    if (isLoading && currentAbortRef.current) {
      if (pendingChatRef.current && pendingChatRef.current.id === chatId) {
        console.log('[UI] This is a new chat we just created, NOT aborting. Clearing pendingChatRef.');
        pendingChatRef.current = null; 
        return; 
      }
      
      console.log('[UI] Aborting stream due to chatId change', {
        reason: 'chatId changed but not matching pending',
        pendingId: pendingChatRef.current?.id,
        newChatId: chatId,
        comparison: `"${pendingChatRef.current?.id}" === "${chatId}" = ${pendingChatRef.current?.id === chatId}`
      });
      try {
        currentAbortRef.current.abort();
        currentAbortRef.current = null;
        setIsLoading(false);
        // Remove incomplete bot message
        setMessages((currentMessages) => {
          const lastMsg = currentMessages[currentMessages.length - 1];
          if (lastMsg && lastMsg.sender === 'bot' && !lastMsg.text) {
            return currentMessages.slice(0, -1);
          }
          return currentMessages;
        });
      } catch {}
    }
  }, [chatId]);

  useEffect(() => {
    if (chatId && messages.length > 0 && !isLoadingChatRef.current) {
      persistChats((chats) => {
        const chatIndex = chats.findIndex((chat) => chat.id === chatId);
        if (chatIndex !== -1) {
          chats[chatIndex].messages = messages;
        }
        return chats;
      });
      
      // Save formatted chat data for database
      saveChatToDatabase(chatId);
    }
  }, [messages, chatId]);

  const handleSendMessage = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    
    console.log('[UI] handleSendMessage called', { 
      hasInput: !!input?.trim(), 
      inputValue: input,
      isLoading, 
      chatId,
      modelsState: selectedModels 
    });
    
    if (!input || !input.trim()) {
      console.log('[UI] Empty input, returning');
      return;
    }

    const activeModels = modelOptions
      .filter((opt) => selectedModels[opt.key])
      .map((opt) => opt.key);

    console.log('[UI] Active models:', activeModels, 'from selectedModels:', selectedModels);

    if (!activeModels.length) {
      console.warn('[UI] No models selected!');
      return;
    }

    const userMessage = { id: Date.now(), text: input, sender: 'user' };
    const nextMessages = [...messages, userMessage];
    const savedInput = input;

    let currentChatId = chatId;
    let isNewChat = false;
    if (!chatId) {
      const newChatId = `chat-${Date.now()}`;
      currentChatId = newChatId;
      isNewChat = true;
      
      console.log('[UI] Creating new chat', { newChatId });
      
      // Set pending chat ref FIRST before navigation
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
 
    if (currentAbortRef.current) {
      try { currentAbortRef.current.abort(); } catch {}
    }
    const abortController = new AbortController();
    currentAbortRef.current = abortController;

    const startTs = performance.now();
    let firstModelMs = null;
    let synthesisMs = null;

    // Collect all responses as they stream in
    const allResponses = {};

    try {
      await streamChat(
        savedInput,
        activeModels,
 
        (modelData) => {
          const { model, response } = modelData;
          allResponses[model.toLowerCase()] = response;

          if (firstModelMs === null) {
            firstModelMs = performance.now() - startTs;
          }


          setMessages((currentMessages) => {
            const existingBotMessage = currentMessages.find(
              (m) => m.sender === 'bot' && m.id === userMessage.id + 1
            );

            if (existingBotMessage) {
              return currentMessages.map((m) =>
                m.id === existingBotMessage.id
                  ? {
                      ...m,
                      allResponses: { ...m.allResponses, ...allResponses },
                    }
                  : m
              );
            } else {

              const newBotMessage = {
                id: userMessage.id + 1,
                text: null,
                sender: 'bot',
                model: 'Threadwork AI',
                allResponses: allResponses,
              };
              return [...currentMessages, newBotMessage];
            }
          });
        },
  
        (synthesisData) => {
          const { response } = synthesisData;
          synthesisMs = performance.now() - startTs;

          setMessages((currentMessages) => {
            const existingBot = currentMessages.find(
              (m) => m.sender === 'bot' && m.id === userMessage.id + 1
            );

            if (existingBot) {
              return currentMessages.map((m) =>
                m.sender === 'bot' && m.id === userMessage.id + 1
                  ? {
                      ...m,
                      text: response,
                      allResponses: allResponses,
                    }
                  : m
              );
            }

            // If no bot message exists yet (edge case), create it now
            const newBotMessage = {
              id: userMessage.id + 1,
              text: response,
              sender: 'bot',
              model: 'Threadwork AI',
              allResponses: allResponses,
            };
            return [...currentMessages, newBotMessage];
          });
        },
        // onDone - stream complete
        () => {
          setIsLoading(false);
          setMessages((currentMessages) => {
            const merged = currentMessages.map((m) => {
              if (m.sender === 'bot' && m.id === userMessage.id + 1) {
                return {
                  ...m,
                  timings: {
                    firstModelMs: firstModelMs,
                    synthesisMs: synthesisMs,
                    totalMs: performance.now() - startTs,
                  },
                };
              }
              return m;
            });

            persistChats((chats) => {
              const chatIndex = chats.findIndex((chat) => chat.id === currentChatId);
              if (chatIndex !== -1) {
                chats[chatIndex].messages = merged;
              }
              return chats;
            });

            saveChatToDatabase(currentChatId);
            return merged;
          });
        },
        // onError - handle error
        (error) => {
          console.log('[UI] error', error);
          if (error?.name === 'AbortError') {
            setIsLoading(false);
            return;
          }
          console.error('Stream error:', error);
          setIsLoading(false);
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
            saveChatToDatabase(currentChatId);
            return merged;
          });
        }
      , abortController.signal);
    } catch (err) {
      if (err?.name === 'AbortError') {
        setIsLoading(false);
        return;
      }
      console.error('Chat error:', err);
      setIsLoading(false);
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
        saveChatToDatabase(currentChatId);
        return merged;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelStream = () => {
    try {
      if (currentAbortRef.current) {
        currentAbortRef.current.abort();
        currentAbortRef.current = null;
        setIsLoading(false);
        setMessages((currentMessages) => {
          const lastMsg = currentMessages[currentMessages.length - 1];
          if (lastMsg && lastMsg.sender === 'bot' && !lastMsg.text) {
            // Remove incomplete bot message
            return currentMessages.slice(0, -1);
          }
          return currentMessages;
        });
      }
    } catch {}
  };

  return (
    <>
      <ModelSelector
        selectedModels={selectedModels}
        setSelectedModels={setSelectedModels}
        modelOptions={modelOptions}
        maxSelected={4}
      />

      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-3 py-6 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Threadwork AI</p>
              <h1 className="text-2xl font-semibold text-gray-900">Unified Intelligence Engine</h1>
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
                    <div className="flex gap-6">
                      {message.allResponses && Object.keys(message.allResponses || {}).length > 0 && (
                        <div className="flex-[0.75] max-w-xl space-y-4">
                          {[
                            MODEL_STYLES.deepseek,
                            MODEL_STYLES.llama,
                            MODEL_STYLES.glm,
                            MODEL_STYLES.qwen,
                            MODEL_STYLES.essential,
                            MODEL_STYLES.moonshot,
                          ]
                            .filter((item) => message.allResponses[item.key])
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

                      <div className="flex-[2.25]">
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 rounded-xl rounded-bl-none h-fit shadow-sm" key={`detail-${message.id}`}>
                          {message.text ? (
                            <Collapsible
                              defaultOpen={message.id === lastBotId}
                              titleClassName="px-4 py-3 text-xs font-bold text-indigo-700 uppercase tracking-wider font-mono"
                              title={<span className="flex items-center gap-3">
                                <span className="text-emerald-600">✓</span>
                                {message.model ? message.model : 'Threadwork AI'}
                                {message.timings && (
                                  <span className="ml-auto flex items-center gap-2 text-[10px] text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                    <span>first: {Math.round(message.timings.firstModelMs)}ms</span>
                                    <span>syn: {Math.round(message.timings.synthesisMs || 0)}ms</span>
                                    <span>total: {Math.round(message.timings.totalMs)}ms</span>
                                  </span>
                                )}
                              </span>}
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

      <div className="border-t border-gray-200 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
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
            {isLoading && (
              <button
                type="button"
                onClick={handleCancelStream}
                className="px-4 py-3 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

export default HomePage;