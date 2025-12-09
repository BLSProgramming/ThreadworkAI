import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiLightningBolt } from '../assets/Icons';

function HomePage() {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const persistChats = (updater) => {
    const chats = JSON.parse(localStorage.getItem('chats') || '[]');
    const updated = updater(chats);
    localStorage.setItem('chats', JSON.stringify(updated));
    // Notify navbar to refresh
    window.dispatchEvent(new Event('chats-updated'));
    return updated;
  };

  // Load messages for current chat
  useEffect(() => {
    if (chatId) {
      const chats = JSON.parse(localStorage.getItem('chats') || '[]');
      const currentChat = chats.find(chat => chat.id === chatId);
      if (currentChat && currentChat.messages) {
        setMessages(currentChat.messages);
      } else {
        setMessages([]);
      }
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (chatId) {
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

    // If no chat is selected, create a new one
    if (!chatId) {
      const newChatId = `chat-${Date.now()}`;
      const chats = JSON.parse(localStorage.getItem('chats') || '[]');
      const newChat = {
        id: newChatId,
        title: input.substring(0, 30) || 'New Chat',
        createdAt: new Date().toISOString(),
        messages: []
      };
      chats.unshift(newChat);
      localStorage.setItem('chats', JSON.stringify(chats));
      navigate(`/chat/${newChatId}`);
      return;
    }

    // Add user message to chat
    const userMessage = { id: Date.now(), text: input, sender: 'user' };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);

    // Update chat title on first message
    persistChats((chats) => {
      const chatIndex = chats.findIndex((chat) => chat.id === chatId);
      if (chatIndex !== -1) {
        const chat = chats[chatIndex];
        chat.messages = nextMessages;
        if (!chat.title || chat.title === 'New Chat') {
          chat.title = userMessage.text.substring(0, 30) || 'New Chat';
        }
      }
      return chats;
    });

    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (response.ok) {
        const data = await response.json();
        let botMessages = [];
        if (data.responses && Array.isArray(data.responses)) {
          // Extract only the GPT-OSS response (the synthesized answer)
          const gptOssResponse = data.responses.find((response) => response.model === 'GPT-OSS');
          
          if (gptOssResponse) {
            botMessages = [{
              id: Date.now() + Math.random(),
              text: gptOssResponse.response || 'No response',
              sender: 'bot',
              model: 'Threadwork AI',
            }];
          } else {
            // Fallback if GPT-OSS response is not available
            botMessages = [{ 
              id: Date.now() + 1, 
              text: 'No response received', 
              sender: 'bot' 
            }];
          }
        } else {
          botMessages = [{ id: Date.now() + 1, text: 'No response received', sender: 'bot' }];
        }
        const merged = [...nextMessages, ...botMessages];
        setMessages(merged);
        persistChats((chats) => {
          const chatIndex = chats.findIndex((chat) => chat.id === chatId);
          if (chatIndex !== -1) {
            chats[chatIndex].messages = merged;
          }
          return chats;
        });
      } else {
        const botMessage = { id: Date.now() + 1, text: 'Error: Could not get response', sender: 'bot' };
        const merged = [...nextMessages, botMessage];
        setMessages(merged);
        persistChats((chats) => {
          const chatIndex = chats.findIndex((chat) => chat.id === chatId);
          if (chatIndex !== -1) {
            chats[chatIndex].messages = merged;
          }
          return chats;
        });
      }
    } catch (err) {
      const botMessage = { id: Date.now() + 1, text: 'Network error. Please try again.', sender: 'bot' };
      const merged = [...nextMessages, botMessage];
      setMessages(merged);
      persistChats((chats) => {
        const chatIndex = chats.findIndex((chat) => chat.id === chatId);
        if (chatIndex !== -1) {
          chats[chatIndex].messages = merged;
        }
        return chats;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {messages.length === 0 ? (
            // Empty state
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                <HiLightningBolt className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Threadwork</h2>
              <p className="text-gray-600 max-w-md">Start a conversation or ask a question to get started</p>
            </div>
          ) : (
            // Messages
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-2xl px-4 py-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-900 rounded-bl-none'
                    }`}
                  >
                    {message.model && (
                      <p className="text-xs font-semibold text-indigo-600 mb-3 uppercase tracking-wider">✓ {message.model}</p>
                    )}
                    {message.sender === 'bot' ? (
                      <div className="space-y-3 text-gray-900">
                        {message.text.split('\n').map((line, idx) => {
                          const trimmed = line.trim();
                          
                          // Skip empty lines
                          if (!trimmed) {
                            return <div key={idx} className="h-1" />;
                          }
                          
                          // Remove leading asterisks and markdown formatting
                          let cleanedLine = trimmed
                            .replace(/^\*\*/, '')
                            .replace(/\*\*$/, '')
                            .replace(/^\*/, '')
                            .replace(/\*$/, '')
                            .replace(/^#+\s+/, '');
                          
                          // Detect headers (lines with colons, or markdown headers)
                          if (trimmed.endsWith(':') || /^#{1,3}\s/.test(trimmed)) {
                            return (
                              <h3 key={idx} className="font-bold text-gray-900 text-base mt-4 mb-2">
                                {cleanedLine.replace(/:$/, '')}
                              </h3>
                            );
                          }
                          
                          // Detect numbered lists
                          const numberedMatch = cleanedLine.match(/^(\d+)\.\s+(.+)/);
                          if (numberedMatch) {
                            return (
                              <div key={idx} className="ml-4 my-2 text-sm text-gray-800">
                                <span className="font-semibold text-indigo-600">{numberedMatch[1]}.</span>
                                <span className="ml-2">{numberedMatch[2]}</span>
                              </div>
                            );
                          }
                          
                          // Detect bullet lists
                          const bulletMatch = cleanedLine.match(/^[\-\•]\s+(.+)/);
                          if (bulletMatch) {
                            return (
                              <div key={idx} className="ml-4 my-2 text-sm text-gray-800 flex gap-2">
                                <span className="text-indigo-600 font-semibold">•</span>
                                <span>{bulletMatch[1]}</span>
                              </div>
                            );
                          }
                          
                          // Regular paragraph
                          return (
                            <p key={idx} className="text-sm leading-relaxed text-gray-800">
                              {cleanedLine}
                            </p>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed">{message.text}</p>
                    )}
                  </div>
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

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4">
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